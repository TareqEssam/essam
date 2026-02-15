// gpt_areas.js
window.GPT_AGENT = window.GPT_AGENT || {};


// ==================== دالة اختيار أفضل جهة ولاية ====================
function getBestMatchingDependency(query, candidates) {
    if (!candidates || candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    const q = normalizeArabic(query);
    let best = { name: null, score: 0 };

    candidates.forEach(dep => {
        const normalizedDep = normalizeArabic(dep);
        const depWords = normalizedDep.split(/\s+/).filter(w => w.length > 2);
        const qWords = q.split(/\s+/).filter(w => w.length > 2);
        if (depWords.length === 0) return;

        let matchCount = 0;
        depWords.forEach(dw => {
            for (let qw of qWords) {
                if (qw.includes(dw) || dw.includes(qw)) {
                    matchCount++;
                    break;
                }
            }
        });
        const score = (matchCount / depWords.length) * 100;
        if (score > best.score) {
            best = { name: dep, score };
        }
    });

    return best.name || candidates[0];
}
// ==================== معالج أسئلة المناطق الصناعية - الإصدار المصحح ✅ ====================
async function handleIndustrialQuery(query, questionType, preComputedContext, preComputedEntities) {
    if (typeof industrialAreasData === 'undefined') {
        return "⚠️ قاعدة بيانات المناطق الصناعية غير متوفرة حالياً.";
    }

    const q = normalizeArabic(query);
    const keywords = extractKeywords(query);
    const totalAreas = industrialAreasData.length;

    // ⭐ استخدام البيانات المحسوبة إن وُجدت
    const entities = preComputedEntities || window.extractEntities(query);

    console.log("🏭 معالج المناطق - سؤال:", query);
    // 🆕 فحص إذا كان السؤال عن تفاصيل منطقة محددة
    if (/تفاصيل المنطقة الصناعية (.+)/.test(query)) {
        const match = query.match(/تفاصيل المنطقة الصناعية (.+)/);
        if (match && match[1]) {
            const areaName = match[1].trim();
            console.log("📋 طلب تفاصيل المنطقة:", areaName);
            const exactArea = industrialAreasData.find(area =>
                normalizeArabic(area.name) === normalizeArabic(areaName) ||
                area.name === areaName
            );
            if (exactArea) {
                console.log("✅ تم العثور على المنطقة:", exactArea.name);
                return formatSingleAreaResponse(exactArea, areaName);
            }
        }
    }
    console.log("🎯 الكيانات المستخدمة:", entities);

    // === المستوى 1: الأسئلة المحددة بوضوح ===

    // 1. السؤال العام عن عدد المناطق الصناعية
    if (questionType.isGeneralAreaCount) {
        console.log("📊 سؤال عام عن عدد المناطق");
        return formatGeneralCountWithOptions(totalAreas);
    }

    // 2. 🆕 سؤال Yes/No عن وجود منطقة معينة
    if (questionType.isYesNo && questionType.isAreaExistenceCheck) {
        console.log("❓ سؤال Yes/No عن وجود منطقة");
        return handleAreaExistenceQuestion(query, entities, q, keywords);
    }

    // 3. سؤال عن موقع منطقة محددة
    if (questionType.isLocation && entities.hasAreaName) {
        console.log("📍 سؤال عن موقع منطقة محددة");
        const area = industrialAreasData.find(a => a.name === entities.areaNames[0].name);
        if (area) {
            await AgentMemory.setIndustrial(area, query);
            return formatIndustrialMapLink(area);
        }
    }

    // === المستوى 2: الأسئلة عن العدد ===

    // 4. السؤال عن عدد المناطق في محافظة معينة
    if (questionType.isSpecificAreaCount && entities.hasGovernorate) {
        console.log("📍 سؤال عن عدد المناطق في محافظة");
        const gov = entities.governorates[0];
        const count = industrialAreasData.filter(a => a.governorate === gov).length;
        if (count > 0) {
            return `📢 <strong>عدد المناطق الصناعية في محافظة ${gov}:</strong> ${count} منطقة
                <div style="margin-top: 10px; padding: 8px; background: #f0f9ff; border-radius: 8px; font-size: 0.85rem; color: #0369a1;">
                    💡 يمكنك سؤالي: "ما هي المناطق الصناعية في ${gov}؟"
                </div>`;
        }
    }

    // 5. 🆕 السؤال عن عدد المناطق التابعة لجهة معينة
    if (questionType.isSpecificAreaCount && entities.hasDependency) {
    console.log("🏛️ ✅✅✅ دخلت شرط عدد المناطق التابعة لجهة");
    const bestDep = getBestMatchingDependency(query, entities.dependencies);
    const count = industrialAreasData.filter(a => a.dependency === bestDep).length;
    if (count > 0) {
        return `📊 <strong>عدد المناطق الصناعية التابعة لـ ${bestDep}:</strong> ${count} منطقة ...`;
    } else {
        const allDeps = [...new Set(industrialAreasData.map(a => a.dependency))];
        return formatDependencyChoices(allDeps);
    }
}

    console.log("⚠️ لم يدخل شرط عدد المناطق التابعة لجهة");
    console.log("🔍 سبب محتمل: questionType.isSpecificAreaCount =", questionType.isSpecificAreaCount);
    console.log("🔍 سبب محتمل: entities.hasDependency =", entities.hasDependency);

    // 6. 🆕 السؤال عن عدد الجهات أو المحافظات
    if (questionType.isCount && (q.includes('جهه') || q.includes('محافظه')) && !entities.hasGovernorate && !entities.hasDependency) {
        console.log("📊 سؤال عن عدد الجهات/المحافظات");
        if (q.includes('جهه') || q.includes('جهة') || q.includes('ولاية')) {
            const deps = [...new Set(industrialAreasData.map(a => a.dependency))];
            return formatDependenciesCount(deps);
        }
        if (q.includes('محافظه') || q.includes('محافظة')) {
            const govs = [...new Set(industrialAreasData.map(a => a.governorate))];
            return formatGovernoratesCount(govs);
        }
    }

    // === المستوى 3: الأسئلة عن القوائم ===

    // 7. السؤال عن قائمة المناطق التابعة لجهة (تم وضعه أولاً)
if ((questionType.isAreaList || questionType.isList) && entities.hasDependency) {
    console.log("📋 ✅✅✅ دخلت شرط قائمة المناطق التابعة لجهة");
    const bestDep = getBestMatchingDependency(query, entities.dependencies);
    const areas = industrialAreasData.filter(a => a.dependency === bestDep);
    if (areas.length > 0) {
        return formatAreasListByDependency(bestDep, areas);
    }
}

// 8. السؤال عن قائمة المناطق في محافظة (يأتي بعد التبعية)
if (questionType.isAreaList && entities.hasGovernorate) {
    console.log("🗺️ سؤال عن قائمة المناطق في محافظة");
    const gov = entities.governorates[0];
    const areas = industrialAreasData.filter(a => a.governorate === gov);
    if (areas.length > 0) {
        return formatAreasListByGovernorate(gov, areas);
    }
}

    // 9. 🆕 عرض كل المناطق
    if ((questionType.isList || q.includes('جميع') || q.includes('كل')) && questionType.isIndustrial) {
        console.log("📋 طلب عرض كل المناطق");
        return formatAllAreasList();
    }

    // === المستوى 4: البحث عن منطقة محددة ===

    // 10. 🆕 إذا وُجد اسم منطقة في الكيانات
    if (entities.hasAreaName) {
        console.log("📍 وُجد اسم منطقة في الكيانات");
        if (entities.areaNames.length === 1 && entities.areaNames[0].confidence >= 80) {
            const areaName = entities.areaNames[0].name;
            const area = industrialAreasData.find(a => a.name === areaName);
            if (area) {
                await AgentMemory.setIndustrial(area, query);
                if (questionType.isYesNo) {
                    return `✅ نعم، <strong>${area.name}</strong> هي منطقة صناعية معتمدة.`;
                }
                return formatIndustrialResponse(area);
            }
        }
        if (entities.areaNames.length > 1) {
            console.log("🤔 عدة مناطق محتملة");
            return buildMultipleAreasClarification(entities.areaNames);
        }
    }

    // 11. البحث التقليدي عن منطقة محددة باستخدام الدالة العامة
    console.log("🔍 البحث التقليدي عن منطقة");
    const foundArea = window.searchIndustrialZonesWithNeural(query);
    if (foundArea) {
        AgentMemory.setIndustrial(foundArea, query);
        if (questionType.isYesNo) {
            return `✅ نعم، <strong>${foundArea.name}</strong> هي منطقة صناعية معتمدة.`;
        }
        return formatIndustrialResponse(foundArea);
    }

    // === المستوى 5: الحالات الخاصة ===

    // 12. 🆕 سؤال عن جهة الولاية بدون تحديد منطقة
    if (questionType.isGovernanceAuthority && !entities.hasAreaName) {
        console.log("🏛️ سؤال عام عن جهات الولاية");
        const deps = [...new Set(industrialAreasData.map(a => a.dependency))];
        return formatDependencyChoices(deps);
    }

    // 13. 🆕 سؤال عن محافظة بدون تحديد
    if (questionType.isGovernorate && !entities.hasGovernorate) {
        console.log("🗺️ سؤال عام عن المحافظات");
        const govs = [...new Set(industrialAreasData.map(a => a.governorate))];
        return formatGovernorateChoices(govs);
    }

    // === المستوى 6: الخيارات الافتراضية ===

    // 14. إذا كان السؤال عن مناطق ولم نجد، نعرض خيارات
    if (questionType.isIndustrial) {
        console.log("❓ لم نجد إجابة محددة - عرض خيارات");
        return formatDefaultIndustrialOptions();
    }

    return null;
}

// ==================== 🆕 دوال مساعدة جديدة - محسّنة ✅ ====================

// ✅ دالة تنظيف الكلمات من البادئات واللواحق
function cleanSearchKeyword(keyword) {
    if (!keyword || keyword.length <= 2) return "";
    let cleaned = normalizeArabic(keyword)
        .replace(/^(ال|بال|وال|لل|فال|كال|ب)/g, '')
        .replace(/[هةىي]$/g, '')
        .trim();
    return cleaned.length > 1 ? cleaned : "";
}

// معالج أسئلة Yes/No عن وجود منطقة - النسخة الاحترافية الشاملة
function handleAreaExistenceQuestion(query, entities, normalizedQuery, keywords) {
    console.log("❓ فحص وجود منطقة:", query);

    // 1. استخدام NeuralSearch للحصول على النتائج الأولية
    const neuralResults = NeuralSearch(query, industrialAreasData, { minScore: 50 });
    const searchResults = neuralResults.results.map(r => ({
        area: r.originalData,
        confidence: Math.min(Math.round((r.finalScore / 10)), 100),
        score: r.finalScore,
        matchType: r.matches.length > 0 ? r.matches[0].type : 'unknown'
    }));

    console.log(`🔍 نتائج البحث العصبي الأولية: ${searchResults.length} منطقة`);

    // === 🧠 استخراج الكلمة المفتاحية
    const extractSearchKeyword = (q) => {
        const normalized = normalizeArabic(q);
        const skipWords = ['في', 'ب', 'بمنطقة', 'بمنطقه', 'داخل', 'نطاق', 'باسم', 'بالقرب', 'قريبة', 'قريبه', 'عند', 'بجانب', 'جنب', 'تقريبا', 'بمدينة', 'بمدينه'];
        const noiseWords = [
            'منطقه', 'منطقة', 'صناعيه', 'صناعية', 'هل', 'يوجد', 'باسم',
            'مكان', 'فين', 'اين', 'عنوان', 'اسمها', 'ب', 'بمنطقة', 'بمنطقه', 'داخل', 'نطاق', 'باسم', 'بالقرب', 'قريبة', 'قريبه', 'عند', 'بجانب', 'جنب', 'تقريبا', 'بمدينة', 'اسمه', 'الحتة', 'الحته', 'حتة', 'حته', 'اسم', 'كلمة', 'كلمه', 'عبارة', 'عباره'
        ];
        const regex = /(?:باسم|اسم|منطقة|منطقه)\s+(?:صناعيه\s+|صناعية\s+)?([\u0600-\u06FF]+)/;
        const match = normalized.match(regex);
        if (match && match[1] && !noiseWords.includes(match[1])) {
            return match[1];
        }
        const words = normalized.split(/\s+/).filter(w =>
            w.length > 2 &&
            !noiseWords.includes(w) &&
            !(window.GPT_AGENT.stopWords || []).includes(w)
        );
        return words.length > 0 ? words[0] : null;
    };

    const searchKeyword = extractSearchKeyword(query);
    const searchKeywordCleaned = cleanSearchKeyword(searchKeyword);

    console.log(`🔑 الكلمة المفتاحية المستهدفة: "${searchKeyword}" → بعد التنظيف: "${searchKeywordCleaned}"`);

    // 2. المسح الشامل في قاعدة البيانات
    let keywordFiltered = [];
    if (searchKeywordCleaned) {
        const globalMatches = industrialAreasData.filter(area => {
            const areaNameNorm = normalizeArabic(area.name);
            const areaNameWords = areaNameNorm.split(/\s+/);
            return areaNameNorm.includes(searchKeywordCleaned) ||
                   areaNameWords.some(word => cleanSearchKeyword(word).includes(searchKeywordCleaned));
        });
        keywordFiltered = globalMatches.map(area => ({
            area: area,
            confidence: 100,
            matchType: 'keyword_direct'
        }));
    }

    // دمج النتائج
    let finalSelection = [...keywordFiltered];
    searchResults.forEach(nr => {
        if (!finalSelection.some(fs => fs.area.name === nr.area.name)) {
            finalSelection.push(nr);
        }
    });

    console.log(`🎯 النتائج النهائية بعد الدمج والفلترة: ${finalSelection.length} منطقة`);

    // === [المسار أ]: التعامل مع المطابقات المؤكدة للكلمة المفتاحية
    if (keywordFiltered.length > 0) {
        if (keywordFiltered.length === 1) {
            const result = keywordFiltered[0];
            if (window.AgentMemory) window.AgentMemory.setIndustrial(result.area, query);
            const areaName = result.area.name;
            const displayName = (areaName.startsWith('المنطقة') || areaName.startsWith('منطقة')) ? areaName : `منطقة ${areaName}`;
            return `✅ <strong>نعم</strong>، <strong>${displayName}</strong> هي منطقة صناعية معتمدة.<br>
                <small style="color: #666;">📍 تقع في محافظة ${result.area.governorate}</small><br><br>
                <div class="choice-btn" onclick="selectIndustrialArea('${result.area.name.replace(/'/g, "\\'")}')">
                    <span class="choice-icon">📋</span> <strong>عرض التفاصيل الكاملة للمنطقة</strong>
                </div>
                <div style="margin-top: 10px; padding: 12px; background: #f8fafc; border-radius: 10px; border-right: 4px solid #0ea5e9; font-size: 0.85rem; color: #1e293b; line-height: 1.6;">
                    💡 <strong>يمكنك سؤالي عن:</strong><br>
                    • جهة الولاية • المحافظة • المساحة • القرار • عرض الخريطة
                </div>
                ${buildExplorationButtons()}`;
        }
        let html = `✅ <strong>نعم</strong>، وَجدتُ <strong>${keywordFiltered.length} مناطق</strong> صناعية مرتبطة بـ "${searchKeyword}":<br><br>`;
        keywordFiltered.forEach((result, i) => {
            html += `<div class="choice-btn" onclick="selectIndustrialArea('${result.area.name.replace(/'/g, "\\'")}')">
                <span class="choice-icon">${i === 0 ? '🎯' : '🏭'}</span>
                <div style="text-align: right;">
                    <strong>${result.area.name}</strong><br>
                    <small style="color: #666;">📍 المحافظة: ${result.area.governorate} • التبعية: ${result.area.dependency}</small>
                </div>
            </div>`;
        });
        html += `<div style="margin-top: 10px; font-size: 0.85rem; color: #666;">💡 اختر المنطقة التي تقصدها لعرض بياناتها الفنية بالكامل.</div>`;
        html += buildExplorationButtons();
        return html;
    }

    // === [المسار ب]: التعامل مع نتائج البحث العصبي العامة
    if (finalSelection.length === 0) {
        return `❌ <strong>لا</strong>، لم أجد منطقة صناعية بهذا الاسم في قاعدة البيانات.<br><br>
            <div style="padding: 10px; background: #fff9e6; border-radius: 8px; border-right: 3px solid #ffc107; margin-bottom: 12px;">
                💡 <strong>نصيحة:</strong> تأكد من كتابة الاسم بشكل صحيح، أو جرّب البحث باسم المحافظة لعرض كافة مناطقها.
            </div>
            ${buildExplorationButtons()}`;
    }

    if (finalSelection.length === 1) {
        const result = finalSelection[0];
        if (result.confidence >= 70) {
            if (window.AgentMemory) window.AgentMemory.setIndustrial(result.area, query);
            const areaName = result.area.name;
            const displayName = (areaName.startsWith('المنطقة') || areaName.startsWith('منطقة')) ? areaName : `منطقة ${areaName}`;
            return `✅ <strong>نعم</strong>، <strong>${displayName}</strong> هي منطقة صناعية معتمدة.<br>
                <small style="color: #666;">📍 تقع في محافظة ${result.area.governorate}</small><br><br>
                <div class="choice-btn" onclick="selectIndustrialArea('${result.area.name.replace(/'/g, "\\'")}')">
                    <span class="choice-icon">📋</span> <strong>عرض التفاصيل الكاملة للمنطقة</strong>
                </div>
                <div style="margin-top: 10px; padding: 12px; background: #f8fafc; border-radius: 10px; border-right: 4px solid #0ea5e9; font-size: 0.85rem; color: #1e293b; line-height: 1.6;">
                    💡 <strong>يمكنك سؤالي عن:</strong><br>
                    • جهة الولاية • المحافظة • المساحة • القرار • عرض الخريطة
                </div>
                ${buildExplorationButtons()}`;
        } else {
            return `⚠️ <strong>ربما تقصد:</strong> <strong>${result.area.name}</strong>؟<br>
                <small style="color: #666;">📍 ${result.area.governorate} • تطابق ${result.confidence}%</small><br><br>
                <div class="choice-btn" onclick="selectIndustrialArea('${result.area.name.replace(/'/g, "\\'")}')">
                    <span class="choice-icon">✅</span> نعم، أعرض تفاصيل هذه المنطقة
                </div>
                ${buildExplorationButtons()}`;
        }
    }

    if (finalSelection.length >= 2 && finalSelection.length <= 5) {
        if (finalSelection[0].confidence >= 85 && finalSelection[1].confidence < 60) {
            const topResult = finalSelection[0];
            return `⚠️ <strong>ربما تقصد:</strong> <strong>${topResult.area.name}</strong>؟<br>
                <small style="color: #666;">📍 ${topResult.area.governorate} • تطابق ${topResult.confidence}%</small><br><br>
                <div class="choice-btn" onclick="selectIndustrialArea('${topResult.area.name.replace(/'/g, "\\'")}')">
                    <span class="choice-icon">✅</span> نعم، هذه هي المنطقة
                </div>
                ${buildExplorationButtons()}`;
        }
        let html = `🤔 <strong>وَجدتْ ${finalSelection.length} مناطق بأسماء متشابهة:</strong><br><br>`;
        finalSelection.forEach((result, i) => {
            html += `<div class="choice-btn" onclick="selectIndustrialArea('${result.area.name.replace(/'/g, "\\'")}')">
                <span class="choice-icon">${i === 0 ? '🎯' : '🏭'}</span>
                <div style="text-align: right;">
                    <strong>${result.area.name}</strong><br>
                    <small style="color: #666;">📍 ${result.area.governorate} • ثقة البحث ${result.confidence}%</small>
                </div>
            </div>`;
        });
        html += buildExplorationButtons();
        return html;
    }

    if (finalSelection.length > 5) {
        const hasGoodMatches = finalSelection.some(r => r.confidence >= 60);
        if (!hasGoodMatches) {
            return `❌ <strong>لا</strong>، لم أجد منطقة صناعية بهذا الاسم بدقة.<br><br>
                <div style="padding: 10px; background: #fff9e6; border-radius: 8px; border-right: 3px solid #ffc107; margin-bottom: 12px;">
                    💡 <strong>نصيحة:</strong> حدد اسم المنطقة أو المحافظة بدقة أكثر للحصول على نتائج أفضل.
                </div>
                ${buildExplorationButtons()}`;
        }
        const goodResults = finalSelection.filter(r => r.confidence >= 60).slice(0, 5);
        let html = `🔍 <strong>وَجدتْ ${goodResults.length} منطقة محتملة:</strong><br><br>`;
        goodResults.forEach((result, i) => {
            html += `<div class="choice-btn" onclick="selectIndustrialArea('${result.area.name.replace(/'/g, "\\'")}')">
                <span class="choice-icon">🏭</span>
                <div style="text-align: right;">
                    <strong>${result.area.name}</strong><br>
                    <small style="color: #666;">📍 ${result.area.governorate} • الدقة ${result.confidence}%</small>
                </div>
            </div>`;
        });
        html += buildExplorationButtons();
        return html;
    }

    return `❌ <strong>لا</strong>، لم أجد منطقة صناعية بهذا الاسم في قاعدة البيانات.<br><br>
        ${buildExplorationButtons()}`;
}

// ==================== 🆕 بناء أزرار الاستكشاف الإضافية ====================
function buildExplorationButtons() {
    return `
        <div style="margin-top: 16px; padding: 14px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; border: 1px solid #dee2e6;">
            <div style="font-weight: 600; color: #495057; margin-bottom: 10px; font-size: 0.9rem;">
                🔍 أو استكشف المناطق بطريقة أخرى:
            </div>
            <div class="choice-btn" onclick="sendMessage('عرض كل المناطق الصناعية')" style="margin: 6px 0; padding: 10px 14px;">
                <span class="choice-icon">📋</span>
                <strong style="font-size: 0.9rem;">قائمة كل المناطق الصناعية</strong>
            </div>
            <div class="choice-btn" onclick="sendMessage('كم عدد المناطق الصناعية لكل جهة ولاية')" style="margin: 6px 0; padding: 10px 14px;">
                <span class="choice-icon">🏛️</span>
                <strong style="font-size: 0.9rem;">المناطق حسب جهة الولاية</strong>
            </div>
            <div class="choice-btn" onclick="sendMessage('كم عدد المناطق الصناعية لكل محافظة')" style="margin: 6px 0; padding: 10px 14px;">
                <span class="choice-icon">🗺️</span>
                <strong style="font-size: 0.9rem;">المناطق حسب المحافظة</strong>
            </div>
        </div>
    `;
}

// عرض كل المناطق (مع تقسيم حسب المحافظات)
function formatAllAreasList() {
    const govs = [...new Set(industrialAreasData.map(a => a.governorate))];
    let html = `<div class="info-card">
        <div class="info-card-header">
            📋 قائمة كاملة بالمناطق الصناعية في مصر
            <span style="background: #10a37f; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; margin-right: 10px;">
                ${industrialAreasData.length} منطقة
            </span>
        </div>
        <div class="info-card-content">
            <div style="margin-bottom: 15px; color: #666; font-size: 0.9em;">
                💡 اختر المحافظة لعرض المناطق الصناعية فيها
            </div>
        </div>
    </div>`;
    govs.forEach(gov => {
        const areas = industrialAreasData.filter(a => a.governorate === gov);
        html += `<div class="choice-btn" onclick="sendMessage('المناطق الصناعية: ما هي المناطق الصناعية في ${gov}')">
            <span class="choice-icon">🏭</span>
            <strong>${gov}</strong> <small>(${areas.length} منطقة)</small>
        </div>`;
    });
    if (govs.length > 10) {
        const remaining = govs.slice(10);
        html += `<div style="text-align: center; padding: 10px; color: #666; font-size: 0.9em;">
            ... و ${remaining.length} محافظة أخرى
        </div>`;
    }
    return html;
}

// عرض عدد المحافظات
function formatGovernoratesCount(governorates) {
    let html = `<div class="info-card">
        <div class="info-card-header">📊 المحافظات التي تحتوي على مناطق صناعية</div>
        <div class="info-card-content">
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-number">${governorates.length}</div>
                    <div class="stat-label">محافظة</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${industrialAreasData.length}</div>
                    <div class="stat-label">منطقة صناعية</div>
                </div>
            </div>
        </div>
    </div>
    <div class="area-list">`;
    governorates.forEach((gov, i) => {
        const count = industrialAreasData.filter(a => a.governorate === gov).length;
        html += `<div class="area-item" onclick="sendMessage('المناطق الصناعية في ${gov}')">
            ${i + 1}. <strong>${gov}</strong><br>
            <small style="color: #666;">📊 ${count} منطقة صناعية</small>
        </div>`;
    });
    html += `</div>`;
    return html;
}

// عرض خيارات المحافظات
function formatGovernorateChoices(governorates) {
    let html = `<div class="info-card">
        <div class="info-card-header">🗺️ اختر المحافظة</div>
    </div>
    <div class="area-list">`;
    governorates.forEach((gov, i) => {
        const count = industrialAreasData.filter(a => a.governorate === gov).length;
        html += `<div class="area-item" onclick="sendMessage('المناطق الصناعية في ${gov}')">
            ${i + 1}. <strong>${gov}</strong> <small>(${count} منطقة)</small>
        </div>`;
    });
    html += `</div>`;
    return html;
}

// ==================== دوال تنسيق جديدة ====================

// ✅ دالة جديدة: تنسيق العدد العام مع الخيارات
function formatGeneralCountWithOptions(totalAreas) {
    return `
        <div class="info-card">
            <div class="info-card-header">🏭 إجمالي عدد المناطق الصناعية في مصر</div>
            <div class="info-card-content">
                <div style="text-align: center; margin: 20px 0;">
                    <div class="stat-number">${totalAreas}</div>
                    <div class="stat-label">منطقة صناعية مسجلة</div>
                </div>
                <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin: 15px 0;">
                    <strong>📈 التوزيع:</strong><br>
                    • <strong>${industrialAreasData.filter(a => a.dependency === 'المحافظة').length}</strong> منطقة تابعة للمحافظات<br>
                    • <strong>${industrialAreasData.filter(a => a.dependency.includes('الهيئة العامة')).length}</strong> منطقة تابعة لهيئات مركزية<br>
                    • <strong>${industrialAreasData.filter(a => a.dependency.includes('المجتمعات العمرانية')).length}</strong> منطقة في مدن جديدة
                </div>
            </div>
        </div>
        <div style="margin-top: 20px; padding: 16px; background: #f7f7f8; border-radius: 12px;">
            <strong>🤔 لأي من الجوانب التالية تبحث عن معلومات؟</strong><br><br>
            <div class="choice-btn" onclick="sendMessage('عدد المناطق الصناعية لكل جهة ولاية')">
                <span class="choice-icon">📊</span> عدد المناطق لكل جهة ولاية
            </div>
            <div class="choice-btn" onclick="sendMessage('المناطق التابعة للهيئة العامة للاستثمار')">
                <span class="choice-icon">🏛️</span> المناطق التابعة لجهة ولاية محددة
            </div>
            <div class="choice-btn" onclick="sendMessage('عدد المناطق الصناعية في محافظة القاهرة')">
                <span class="choice-icon">📍</span> عدد المناطق في محافظة معينة
            </div>
            <div class="choice-btn" onclick="sendMessage('المناطق الصناعية في محافظة الجيزة')">
                <span class="choice-icon">🏭</span> قائمة المناطق في محافظة معينة
            </div>
            <div class="choice-btn" onclick="sendMessage('عرض جميع المناطق الصناعية')">
                <span class="choice-icon">📋</span> قائمة كاملة بجميع المناطق
            </div>
        </div>
    `;
}

// دالة لتنسيق قائمة المناطق حسب المحافظة
function formatAreasListByGovernorate(governorate, areas) {
    let html = `<div class="info-card">
        <div class="info-card-header">
            📍 المناطق الصناعية في محافظة: ${governorate}
            <span style="background: #10a37f; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; margin-right: 10px;">
                ${areas.length} منطقة
            </span>
        </div>
        <div class="info-card-content">
            <div style="margin-bottom: 15px; color: #666; font-size: 0.9em;">
                💡 انقر على أي منطقة لعرض تفاصيلها الكاملة
            </div>
        </div>
    </div>
    <div class="area-list">`;
    areas.forEach((area, i) => {
        html += `<div class="area-item" onclick="selectIndustrialArea('${area.name.replace(/'/g, "\\'")}')">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="font-size: 1em;">${i + 1}. ${area.name}</strong><br>
                    <small style="color: #666;">🏛️ ${area.dependency} • 📏 ${area.area} فدان</small>
                </div>
                <span style="color: #10a37f; font-size: 1.2em;">→</span>
            </div>
        </div>`;
    });
    html += `</div>
    <div style="margin-top: 12px; padding: 10px; background: #f0f9ff; border-radius: 8px; font-size: 0.85rem; color: #0369a1;">
        💡 يمكنك أيضاً سؤالي عن: "عدد المناطق الصناعية في ${governorate}"
    </div>`;
    return html;
}

// دالة للخيارات الافتراضية
function formatDefaultIndustrialOptions() {
    return `🤔 <strong>لأي من الجوانب التالية تبحث عن معلومات؟</strong><br><br>
        <div class="choice-btn" onclick="sendMessage('كم عدد المناطق الصناعية')">
            <span class="choice-icon">🏭</span> إجمالي عدد المناطق في مصر
        </div>
        <div class="choice-btn" onclick="sendMessage('عدد المناطق الصناعية لكل جهة ولاية')">
            <span class="choice-icon">📊</span> عدد المناطق لكل جهة ولاية
        </div>
        <div class="choice-btn" onclick="sendMessage('المناطق التابعة للهيئة العامة للاستثمار')">
            <span class="choice-icon">🏛️</span> المناطق التابعة لجهة ولاية محددة
        </div>
        <div class="choice-btn" onclick="sendMessage('عدد المناطق الصناعية في محافظة القاهرة')">
            <span class="choice-icon">📍</span> عدد المناطق في محافظة معينة
        </div>
        <div class="choice-btn" onclick="sendMessage('المناطق الصناعية في محافظة الجيزة')">
            <span class="choice-icon">📋</span> قائمة المناطق في محافظة معينة
        </div>
        <div class="choice-btn" onclick="sendMessage('المنطقة الصناعية بأبو رواش')">
            <span class="choice-icon">🔍</span> البحث عن منطقة محددة
        </div>
        <div style="margin-top: 10px; padding: 8px; background: #f0f9ff; border-radius: 8px; font-size: 0.85rem; color: #0369a1;">
            💡 يمكنك أيضاً كتابة اسم منطقة محددة مثل "المنطقة الصناعية بأبو رواش"
        </div>`;
}

// دالة لعرض خيارات الجهات عند عدم التحديد
function formatDependencyChoices(deps) {
    let html = `<div class="info-card">
        <div class="info-card-header">🤔 أي جهة ولاية تقصد؟</div>
        <div class="info-card-content">
            <p>يوجد <strong>${deps.length}</strong> جهة ولاية مختلفة للمناطق الصناعية:</p>
        </div>
    </div>
    <div class="area-list">`;
    deps.forEach((dep, i) => {
        const count = industrialAreasData.filter(a => a.dependency === dep).length;
        html += `<div class="area-item" onclick="sendMessage('المناطق التابعة لـ ${dep}')">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="font-size: 1em;">${i + 1}. ${dep}</strong>
                </div>
                <span style="background: #10a37f20; color: #0d8a6a; padding: 2px 8px; border-radius: 12px; font-weight: bold; font-size: 0.85em;">
                    ${count} منطقة
                </span>
            </div>
        </div>`;
    });
    html += `</div>
    <div style="margin-top: 12px; padding: 10px; background: #f0f9ff; border-radius: 8px; font-size: 0.85rem; color: #0369a1;">
        💡 اختر جهة الولاية من القائمة أعلاه لعرض المناطق التابعة لها
    </div>`;
    return html;
}

// دالة عرض عدد الجهات
function formatDependenciesCount(deps) {
    let html = `<div class="info-card">
        <div class="info-card-header">📊 جهات الولاية للمناطق الصناعية</div>
        <div class="info-card-content">
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-number">${deps.length}</div>
                    <div class="stat-label">جهة ولاية</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${industrialAreasData.length}</div>
                    <div class="stat-label">منطقة صناعية</div>
                </div>
            </div>
        </div>
    </div>
    <div class="area-list">`;
    deps.forEach((dep, i) => {
        const count = industrialAreasData.filter(a => a.dependency === dep).length;
        html += `<div class="area-item" onclick="sendMessage('المناطق التابعة لـ ${dep}')">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    ${i + 1}. <strong>${dep}</strong>
                </div>
                <span style="background: #10a37f20; color: #0d8a6a; padding: 2px 8px; border-radius: 12px; font-weight: bold;">
                    ${count} منطقة
                </span>
            </div>
        </div>`;
    });
    html += `</div>`;
    return html;
}

// دالة عرض المناطق حسب الجهة
function formatAreasListByDependency(dependency, areas) {
    let html = `<div class="info-card">
        <div class="info-card-header">
            🏛️ المناطق الصناعية التابعة لـ: ${dependency}
            <span style="background: #10a37f; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; margin-right: 10px;">
                ${areas.length} منطقة
            </span>
        </div>
        <div class="info-card-content">
            <div style="margin-bottom: 15px; color: #666; font-size: 0.9em;">
                💡 انقر على أي منطقة لعرض تفاصيلها الكاملة
            </div>
        </div>
    </div>
    <div class="area-list">`;
    areas.forEach((area, i) => {
        html += `<div class="area-item" onclick="selectIndustrialArea('${area.name.replace(/'/g, "\\'")}')">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="font-size: 1em;">${i + 1}. ${area.name}</strong><br>
                    <small style="color: #666;">📍 ${area.governorate} • 📏 ${area.area} فدان</small>
                </div>
                <span style="color: #10a37f; font-size: 1.2em;">→</span>
            </div>
        </div>`;
    });
    html += `</div>
    <div style="margin-top: 12px; padding: 10px; background: #f0f9ff; border-radius: 8px; font-size: 0.85rem; color: #0369a1;">
        💡 يمكنك أيضاً سؤالي عن: "عدد المناطق التابعة لـ ${dependency}"
    </div>`;
    return html;
}

// ==================== دوال التنسيق الأساسية للمناطق (مستقلة) ====================

function formatIndustrialResponse(area) {
    const mapLink = (area.x && area.y && area.x !== 0 && area.y !== 0)
        ? `https://www.google.com/maps?q=${area.y},${area.x}`
        : null;
    return `
        <div class="info-card">
            <div class="info-card-header">🏭 ${area.name}</div>
            <div class="info-card-content">
                <div class="info-row"><div class="info-label">📍 المحافظة:</div><div class="info-value">${area.governorate}</div></div>
                <div class="info-row"><div class="info-label">🏛️ جهة الولاية:</div><div class="info-value">${area.dependency}</div></div>
                <div class="info-row"><div class="info-label">📜 القرار:</div><div class="info-value">${area.decision || 'غير متوفر'}</div></div>
                <div class="info-row"><div class="info-label">📏 المساحة:</div><div class="info-value">${area.area} فدان</div></div>
            </div>
            ${mapLink ? `<a href="${mapLink}" target="_blank" class="link-btn map-btn"><i class="fas fa-map-marked-alt"></i> عرض على الخريطة</a>` : ''}
        </div>
        <div style="margin-top: 12px; padding: 10px; background: #f0f9ff; border-radius: 8px; font-size: 0.85rem; color: #0369a1;">
            💡 يمكنك سؤالي عن: القرار، جهة الولاية، المساحة، أو موقع الخريطة
        </div>
    `;
}

function formatIndustrialMapLink(area) {
    if (!area.x || !area.y || area.x === 0 || area.y === 0) {
        return `⚠️ <strong>إحداثيات الموقع غير متوفرة</strong><br><br>
            📍 المنطقة: ${area.name}<br>
            📍 المحافظة: ${area.governorate}<br><br>
            <em style="color: #666;">الإحداثيات لم يتم تحديدها في قاعدة البيانات</em>`;
    }
    const mapLink = `https://www.google.com/maps?q=${area.y},${area.x}`;
    return `<div class="info-card">
        <div class="info-card-header">🗺️ موقع ${area.name}</div>
        <div class="info-card-content">
            <div class="info-row"><div class="info-label">📍 المحافظة:</div><div class="info-value">${area.governorate}</div></div>
            <div class="info-row"><div class="info-label">🌐 خط الطول:</div><div class="info-value">${area.x}</div></div>
            <div class="info-row"><div class="info-label">🌐 خط العرض:</div><div class="info-value">${area.y}</div></div>
        </div>
    </div>
    <a href="${mapLink}" target="_blank" class="link-btn map-btn">
        <i class="fas fa-map-marked-alt"></i> فتح الموقع في خرائط جوجل
    </a>`;
}

// دالة إضافية للتنسيق (مطلوبة في بعض الأماكن)
function formatSingleAreaResponse(area, areaName) {
    return formatIndustrialResponse(area); // يمكن استخدام نفس التنسيق
}

// ==================== تصدير الدوال العامة ====================
window.handleIndustrialQuery = handleIndustrialQuery;
window.formatIndustrialResponse = formatIndustrialResponse;
window.formatIndustrialMapLink = formatIndustrialMapLink;

console.log('✅ gpt_areas.js - الإصدار المُصحح والمستقل بعد إزالة التكرارات تم تحميله بنجاح!');