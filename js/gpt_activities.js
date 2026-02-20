// gpt_activities.js
window.GPT_AGENT = window.GPT_AGENT || {};

// ==================== معالج أسئلة الأنشطة - الإصدار الأصلي ====================
async function handleActivityQuery(query, questionType, preComputedContext, preComputedEntities) {
    if (typeof masterActivityDB === 'undefined') {
        return "⚠️ نظام البحث عن الأنشطة غير متوفر حالياً.";
    }

    // ⭐ استخدام البيانات المحسوبة إن وُجدت
    const entities = preComputedEntities || extractEntities(query);
    const context = preComputedContext || analyzeContext(query, questionType);
    const agentContext = AgentMemory.getContext();

    console.log("📋 معالج الأنشطة - سؤال:", query);
    console.log("🎯 الكيانات المستخدمة:", entities);

    // ════════════════════════════════════════════════════════════
    // 🔍 المرحلة 1: البحث الدلالي (hybridEngine) + النصي (NeuralSearch)
    // ════════════════════════════════════════════════════════════

    let semanticResults = [];
    let keywordResults  = [];

    // أ. البحث الدلالي — نستخدم hybridEngine.search() ونصفّي نتائج activities فقط
    if (window.hybridEngine && window.hybridEngine.isReady) {
        try {
            const semanticResponse = await window.hybridEngine.search(query);
            // نأخذ فقط النتائج المصنّفة كـ activities من القاعدة الموحدة
            
            semanticResults = semanticResponse?.resultsByDB?.['activities'] || [];
            console.log(`🧠 نتائج دلالية (activities): ${semanticResults.length}`);
        } catch (e) {
            console.warn("⚠️ فشل البحث الدلالي:", e.message);
        }
    }

    // ب. البحث النصي — NeuralSearch دالة عادية تُستدعى مباشرةً
    if (typeof NeuralSearch === 'function') {
        try {
            const contextBoost = ContextManager.getContextualBoost(query, 'activities');
            const nsResult = NeuralSearch(query, masterActivityDB, {
                minScore: contextBoost.boost > 1 ? 20 : 30
            });
            keywordResults = nsResult?.results || [];
            console.log(`🔤 نتائج نصية (activities): ${keywordResults.length}`);
        } catch (e) {
            console.warn("⚠️ فشل البحث النصي:", e.message);
        }
    }

    // ════════════════════════════════════════════════════════════
    // 🏆 المرحلة 2: دمج النتائج بالـ Reranker أو Fallback
    // ════════════════════════════════════════════════════════════

    let finalResults = [];

    if (window.resultReranker && (semanticResults.length > 0 || keywordResults.length > 0)) {
        finalResults = window.resultReranker.rerank(
            semanticResults,
            keywordResults,
            query,
            agentContext
        );
        console.log(`✨ نتائج بعد Reranking: ${finalResults.length}`);
    } else if (keywordResults.length > 0) {
        // Fallback: البحث النصي فقط إذا لم يكن المحرك الدلالي أو Reranker متاحاً
        finalResults = keywordResults;
        console.log("⚠️ Fallback: استخدام النتائج النصية فقط");
    }

    // ════════════════════════════════════════════════════════════
    // 🎯 المرحلة 3: منطق القرار — لم يتغيّر
    // ════════════════════════════════════════════════════════════

    if (finalResults && finalResults.length > 0) {
        const topResult = finalResults[0];

        console.log(`🎯 النتيجة الأولى: "${topResult.text}" - نقاط: ${topResult.finalScore}`);

        // ✅ فحص: هل هناك عدة أنشطة متشابهة؟
        const similarActivities = detectSimilarActivities(query, finalResults);

        if (similarActivities.length > 1) {
            console.log(`🔍 عثرت على ${similarActivities.length} أنشطة متشابهة`);
            AgentMemory.setClarification(similarActivities.map(r => ({
                type: 'activity',
                name: r.text,
                data: r
            })));
            return formatSimilarActivitiesChoice(query, similarActivities);
        }

        // ✅ ثقة عالية جداً (950+)
        if (topResult.finalScore > 950) {
            await AgentMemory.setActivity(topResult, query);
            return formatActivityResponse(topResult, questionType);
        }

        // ✅ ثقة عالية (800+) والفارق كبير مع الثانية
        if (topResult.finalScore > 800) {
            if (finalResults.length === 1) {
                await AgentMemory.setActivity(topResult, query);
                return formatActivityResponse(topResult, questionType);
            }
            const scoreDiff = topResult.finalScore - finalResults[1].finalScore;
            if (scoreDiff > 200) {
                await AgentMemory.setActivity(topResult, query);
                return formatActivityResponse(topResult, questionType);
            }
        }

        // ✅ ثقة متوسطة مع وجود أكثر من نتيجة
        if (finalResults.length > 1 && topResult.finalScore > 300) {
            const topResults = finalResults.slice(0, 3);
            AgentMemory.setClarification(topResults.map(r => ({
                type: 'activity',
                name: r.text,
                data: r
            })));
            let html = `🤔 <strong>عثرت على نتائج متشابهة، أيهم تقصد؟</strong><br><br>`;
            topResults.forEach((r, i) => {
                html += `<div class="choice-btn" onclick="resolveAmbiguity('activity', ${i})">
                    <span class="choice-icon">📋</span> ${r.text}
                </div>`;
            });
            return html;
        }

        await AgentMemory.setActivity(topResult, query);
        return formatActivityResponse(topResult, questionType);
    }

    return null;
}
// ==================== 🆕 كاشف الأنشطة المتشابهة ====================
function detectSimilarActivities(query, results) {
    if (!results || results.length <= 1) return results;

    const q = normalizeArabic(query);
    const queryWords = q.split(/\s+/).filter(w => w.length > 2);

    console.log(`🔍 فحص التشابه - كلمات البحث: ${queryWords.join(', ')}`);

    // ✅ استخراج الكلمات المفتاحية الرئيسية
    const keyWords = queryWords.filter(word => {
        // استبعاد كلمات عامة جداً
        const commonWords = ['ماهي', 'ما هي', 'ايه هي', 'اية هي', 'ايه هى', 'اية هى', 'ما هو', 'ماهو ', 'تراخيص', 'ترخيص', 'نشاط', 'مطلوب', 'شروط', 'كيف', 'خطوات', 'اجراءات', 'عرض', 'اظهر', 'تفاصيل'];
        return !commonWords.includes(word);
    });

    if (keyWords.length === 0) return [results[0]];

    console.log(`🎯 الكلمات المفتاحية: ${keyWords.join(', ')}`);

    // ✅ البحث عن أنشطة تحتوي على نفس الكلمات المفتاحية
    const similar = [];

    for (const result of results) {
        const resultText = normalizeArabic(result.text);
        let matchCount = 0;

        for (const key of keyWords) {
            if (resultText.includes(key)) {
                matchCount++;
            }
        }

        // ✅ إذا طابق 70% أو أكثر من الكلمات المفتاحية
        const matchPercentage = (matchCount / keyWords.length) * 100;

        if (matchPercentage >= 70) {
            similar.push({
                ...result,
                matchPercentage: matchPercentage,
                matchedWords: matchCount
            });

            console.log(`✅ تطابق: "${result.text}" - ${Math.round(matchPercentage)}% (${matchCount}/${keyWords.length} كلمات)`);
        }
    }

    // ✅ ترتيب حسب عدد الكلمات المطابقة ثم النقاط
    similar.sort((a, b) => {
        if (b.matchedWords !== a.matchedWords) {
            return b.matchedWords - a.matchedWords;
        }
        return b.finalScore - a.finalScore;
    });

    // ✅ إرجاع أفضل 5 نتائج كحد أقصى
    const topSimilar = similar.slice(0, 5);

    console.log(`📊 النتيجة النهائية: ${topSimilar.length} نشاط متشابه`);

    return topSimilar;
}

// ==================== 🆕 عرض خيارات الأنشطة المتشابهة ====================
function formatSimilarActivitiesChoice(query, activities) {
    let html = `<div class="info-card" style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-left-color: #ff9800;">
        <div class="info-card-header" style="color: #e65100;">
            🔍 عثرت على ${activities.length} أنشطة تحتوي على: "${query}"
        </div>
        <div class="info-card-content" style="color: #bf360c;">
            يرجى اختيار النشاط المطلوب بالضبط:
        </div>
    </div>
    <div style="margin-top: 12px;">`;

    activities.forEach((activity, i) => {
        const matchInfo = activity.matchPercentage
            ? `<small style="color: #666;"> • تطابق ${Math.round(activity.matchPercentage)}%</small>`
            : '';

        html += `<div class="choice-btn" onclick="resolveAmbiguity('activity', ${i})" style="margin: 8px 0; padding: 12px 16px; text-align: right;">
            <span class="choice-icon">📋</span>
            <div style="display: inline-block; width: calc(100% - 40px);">
                <strong>${activity.text}</strong>
                ${matchInfo}
            </div>
        </div>`;
    });

    html += `</div>
    <div style="margin-top: 12px; padding: 10px; background: #e3f2fd; border-radius: 8px; font-size: 0.85rem; color: #0d47a1;">
        💡 اختر النشاط الذي يطابق احتياجك بالضبط للحصول على التراخيص الصحيحة
    </div>`;

    return html;
}

// ==================== دالة تنسيق رد النشاط الأساسية ====================
function formatActivityResponse(activity, questionType) {
    // ✅ استخراج details من أي هيكل: مسطّح (NeuralSearch) أو متداخل (HybridSearch/Reranker)
    const details = activity.details
        || activity.data?.original_data?.details
        || activity.data?.details
        || {};

    let html = `<div class="info-card">
        <div class="info-card-header">
            📋 ${activity.text}
        </div>
        <div class="info-card-content">`;

    if (details.act) {
        html += `<div class="info-row">
            <div class="info-label">📄 الوصف:</div>
            <div class="info-value">${details.act}</div>
        </div>`;
    }

    // عرض التراخيص كاملة (بدون اختصار)
    if (details.req) {
        html += `<div class="info-row">
            <div class="info-label">📝 التراخيص:</div>
            <div class="info-value">${details.req}</div>
        </div>`;
    }

    // إضافة الجهة المصدرة إذا كانت متوفرة
    if (details.auth) {
        html += `<div class="info-row">
            <div class="info-label">🏛️ الجهة المُصدرة:</div>
            <div class="info-value">${details.auth}</div>
        </div>`;
    }

    html += `</div></div>`;

    // فحص القرار 104 (يتم عبر الدالة الموجودة في gpt_decision104.js)
    if (window.checkDecision104Full) {
        const decision104Info = window.checkDecision104Full(activity.text);
        if (decision104Info) {
            html += decision104Info;
        }
    }

    // الدليل والرابط
    if (details.guid || details.link) {
        html += `<div style="margin-top: 12px;">`;
        if (details.guid) {
            html += `<div style="background: #fff3e0; padding: 10px; border-radius: 8px; margin-bottom: 8px;">
                📚 <strong>الدليل:</strong> ${details.guid}
            </div>`;
        }
        if (details.link) {
            html += `<a href="${details.link}" target="_blank" class="link-btn">
                <i class="fas fa-file-download"></i> تحميل دليل الترخيص
            </a>`;
        }
        html += `</div>`;
    }

    html += `<div style="margin-top: 12px; padding: 10px; background: #f0f9ff; border-radius: 8px; font-size: 0.85rem; color: #0369a1;">
        💡 اسألني عن: التراخيص، الجهة المُصدرة ، السند التشريعي ، الموقع الملائم، الملاحظات الفنية لفريق اللجنة
    </div>`;

    return html;
}

// ==================== دوال التنسيق الفرعية ====================
function formatLicensesDetailed(activity) {
    // ✅ استخراج details من أي هيكل: مسطّح (NeuralSearch) أو متداخل (HybridSearch/Reranker)
    const details = activity.details
        || activity.data?.original_data?.details
        || activity.data?.details
        || {};
    let html = `<div class="license-card">
        <div class="license-title">📝 التراخيص المطلوبة لـ: ${activity.text}</div>
        <div class="license-list">`;

    if (details.req) {
        html += `<strong>المتطلبات الأساسية:</strong><br>${details.req}<br><br>`;
    }

    if (activity.dynamicLicenseFields && activity.dynamicLicenseFields.length > 0) {
        html += `<strong>قائمة التراخيص التفصيلية:</strong><br>`;
        activity.dynamicLicenseFields.forEach((lic, i) => {
            html += `${i + 1}. ${lic.name}${lic.required ? ' <strong>(إلزامي)</strong>' : ''}<br>`;
        });
    }

    html += `</div></div>`;

    if (details.link) {
        html += `<a href="${details.link}" target="_blank" class="link-btn">
            <i class="fas fa-file-pdf"></i> تحميل دليل التراخيص الكامل
        </a>`;
    }

    return html;
}

function formatAuthority(details) {
    if (!details.auth) {
        return "⚠️ معلومات الجهة المُصدرة غير متوفرة حالياً.";
    }
    return `<div class="info-card">
        <div class="info-card-header">🏛️ الجهة المُصدرة للتراخيص</div>
        <div class="info-card-content">${details.auth}</div>
    </div>`;
}

function formatLegislation(details) {
    if (!details.leg) {
        return "⚠️ معلومات السند التشريعي غير متوفرة حالياً.";
    }
    return `<div class="info-card" style="background: linear-gradient(135deg, #fff9c4 0%, #fffde7 100%); border-left-color: #f57f17;">
        <div class="info-card-header" style="color: #f57f17;">⚖️ السند التشريعي</div>
        <div class="info-card-content" style="color: #e65100;">${details.leg}</div>
    </div>`;
}

function formatGuideInfo(details) {
    let html = '';
    if (details.guid) {
        html += `<div class="info-card">
            <div class="info-card-header">📚 دليل الترخيص</div>
            <div class="info-card-content">
                <strong>اسم الدليل:</strong><br>${details.guid}
            </div>
        </div>`;
    }
    if (details.link) {
        html += `<a href="${details.link}" target="_blank" class="link-btn">
            <i class="fas fa-download"></i> تحميل الدليل الكامل (PDF)
        </a>`;
    }
    if (!html) return "⚠️ معلومات الدليل غير متوفرة حالياً.";
    return html;
}

function formatTechnicalNotes(activity) {
    if (!activity.technicalNotes) {
        return "⚠️ الملاحظات الفنية غير متوفرة لهذا النشاط حالياً.";
    }
    return `<div class="tech-notes">
        <div class="tech-notes-title">🔧 ملاحظات فنية هامة لفريق اللجنة</div>
        <div class="tech-notes-content">${activity.technicalNotes}</div>
    </div>
    <div style="margin-top: 8px; padding: 8px; background: #fef3c7; border-radius: 6px; font-size: 0.85rem; color: #92400e;">
        ⚠️ هذه الملاحظات ضرورية عند المعاينة الميدانية
    </div>`;
}

function formatSuitableLocation(details) {
    if (!details.loc) {
        return "⚠️ معلومات الموقع الملائم غير متوفرة حالياً.";
    }
    return `<div class="info-card" style="background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%); border-left-color: #c2185b;">
        <div class="info-card-header" style="color: #880e4f;">📍 الموقع الملائم لممارسة النشاط</div>
        <div class="info-card-content" style="color: #ad1457;">${details.loc}</div>
    </div>`;
}

// ==================== تصدير الدوال العامة ====================
window.handleActivityQuery = handleActivityQuery;
window.formatActivityResponse = formatActivityResponse;
window.formatLicensesDetailed = formatLicensesDetailed;
window.formatAuthority = formatAuthority;
window.formatLegislation = formatLegislation;
window.formatGuideInfo = formatGuideInfo;
window.formatTechnicalNotes = formatTechnicalNotes;
window.formatSuitableLocation = formatSuitableLocation;
window.detectSimilarActivities = detectSimilarActivities;
window.formatSimilarActivitiesChoice = formatSimilarActivitiesChoice;


console.log('✅ gpt_activities.js - تم تحميله بنجاح (مستقل تماماً)');
