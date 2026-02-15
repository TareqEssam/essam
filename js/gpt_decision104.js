// gpt_decision104.js
window.GPT_AGENT = window.GPT_AGENT || {};

// ==================== 🔍 دوال الكشف والاستخراج ====================

/**
 * فحص ما إذا كان السؤال متعلق بالقرار 104
 * @param {string} query - السؤال الأصلي
 * @returns {boolean}
 */
window.isDecision104Question = function(query) {
    const q = normalizeArabic(query);
    const patterns = [
        /قرار.*104/, /104/, /حافز/, /حوافز/, /قطاع\s*أ/, /قطاع\s*ا/, /قطاع\s*ب/,
        /القطاع\s*الاول/, /القطاع\s*الثاني/, /قانون.*استثمار/, /قانون.*72/,
        /ما\s*هو\s*القرار/, /هل.*104/, /مناطق.*القطاع/, /انشطة.*القطاع/
    ];
    return patterns.some(pattern => pattern.test(q));
};

/**
 * استخراج اسم النشاط من السؤال (نسخة محسّنة مع دعم السياق والضمائر)
 * @param {string} normalizedQuery - السؤال بعد التطبيع
 * @returns {string|null}
 */
function extractActivityFromQueryEnhanced(normalizedQuery) {
    const context = AgentMemory.getContext();

    // كشف الضمائر والكلمات المرجعية
    const pronounPatterns = [
        /^(هو|هي|ذلك|تلك|هذا|هذه|النشاط|ده|دي)\s/,
        /\s(هو|هي|ذلك|تلك|هذا|هذه)\s/,
        /\s(هو|هي|ذلك|تلك|هذا|هذه)$/
    ];
    const hasPronoun = pronounPatterns.some(p => p.test(normalizedQuery));

    if (hasPronoun && context) {
        let contextName = null;
        if (context.type === 'activity' && context.data) contextName = context.data.text || context.data.name;
        else if (context.type === 'decision_activity' && context.data) contextName = context.data.name || context.data.activity;
        else if (context.type === 'industrial' && context.data) contextName = context.data.name;

        if (contextName && contextName.length >= 3) {
            console.log(`🧠 [Context Recovery] تم استرجاع النشاط من السياق: "${contextName}"`);
            return contextName;
        }
    }

    // كشف أسئلة الحوافز
    const incentivePatterns = [
        /^(يحصل|تحصل|احصل|نحصل)\s*(على|علي)?\s*(حافز|حوافز)/,
        /^حافز/, /^حوافز/, /الحوافز$/, /حوافز$/
    ];
    const isIncentive = incentivePatterns.some(p => p.test(normalizedQuery));
    if (isIncentive && context) {
        let contextName = null;
        if (context.type === 'activity' && context.data) contextName = context.data.text || context.data.name;
        else if (context.type === 'decision_activity' && context.data) contextName = context.data.name || context.data.activity;
        if (contextName && contextName.length >= 3) {
            console.log(`🎁 [Incentive] استرجاع النشاط من السياق: "${contextName}"`);
            return contextName;
        }
    }

    // تنظيف ذكي
    let cleaned = normalizedQuery
        .replace(/^(هل|ما|ماذا|كيف|اين)\s+(هو|هي|عن|بخصوص|نشاط)?\s*/g, '')
        .replace(/^نشاط\s+/g, '');

    const patternsToRemove = [
        /\b(وارد|وارده|واردة|موجود|موجوده|موجودة|مدرج|مدرجه|مدرجة|مذكور|مذكوره|مشمول|مشموله|منصوص|منصوصه)\b/gi,
        /\b(نشاط|النشاط)\b/gi,
        /\s+(بالقرار|في القرار|داخل القرار|ضمن القرار)\s*104?/g,
        /\s+(بالقطاع|في القطاع|داخل القطاع)\s*[أابب]/g,
        /\s+قطاع\s*[أابب]/g,
        /قرار\s*104/g, /104/g,
        /\s+(في|عن|على)\s*$/g
    ];
    patternsToRemove.forEach(p => { cleaned = cleaned.replace(p, ' '); });

    cleaned = cleaned.trim().replace(/\s+/g, ' ');
    if (cleaned.startsWith('ال') && cleaned.length > 4) cleaned = cleaned.substring(2);
    cleaned = cleaned.replace(/(وارده|واردة|موجوده|موجودة)$/, '').trim();

    console.log(`🧼 تنظيف الاستعلام: من [${normalizedQuery}] إلى [${cleaned}]`);

    if (cleaned.length >= 3) return cleaned;

    // Fallback للسياق
    if (context) {
        let contextName = null;
        if (context.type === 'activity' && context.data) contextName = context.data.text || context.data.name;
        else if (context.type === 'decision_activity' && context.data) contextName = context.data.name || context.data.activity;
        if (contextName && contextName.length >= 3) return contextName;
    }

    return null;
}

/**
 * كشف نطاق البحث (القطاع أ / ب / كليهما)
 * @param {string} query - السؤال المُنظّف
 * @returns {{scope: string, scopeName: string}}
 */
function detectSearchScopeEnhanced(query) {
    const q = normalizeArabic(query);
    const sectorAPatterns = [/بالقطاع\s*أ/, /بالقطاع\s*ا/, /في\s*القطاع\s*أ/, /في\s*القطاع\s*ا/, /قطاع\s*أ/, /قطاع\s*ا/, /القطاع\s*الاول/, /القطاع\s*1/];
    const sectorBPatterns = [/بالقطاع\s*ب/, /في\s*القطاع\s*ب/, /قطاع\s*ب/, /القطاع\s*الثاني/, /القطاع\s*2/];

    if (sectorBPatterns.some(p => p.test(q))) return { scope: 'B', scopeName: 'القطاع ب' };
    if (sectorAPatterns.some(p => p.test(q))) return { scope: 'A', scopeName: 'القطاع أ' };
    return { scope: 'both', scopeName: 'كلا القطاعين' };
}

// ==================== 🔍 محرك البحث في القرار 104 ====================

/**
 * بحث محسّن في كلا القطاعين
 */
function searchInDecision104EnhancedForBothSectors(activityName) {
    const normalizedQuery = normalizeArabic(activityName);
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
    let allResults = [];
    if (window.sectorAData) allResults.push(...searchInSectorData(window.sectorAData, 'A', normalizedQuery, queryWords));
    if (window.sectorBData) allResults.push(...searchInSectorData(window.sectorBData, 'B', normalizedQuery, queryWords));
    allResults.sort((a, b) => b.score - a.score);
    return deduplicateResults(allResults);
}

/**
 * بحث في قطاع محدد
 */
function searchInDecision104EnhancedForSpecificSector(activityName, targetSector) {
    const normalizedQuery = normalizeArabic(activityName);
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
    const data = targetSector === 'A' ? window.sectorAData : window.sectorBData;
    return searchInSectorData(data, targetSector, normalizedQuery, queryWords);
}

/**
 * بحث داخل بيانات قطاع معين باستخدام NeuralSearch
 */
function searchInSectorData(sectorData, sectorId, normalizedQuery, queryWords) {
    if (!sectorData) return [];
    let flatData = [];
    for (const [mainSector, subSectors] of Object.entries(sectorData)) {
        for (const [subSector, activities] of Object.entries(subSectors)) {
            activities.forEach(act => {
                flatData.push({ activity: act, mainSector, subSector, sector: sectorId });
            });
        }
    }
    const searchResults = NeuralSearch(normalizedQuery, flatData, {
        minScore: 50,
        cacheScope: `sector_${sectorId}`
    });
    return deduplicateResults(searchResults.results.map(r => ({
        item: r.originalData,
        score: r.finalScore,
        confidence: Math.min(Math.round(r.finalScore / 10), 100),
        sector: sectorId,
        sectorName: sectorId === 'A' ? 'القطاع أ' : 'القطاع ب'
    })));
}

/**
 * إزالة التكرار من النتائج
 */
function deduplicateResults(results) {
    if (!Array.isArray(results)) return [];
    const seen = new Set();
    return results.filter(r => {
        const key = `${(r.item?.activity || r.activity || '').trim()}_${r.sector}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ==================== 🧠 معالج الاستعلام الرئيسي ====================

/**
 * المعالج الرئيسي لأسئلة القرار 104
 * @param {string} query - السؤال الأصلي
 * @param {object} questionType - نوع السؤال (اختياري)
 * @returns {string} HTML للرد
 */
function handleDecision104Query(query, questionType) {
    let q = normalizeArabic(query).replace(/القطا\s+ع/g, 'القطاع').replace(/\s+/g, ' ').trim();
    console.log("🎯 محرك القرار 104: بدء المعالجة لـ:", query);

    // ===== الطلبات المباشرة للقوائم والتفاصيل =====
    if (q.includes('انشط') && (q.includes('قطاع') || q.includes('القطاع'))) {
        if (q.includes('عرض انشطه') && q.includes('في القطاع')) {
            const targetSector = q.includes('قطاع ب') ? 'B' : 'A';
            const data = targetSector === 'A' ? window.sectorAData : window.sectorBData;
            for (const mainName in data) {
                if (q.includes(normalizeArabic(mainName))) {
                    return renderSingleMainSector(targetSector, mainName);
                }
            }
        }

        let detectedSector = null;
        if (q.includes(' قطاع ب') || q.includes(' القطاع b') || q.endsWith(' ب')) detectedSector = 'B';
        else if (q.includes(' قطاع ا') || q.includes(' قطاع أ') || q.endsWith(' ا') || q.endsWith(' أ')) detectedSector = 'A';

        if (detectedSector) {
            const isMainOnly = q.includes('رييسيه') || q.includes('رئيسيه');
            return renderDecisionSectorList(detectedSector, isMainOnly);
        }
    }

    if (q.includes('شروط') && q.includes('ب')) {
        return renderSectorBConditions();
    }

    if (/ما\s*(هو|هي).*قرار.*104/.test(q) || /قرار.*104.*ايه/.test(q)) {
        return formatDecision104Overview();
    }

    if (/(ما|ماهي|اذكر).*مناطق.*(قطاع|القطاع)\s*(أ|ا|1)/.test(q) || q.includes('المناطق المحددة للقطاع أ')) {
        return formatSectorARegionsDetailed();
    }

    if (/(ما|ماهي|اذكر|اين|أين).*مناطق.*(قطاع|القطاع)\s*(ب|2)/.test(q) || q.includes('المناطق المحددة للقطاع ب') || q.includes('مناطق القطاع ب')) {
        return formatSectorBRegions();
    }

    if (/(ما|ماهي|اذكر).*حوافز.*(قطاع|القطاع)\s*(أ|ا|1)/.test(q)) {
        return formatSectorIncentives('A');
    }

    if (/(ما|ماهي|اذكر).*حوافز.*(قطاع|القطاع)\s*(ب|2)/.test(q)) {
        return formatSectorIncentives('B');
    }

    // ===== استخراج اسم النشاط =====
    const activityName = extractActivityFromQueryEnhanced(q);
    if (!activityName || activityName.length < 3) {
        return formatDecision104Options();
    }

    // تعريف الكلمات الجوهرية
    const commonVerbs = [
        'تصنيع', 'انتاج', 'إنتاج', 'تجميع', 'اقامة', 'إقامة', 'تشغيل', 'تجهيز', 'توريد',
        'مشروع', 'نشاط', 'صناعة', 'خدمات', 'مركز', 'وحدات', 'مكونات', 'محطات', 'توليد',
        'وارد', 'وارده', 'واردة', 'مشمول', 'موجود','مدرج', 'موجودة', 'مدرج', 'مدرجة', 'مذكور'
    ];
    const queryTerms = activityName.split(/\s+/).map(w => normalizeArabic(w));
    const significantTerms = queryTerms.filter(w => !commonVerbs.includes(w) && w.length > 2);
    console.log(`🧠 [Smart Filter] الكلمات الجوهرية: [${significantTerms.join(', ')}]`);

    // تحديد نطاق البحث
    const scopeDetection = detectSearchScopeEnhanced(q);
    const searchScope = scopeDetection.scope;

    // تنفيذ البحث
    let results = [];
    if (searchScope === 'A') {
        results = searchInDecision104EnhancedForSpecificSector(activityName, 'A');
    } else if (searchScope === 'B') {
        results = searchInDecision104EnhancedForSpecificSector(activityName, 'B');
    } else {
        results = searchInDecision104EnhancedForBothSectors(activityName);
    }

    if (searchScope !== 'both') {
        results = results.filter(r => (r.sector || r.item?.sector) === searchScope);
    }
    results = deduplicateResults(results);

    // فلترة الكلمات الجوهرية
    if (significantTerms.length > 0 && results.length > 0) {
        const strictResults = results.filter(r => {
            const itemText = normalizeArabic(r.item.activity);
            const matched = significantTerms.filter(term => itemText.includes(term)).length;
            return (matched / significantTerms.length) >= 0.7;
        });
        if (strictResults.length > 0) {
            results = strictResults;
            console.log(`🧹 [Smart Filter] تم تقليص النتائج إلى ${results.length} نتيجة دقيقة.`);
        } else {
            console.log("⚠️ [Smart Filter] لم نجد تطابقًا قويًا، نحتفظ بالنتائج الأصلية.");
        }
    }

    // ترتيب النتائج
    if (results.length > 1 && significantTerms.length > 0) {
        results.sort((a, b) => {
            const textA = normalizeArabic(a.item.activity);
            const textB = normalizeArabic(b.item.activity);
            const matchA = significantTerms.filter(t => textA.includes(t)).length;
            const matchB = significantTerms.filter(t => textB.includes(t)).length;
            if (matchB !== matchA) return matchB - matchA;
            return (b.confidence || b.score) - (a.confidence || a.score);
        });
    }

    // عرض النتائج
    if (!results || results.length === 0) {
        return formatActivityNotFoundInDecision104(activityName, searchScope);
    }

    if (results.length === 1) {
        const result = results[0];
        const itemData = result.item || result;
        AgentMemory.setDecisionActivity(itemData, activityName);
        return formatSingleActivityInDecision104WithIncentives(activityName, itemData, searchScope);
    } else {
        return formatMultipleActivitiesInDecision104WithBothSectorsFixed(activityName, results, searchScope);
    }
}

// ==================== 🖼️ دوال التنسيق والعرض ====================

/**
 * عرض نظرة عامة على القرار 104
 */
function formatDecision104Overview() {
    return `
        <div class="info-card">
            <div class="info-card-header">📋 قرار رئيس مجلس الوزراء رقم 104 لسنة 2022</div>
            <div class="info-card-content">
                <strong>يحدد هذا القرار الأنشطة الاستثمارية المؤهلة للحصول على الحوافز الخاصة وفقاً لقانون الاستثمار رقم 72 لسنة 2017.</strong>
                <br><br><strong>ينقسم القرار إلى قطاعين:</strong><br><br>
                <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin: 10px 0;">
                    <strong style="color: #2e7d32;">📍 القطاع أ:</strong> أنشطة يجب ممارستها في مناطق جغرافية معينة.
                </div>
                <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin: 10px 0;">
                    <strong style="color: #1565c0;">🌍 القطاع ب:</strong> أنشطة يمكن ممارستها في باقي أنحاء الجمهورية.
                </div>
            </div>
        </div>
        <div class="tech-notes">
            <div class="tech-notes-title">⚠️ شرط الحصول على الحوافز</div>
            <div class="tech-notes-content">يجب أن تكون الشركة قد تأسست بعد العمل بقانون الاستثمار رقم 72 لسنة 2017.</div>
        </div>
        <div style="margin-top: 15px;">
            <a href="https://www.investinegypt.gov.eg/Fact%20Sheets/%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%B1%20104%20%D9%84%D8%B3%D9%86%D9%87%202022%20%D8%AA%D9%88%D8%B2%D9%8A%D8%B9%20%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D8%B9%D8%A7%D8%AA%20%D8%A7%D9%84%D9%81%D8%B1%D8%B9%D9%8A%D9%87%20%D9%82%D8%A7%D9%86%D9%88%D9%86%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1%20(1).pdf" target="_blank" class="choice-btn" style="text-decoration: none; background: linear-gradient(135deg, #ff4757, #ff6b81); color: white; justify-content: center; font-weight: bold; margin-bottom: 12px;">
                <span class="choice-icon" style="margin-left: 8px;">📥</span> عرض نص القرار 104 (PDF)
            </a>
            <div class="choice-btn" onclick="sendMessage('ما هي الأنشطة للقطاع أ')"><span class="choice-icon">📋</span> عرض أنشطة القطاع أ</div>
            <div class="choice-btn" onclick="sendMessage('ما هي الأنشطة للقطاع ب')"><span class="choice-icon">📋</span> عرض أنشطة القطاع ب</div>
            <div class="choice-btn" onclick="sendMessage('ما هي حوافز القطاع أ')"><span class="choice-icon">🎁</span> عرض حوافز القطاع أ</div>
            <div class="choice-btn" onclick="sendMessage('ما هي المناطق الجغرافيه للقطاع أ')"><span class="choice-icon">🗺️</span> المناطق الجغرافية للقطاع أ</div>
        </div>
    `;
}

function formatDecision104Options() {
    return `
        <div class="info-card">
            <div class="info-card-header">
                🤔 ما الذي تبحث عنه في القرار 104؟
            </div>
            <div class="info-card-content">
                اختر أحد المواضيع التالية:
            </div>
        </div>
        
        <div class="choice-btn" onclick="sendMessage('ما هو القرار 104؟')">
            <span class="choice-icon">📋</span>
            ما هو القرار 104 وما أهميته؟
        </div>
        
        <div class="choice-btn" onclick="sendMessage('ما هي أنشطة القطاع أ')">
            <span class="choice-icon">🏭</span>
            عرض أنشطة القطاع أ
        </div>
        
        <div class="choice-btn" onclick="sendMessage('ما هي أنشطة القطاع ب')">
            <span class="choice-icon">🌍</span>
            عرض أنشطة القطاع ب
        </div>
        
        <div class="choice-btn" onclick="sendMessage('ما هي حوافز القطاع أ')">
            <span class="choice-icon">🎁</span>
            عرض حوافز القطاع أ
        </div>
        
        <div class="choice-btn" onclick="sendMessage('ما هي المناطق المحددة للقطاع أ')">
            <span class="choice-icon">🗺️</span>
            المناطق الجغرافية للقطاع أ
        </div>
        
        <div style="margin-top: 15px; padding: 10px; background: #f0f9ff; border-radius: 8px; font-size: 0.9rem; color: #0369a1;">
            💡 يمكنك أيضاً كتابة اسم نشاط محدد مثل: "هل نشاط النقل وارد بالقرار 104؟"
        </div>
    `;
}

/**
 * عرض قائمة أنشطة قطاع معين
 */
function renderDecisionSectorList(sector, isMainOnly = false) {
    const data = (sector === 'A') ? window.sectorAData : window.sectorBData;
    if (!data) return "⚠️ عذراً، لم يتم العثور على بيانات هذا القطاع.";

    const color = (sector === 'A') ? '#4caf50' : '#2196f3';
    let html = `<div style="border-right: 5px solid ${color}; padding: 15px; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); direction: rtl;">`;
    html += `<h4 style="color: ${color}; margin-top:0;">📋 أنشطة القرار 104 - القطاع ${sector === 'A' ? 'أ' : 'ب'}</h4>`;

    if (sector === 'B' && !isMainOnly) {
        html += `<div class="choice-btn" onclick="sendMessage('عرض الشروط العامة والخاصة للقطاع ب')" style="background: #e3f2fd; border: 1px solid #2196f3; color: #1565c0; margin: 10px 0;">
            <span class="choice-icon">⚖️</span> <strong>عرض الشروط العامة والخاصة للقطاع ب</strong>
        </div>`;
    }

    for (const mainSector in data) {
        if (isMainOnly) {
            html += `<div class="choice-btn" onclick="sendMessage('عرض انشطة ${mainSector} في القطاع ${sector === 'A' ? 'أ' : 'ب'}')" style="margin: 8px 0; border-right: 4px solid ${color}; text-align: right;">
                <span class="choice-icon">📁</span> <strong>${mainSector}</strong>
            </div>`;
        } else {
            html += `<div style="margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px;">`;
            html += `<strong style="color: #333; display: block; margin-bottom: 5px;">📁 ${mainSector}</strong>`;
            for (const subSector in data[mainSector]) {
                html += `<div style="font-size: 0.9em; color: #1a73e8; margin-right: 15px; font-weight: 500;">🔹 ${subSector}</div>`;
                data[mainSector][subSector].forEach(activity => {
                    html += `<div style="font-size: 0.85em; color: #666; margin-right: 30px; margin-top: 2px;">• ${activity}</div>`;
                });
            }
            html += `</div>`;
        }
    }
    html += `</div>`;
    return html;
}

/**
 * عرض تفاصيل نشاط رئيسي محدد
 */
function renderSingleMainSector(sector, mainSectorName) {
    const data = (sector === 'A') ? window.sectorAData : window.sectorBData;
    const targetData = data[mainSectorName];
    if (!targetData) return `⚠️ عذراً، لم يتم العثور على تفاصيل لـ ${mainSectorName}.`;

    const color = (sector === 'A') ? '#4caf50' : '#2196f3';
    let html = `<div style="border-right: 5px solid ${color}; padding: 15px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); direction: rtl;">`;
    html += `<h4 style="color: ${color}; margin-top:0; border-bottom: 2px solid #eee; padding-bottom:10px;">📂 تفاصيل ${mainSectorName} - القطاع ${sector === 'A' ? 'أ' : 'ب'}</h4>`;

    for (const subSector in targetData) {
        html += `<div style="margin-bottom: 15px;">`;
        html += `<div style="font-size: 0.95em; color: #1a73e8; font-weight: bold; margin-bottom: 5px;">🔹 ${subSector}</div>`;
        targetData[subSector].forEach(activity => {
            html += `<div style="font-size: 0.85em; color: #555; margin-right: 20px; border-right: 2px solid #eee; padding-right: 8px; margin-top: 4px;">• ${activity}</div>`;
        });
        html += `</div>`;
    }

    html += `<div class="choice-btn" onclick="sendMessage('الأنشطة الرئيسية للقطاع ${sector === 'A' ? 'أ' : 'ب'}')" style="margin-top: 15px; background: #f8f9fa; font-size: 0.8em; text-align: center;">`;
    html += `⬅️ العودة لقائمة الأنشطة الرئيسية</div>`;
    html += `</div>`;
    return html;
}

/**
 * عرض المناطق الجغرافية للقطاع أ
 */
function formatSectorARegionsDetailed() {
    return `
        <div class="info-card" style="background: linear-gradient(135deg, #e8f5e9, #ffffff); border-left: 4px solid #4caf50;">
            <div class="info-card-header" style="color: #2e7d32;">🗺️ المناطق الجغرافية للقطاع (أ) <span style="font-size: 0.8em; background: #4caf50; color: white; padding: 2px 8px; border-radius: 10px; margin-right: 8px;">الأكثر احتياجاً للتنمية</span></div>
            <div class="info-card-content" style="color: #1b5e20;">تتميز هذه المناطق بأعلى نسبة حوافز (خصم 50% من التكاليف الاستثمارية).</div>
        </div>
        <div class="area-list" style="max-height: 400px; overflow-y: auto;">
            <div class="area-item" style="border-right: 4px solid #4caf50;"><div style="display: flex; align-items: center; gap: 10px;"><span style="background: #e8f5e9; padding: 8px; border-radius: 50%;">🚢</span><div><strong>1. المنطقة الاقتصادية لقناة السويس</strong><br><small style="color: #666;">منطقة اقتصادية ذات طبيعة خاصة</small></div></div></div>
            <div class="area-item" style="border-right: 4px solid #4caf50;"><div style="display: flex; align-items: center; gap: 10px;"><span style="background: #e8f5e9; padding: 8px; border-radius: 50%;">🔺</span><div><strong>2. منطقة المثلث الذهبي</strong><br><small style="color: #666;">(المثلث الذهبي)</small></div></div></div>
            <div class="area-item" style="border-right: 4px solid #4caf50;"><div style="display: flex; align-items: center; gap: 10px;"><span style="background: #e8f5e9; padding: 8px; border-radius: 50%;">🏙️</span><div><strong>3. العاصمة الإدارية الجديدة</strong><br><small style="color: #666;">وفقاً للخريطة الاستثمارية</small></div></div></div>
            <div class="area-item" style="border-right: 4px solid #4caf50;"><div style="display: flex; align-items: center; gap: 10px;"><span style="background: #e8f5e9; padding: 8px; border-radius: 50%;">🏙️</span><div><strong>4. منطقة رأس الحكمة</strong><br><small style="color: #666;">وفقاً للخريطة الاستثمارية</small></div></div></div>
            <div class="area-item" style="border-right: 4px solid #4caf50;"><div style="display: flex; align-items: center; gap: 10px;"><span style="background: #e8f5e9; padding: 8px; border-radius: 50%;">🏭</span><div><strong>5. جنوب محافظة الجيزة</strong><br><small style="color: #666;">الواحات البحرية – الصف - العياط</small></div></div></div>
            <div class="area-item" style="border-right: 4px solid #4caf50;"><div style="display: flex; align-items: center; gap: 10px;"><span style="background: #e8f5e9; padding: 8px; border-radius: 50%;">🏜️</span><div><strong>6. محافظات الصعيد</strong><br><small style="color: #666;">الفيوم – بني سويف - المنيا – أسيوط – سوهاج – قنا – الأقصر - أسوان</small></div></div></div>
            <div class="area-item" style="border-right: 4px solid #4caf50;"><div style="display: flex; align-items: center; gap: 10px;"><span style="background: #e8f5e9; padding: 8px; border-radius: 50%;">🏜️</span><div><strong>7. محافظة القاهرة الكبرى لنشاط السياحة فقط</strong><br><small style="color: #666;">القاهرة – الجيزة - القليوبية</small></div></div></div>
            <div class="area-item" style="border-right: 4px solid #4caf50;"><div style="display: flex; align-items: center; gap: 10px;"><span style="background: #e8f5e9; padding: 8px; border-radius: 50%;">🛂</span><div><strong>8. محافظات الحدود</strong><br><small style="color: #666;">أسوان – مرسي مطروح – جنوب سيناء - شمال سيناء - الوادي الجديد – محافظة البحر الأحمر من جنوب سفاجا</small></div></div></div>
        </div>
        <div style="margin-top: 15px; padding: 12px; background: #f1f8e9; border-radius: 8px; border: 1px solid #c8e6c9;">
            <strong style="color: #2e7d32;">💡 قاعدة عامة:</strong> أي نشاط يقع خارج هذه المناطق يعتبر ضمن القطاع (ب) ويتمتع بحوافز 30%.
        </div>
    `;
}

/**
 * عرض المناطق الجغرافية للقطاع ب
 */
function formatSectorBRegions() {
    return `
        <div class="info-card" style="background: linear-gradient(135deg, #e3f2fd, #ffffff); border-left: 4px solid #2196f3;">
            <div class="info-card-header" style="color: #1565c0;">🌍 المناطق الجغرافية للقطاع (ب) <span style="font-size: 0.8em; background: #2196f3; color: white; padding: 2px 8px; border-radius: 10px; margin-right: 8px;">باقي أنحاء الجمهورية</span></div>
            <div class="info-card-content" style="color: #0d47a1;">يغطي هذا القطاع <strong>جميع أنحاء الجمهورية</strong> (بخلاف المناطق المحددة للقطاع أ).</div>
        </div>
        <div style="background: #fff3e0; padding: 14px; border-radius: 10px; border: 1px solid #ffe0b2; margin-top: 15px;">
            <div style="color: #e65100; font-weight: 600; margin-bottom: 8px;"><i class="fas fa-exclamation-triangle"></i> الشرط الجوهري للاستحقاق</div>
            <div style="color: #bf360c;">رغم أن المنطقة مفتوحة، <strong>يجب</strong> أن يكون النشاط مدرجاً ضمن قوائم أنشطة القطاع (ب).</div>
        </div>
        <div style="margin-top: 15px;"><div class="choice-btn" onclick="sendMessage('ما هي أنشطة القطاع ب')"><span class="choice-icon">📋</span> التأكد من أنشطة القطاع ب</div></div>
    `;
}

/**
 * عرض حوافز قطاع معين
 */
function formatSectorIncentives(sector) {
    return formatSectorIncentivesEnhanced(sector, { activity: 'عرض عام' });
}

/**
 * عرض حوافز قطاع معين مع تفاصيل النشاط (نسخة محسّنة)
 */
function formatSectorIncentivesEnhanced(sector, itemData) {
    const sectorName = sector === 'A' ? 'القطاع أ' : 'القطاع ب';
    const sectorColor = sector === 'A' ? '#4caf50' : '#2196f3';
    let incentives = '';

    if (sector === 'A') {
        incentives = `
            <div style="background: white; padding: 14px; border-radius: 10px; margin: 10px 0; border-right: 4px solid #4caf50; box-shadow: 0 2px 8px rgba(76,175,80,0.15);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="font-size: 24px;">💰</span>
                    <strong style="color: #2e7d32;">خصم 50% من صافي الأرباح الخاضعة للضريبة من التكاليف الاستثمارية.</strong>
                </div>
                <div style="color: #666; font-size: 0.9em; padding-right: 34px;">يجب ألا يتجاوز الحافز 80% من رأس المال المدفوع، وألا تزيد مدة الخصم على 7 سنوات.</div>
            </div>
            <div style="background: white; padding: 14px; border-radius: 10px; margin: 10px 0; border-right: 4px solid #4caf50; box-shadow: 0 2px 8px rgba(76,175,80,0.15);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="font-size: 24px;">🏗️</span>
                    <strong style="color: #2e7d32;">الإعفاء من ضريبة الدمغة ورسوم التوثيق والشهر لمدة خمس سنوات.</strong>
                </div>
            </div>
            <div style="background: white; padding: 14px; border-radius: 10px; margin: 10px 0; border-right: 4px solid #4caf50; box-shadow: 0 2px 8px rgba(76,175,80,0.15);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="font-size: 24px;">📝</span>
                    <strong style="color: #2e7d32;">تطبيق ضريبة جمركية موحدة على المعدات والآلات اللازمة لإنشاء المشروع.</strong>
                </div>
            </div>
        `;
    } else {
        incentives = `
            <div style="background: white; padding: 14px; border-radius: 10px; margin: 10px 0; border-right: 4px solid #2196f3; box-shadow: 0 2px 8px rgba(33,150,243,0.15);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="font-size: 24px;">💰</span>
                    <strong style="color: #1565c0;">خصم 30% من التكاليف الاستثمارية.</strong>
                </div>
                <div style="color: #666; font-size: 0.9em; padding-right: 34px;">ويشمل باقي أنحاء الجمهورية.</div>
            </div>
        `;
    }

    return `
        <div class="info-card" style="margin-top: 16px; background: linear-gradient(135deg, ${sectorColor}10, white); border-left: 4px solid ${sectorColor};">
            <div class="info-card-header" style="background: ${sectorColor}; color: white;">🎁 الحوافز الاستثمارية لـ ${sectorName}</div>
            <div class="info-card-content">
                ${incentives}
                <div style="background: #fff3e0; padding: 12px; border-radius: 8px; margin-top: 16px; border: 1px solid #ffe0b2;">
                    <div style="color: #e65100; font-weight: 600; margin-bottom: 6px;">⚠️ شرط أساسي</div>
                    <div style="color: #bf360c; font-size: 0.9em;">يجب أن تكون الشركة قد تأسست بعد العمل بقانون الاستثمار رقم 72 لسنة 2017.</div>
                </div>
                <a href="https://www.investinegypt.gov.eg/PublishingImages/Lists/ContentPageDetails/AllItems/%D8%AD%D9%88%D8%A7%D9%81%D8%B2%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1.pdf" target="_blank" class="choice-btn" style="margin-top: 15px; text-decoration: none; background: linear-gradient(135deg, #ef5350, #d32f2f); color: white; justify-content: center; font-weight: bold;">
                    <i class="fas fa-file-pdf" style="margin-left: 8px;"></i> عرض ملف حوافز الاستثمار (PDF)
                </a>
            </div>
        </div>
    `;
}

/**
 * عرض نشاط واحد مع الحوافز
 */
function formatSingleActivityInDecision104WithIncentives(activityName, itemData, searchScope) {
    const sector = itemData.sector;
    const sectorName = sector === 'A' ? 'القطاع أ' : 'القطاع ب';
    const sectorColor = sector === 'A' ? '#4caf50' : '#2196f3';

    let html = `
        <div class="info-card" style="background: linear-gradient(135deg, ${sector === 'A' ? '#e8f5e9' : '#e3f2fd'}, white); border-left: 4px solid ${sectorColor};">
            <div class="info-card-header" style="color: ${sector === 'A' ? '#2e7d32' : '#1565c0'};">✅ النشاط "${itemData.activity}" موجود في القرار 104</div>
            <div class="info-card-content">
                <div class="info-row"><div class="info-label">📋 النشاط:</div><div class="info-value"><strong>${itemData.activity}</strong></div></div>
                <div class="info-row"><div class="info-label">📊 القطاع:</div><div class="info-value"><span style="background: ${sectorColor}20; color: ${sectorColor}; padding: 4px 12px; border-radius: 12px;">${sectorName}</span></div></div>
                <div class="info-row"><div class="info-label">🏢 القطاع الرئيسي:</div><div class="info-value">${itemData.mainSector}</div></div>
                <div class="info-row"><div class="info-label">📂 القطاع الفرعي:</div><div class="info-value">${itemData.subSector}</div></div>
            </div>
        </div>
    `;

    html += formatSectorIncentivesEnhanced(sector, itemData);

    if (sector === 'A') {
        html += `
            <div style="background: #fff3e0; padding: 14px; border-radius: 10px; border: 1px solid #ffe0b2; margin-top: 16px;">
                <div style="color: #e65100; font-weight: 600; margin-bottom: 8px;"><i class="fas fa-map-marker-alt"></i> 📍 المناطق المسموحة للقطاع أ</div>
                <div style="color: #bf360c; line-height: 1.6; font-size: 0.9em;">يجب ممارسة هذا النشاط في المناطق المحددة فقط.</div>
                <button onclick="sendMessage('ما هي المناطق المحددة للقطاع أ')" class="choice-btn" style="margin-top: 8px;">🗺️ عرض المناطق المحددة بالتفصيل</button>
            </div>
        `;
    }

    return html;
}

/**
 * عرض عدة نتائج متشابهة (مع فصل القطاعات)
 */
function formatMultipleActivitiesInDecision104WithBothSectorsFixed(activityName, results, searchScope = 'both') {
    let scopeMessage = '';
    if (searchScope === 'A') scopeMessage = `<div style="background: #e8f5e9; padding: 12px; border-radius: 10px; border-right: 4px solid #4caf50; margin-bottom: 16px;"><div style="color: #2e7d32;">🔍 البحث في: <strong>القطاع أ فقط</strong></div></div>`;
    else if (searchScope === 'B') scopeMessage = `<div style="background: #e3f2fd; padding: 12px; border-radius: 10px; border-right: 4px solid #2196f3; margin-bottom: 16px;"><div style="color: #1565c0;">🔍 البحث في: <strong>القطاع ب فقط</strong></div></div>`;

    const sectorAResults = results.filter(r => (r.item?.sector || r.sector) === 'A');
    const sectorBResults = results.filter(r => (r.item?.sector || r.sector) === 'B');

    let distributionMessage = '';
    if (searchScope === 'both') distributionMessage = `📊 التوزيع: <strong>${sectorAResults.length} في القطاع أ</strong> • <strong>${sectorBResults.length} في القطاع ب</strong>`;
    else if (searchScope === 'A') distributionMessage = `📊 النتائج: <strong>${sectorAResults.length} نشاط</strong> في القطاع أ`;
    else if (searchScope === 'B') distributionMessage = `📊 النتائج: <strong>${sectorBResults.length} نشاط</strong> في القطاع ب`;

    let html = scopeMessage + `
        <div class="info-card" style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-left: 4px solid #2196f3;">
            <div class="info-card-header" style="color: #1565c0;">🔍 وَجدتْ ${results.length} نشاط مرتبط بـ: "${activityName}"</div>
            <div class="info-card-content" style="color: #0d47a1;">
                <div style="margin-bottom: 10px;">${distributionMessage}</div>
                يرجى اختيار النشاط المطلوب:
            </div>
        </div>
    `;

    if ((searchScope === 'both' || searchScope === 'A') && sectorAResults.length > 0) {
        html += formatSectorResultsSection('A', sectorAResults, activityName);
    }
    if ((searchScope === 'both' || searchScope === 'B') && sectorBResults.length > 0) {
        html += formatSectorResultsSection('B', sectorBResults, activityName);
    }

    if (searchScope === 'A' && sectorAResults.length === 0) {
        html += `<div style="margin-top: 16px; padding: 14px; background: #fff3e0; border-radius: 10px; border: 1px solid #ffe0b2;"><div style="color: #e65100;">ℹ️ لم يتم العثور على نتائج في القطاع أ</div></div>`;
    } else if (searchScope === 'B' && sectorBResults.length === 0) {
        html += `<div style="margin-top: 16px; padding: 14px; background: #fff3e0; border-radius: 10px; border: 1px solid #ffe0b2;"><div style="color: #e65100;">ℹ️ لم يتم العثور على نتائج في القطاع ب</div></div>`;
    }

    html += `
        <div style="margin-top: 16px; padding: 12px; background: #fff3e0; border-radius: 10px; border: 1px solid #ffcc80;">
            <div style="color: #e65100; font-weight: 600;"><i class="fas fa-lightbulb"></i> 💡 الفرق بين القطاعين:</div>
            <div style="color: #bf360c; font-size: 0.9em; margin-top: 8px;">
                <strong>القطاع أ:</strong> يتطلب ممارسة النشاط في مناطق محددة (حوافز أعلى 50%)<br>
                <strong>القطاع ب:</strong> يمكن ممارسته في أي مكان (حوافز 30%)
            </div>
        </div>
    `;
    return html;
}

/**
 * دالة مساعدة لعرض نتائج قطاع معين
 */
function formatSectorResultsSection(sector, results, activityName) {
    const sectorName = sector === 'A' ? 'القطاع أ' : 'القطاع ب';
    const sectorColor = sector === 'A' ? '#4caf50' : '#2196f3';
    const bgLight = sector === 'A' ? '#e8f5e9' : '#e3f2fd';
    const bgDark = sector === 'A' ? '#c8e6c9' : '#bbdefb';

    let html = `
        <div style="margin-top: 16px; padding: 14px; background: linear-gradient(135deg, ${bgLight}, ${bgDark}); border-radius: 12px; border-right: 3px solid ${sectorColor};">
            <div style="color: ${sector === 'A' ? '#2e7d32' : '#1565c0'}; font-weight: 700; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>${sector === 'A' ? '🏭' : '🌍'} ${sectorName} <small style="color: #666;">(${sector === 'A' ? 'مناطق محددة' : 'جميع المناطق'})</small></div>
                <span style="background: ${sectorColor}; color: white; padding: 2px 10px; border-radius: 12px;">${results.length} نشاط</span>
            </div>
            <div style="max-height: 350px; overflow-y: auto;">
    `;

    results.forEach((result, index) => {
        const item = result.item || result;
        html += `
            <div class="choice-btn" onclick="selectSpecificActivityInDecision104('${item.activity.replace(/'/g, "\\'")}', '${sector}')" 
                 style="margin: 8px 0; text-align: right; background: white; border: 2px solid ${sectorColor}; border-left: 6px solid ${sectorColor};">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <strong style="color: ${sector === 'A' ? '#2e7d32' : '#1565c0'};">${item.activity}</strong>
                        <span style="background: ${sectorColor}20; color: ${sector === 'A' ? '#2e7d32' : '#1565c0'}; padding: 2px 8px; border-radius: 12px;">${sectorName}</span>
                    </div>
                    <div style="color: #666; font-size: 0.85em;">
                        <span style="background: ${bgLight}; padding: 2px 8px; border-radius: 4px;">🏷️ ${item.mainSector}</span>
                        <span style="background: ${bgDark}; padding: 2px 8px; border-radius: 4px;">📂 ${item.subSector}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += `</div></div>`;
    return html;
}

/**
 * عرض الشروط العامة والخاصة للقطاع ب
 */
function renderSectorBConditions() {
    const genConditions = window.decision104?.sectorBGeneralConditions || { title: 'الشروط العامة', conditions: [] };
    const transConditions = window.decision104?.transportSpecialConditions || { title: 'ضوابط النقل الجماعي', conditions: [] };

    let html = `<div style="border-right: 5px solid #2196f3; padding: 15px; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); direction: rtl;">`;
    html += `<h4 style="color: #1565c0; margin-top:0; border-bottom: 2px solid #e3f2fd; padding-bottom: 10px;">⚖️ الشروط العامة والخاصة - القطاع ب</h4>`;

    html += `<div style="margin-bottom: 20px;"><strong style="color: #0d47a1;">📌 الشروط العامة للاستحقاق:</strong>`;
    html += `<p style="font-size: 0.9em; color: #444; background: #e3f2fd; padding: 10px; border-radius: 8px;">${genConditions.title}</p><ul style="font-size: 0.85em; color: #555; padding-right: 20px;">`;
    genConditions.conditions.forEach(c => html += `<li style="margin-bottom: 5px;">${c.text}</li>`);
    html += `</ul></div>`;

    html += `<div style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 15px;"><strong style="color: #e65100;">🚌 ضوابط خاصة (النقل الجماعي للمدن الجديدة):</strong><ul style="font-size: 0.85em; color: #555; padding-right: 20px;">`;
    transConditions.conditions.forEach(c => html += `<li style="margin-bottom: 5px;">${c.text}</li>`);
    html += `</ul></div></div>`;

    return html;
}

/**
 * عرض رسالة عدم العثور على النشاط مع خيارات بديلة
 */
function formatActivityNotFoundInDecision104(activityName, sector) {
    const sectorText = sector === 'A' ? 'القطاع أ' : sector === 'B' ? 'القطاع ب' : 'القرار 104';
    return `
        <div class="info-card" style="background: linear-gradient(135deg, #fff3e0, #ffe0b2); border-left: 4px solid #ff9800;">
            <div class="info-card-header" style="color: #e65100;">⚠️ لم يتم العثور على النشاط في ${sectorText}</div>
            <div class="info-card-content" style="color: #bf360c;">المسمى "<strong>${activityName}</strong>" غير مدرج بشكل حرفي في قوائم القرار.</div>
        </div>
        <div class="choice-btn" onclick="sendMessage('ما هي أنشطة القطاع أ')"><span class="choice-icon">📋</span> قائمة أنشطة القطاع أ</div>
        <div class="choice-btn" onclick="sendMessage('ما هي أنشطة القطاع ب')"><span class="choice-icon">📋</span> قائمة أنشطة القطاع ب</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
            <div class="choice-btn" onclick="sendMessage('الأنشطة الرئيسية للقطاع أ')" style="margin:0; background: #f1f8e9;">📁 الأنشطة الرئيسية (أ)</div>
            <div class="choice-btn" onclick="sendMessage('الأنشطة الرئيسية للقطاع ب')" style="margin:0; background: #e3f2fd;">📁 الأنشطة الرئيسية (ب)</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="choice-btn" onclick="sendMessage('ما هي المناطق الجغرافيه للقطاع أ')" style="background: #fffde7;">🗺️ مواقع القطاع أ</div>
            <div class="choice-btn" onclick="sendMessage('عرض الشروط العامة والخاصة للقطاع ب')" style="background: #f0f7ff;">⚖️ شروط القطاع ب</div>
        </div>
    `;
}

// ==================== 🧠 ذاكرة القرار 104 (إضافة إلى AgentMemory) ====================

// نضيف دالة setDecisionActivity إلى كائن AgentMemory إذا لم تكن موجودة
if (!AgentMemory.setDecisionActivity) {
    AgentMemory.setDecisionActivity = function(itemData, originalQuery) {
        this.currentContext = {
            type: 'decision_activity',
            timestamp: Date.now(),
            query: originalQuery,
            data: itemData,
            sector: itemData.sector,
            name: itemData.activity
        };
        console.log("💾 [Memory] تم حفظ نشاط القرار 104:", itemData.activity);
    };
}

// ==================== 🆕 أزرار البحث الذكية (المستخدمة في gpt_activities.js) ====================

/**
 * عرض الأزرار الذكية للبحث عن النشاط في القرار 104
 * @param {string} activityName - اسم النشاط
 * @returns {string} HTML
 */
function showSmartSearchButtons(activityName) {
    const escapedActivity = escapeForJS(activityName);
    return `
        <div class="smart-search-container">
            <div class="smart-search-header"><i class="fas fa-search"></i><span>للبحث فى قرار مجلس الوزراء رقم 104</span></div>
            <div class="smart-search-text">يمكنك البحث عن هذا النشاط بسرعة باستخدام الأزرار التالية:</div>
            <div class="smart-search-buttons">
                <div class="smart-btn smart-btn-comprehensive" onclick="window.gptAgent.smartSearch('${escapedActivity}', 'comprehensive')">
                    <div class="smart-btn-left"><div class="smart-btn-icon"><i class="fas fa-globe"></i></div><div class="smart-btn-text">هل نشاط ${activityName} وارد بالقرار 104</div></div>
                    <i class="fas fa-arrow-left smart-btn-arrow"></i>
                </div>
                <div class="smart-btn smart-btn-sector-a" onclick="window.gptAgent.smartSearch('${escapedActivity}', 'sectorA')">
                    <div class="smart-btn-left"><div class="smart-btn-icon"><i class="fas fa-industry"></i></div><div class="smart-btn-text">هل نشاط ${activityName} وارد بالقطاع أ</div></div>
                    <i class="fas fa-arrow-left smart-btn-arrow"></i>
                </div>
                <div class="smart-btn smart-btn-sector-b" onclick="window.gptAgent.smartSearch('${escapedActivity}', 'sectorB')">
                    <div class="smart-btn-left"><div class="smart-btn-icon"><i class="fas fa-building"></i></div><div class="smart-btn-text">هل نشاط ${activityName} وارد بالقطاع ب</div></div>
                    <i class="fas fa-arrow-left smart-btn-arrow"></i>
                </div>
            </div>
        </div>
    `;
}

/**
 * دالة البحث الذكي (يتم استدعاؤها عند الضغط على الأزرار)
 */
function smartSearchFixed(activityName, searchType) {
    console.log(`🎯 [Smart Search] النشاط: "${activityName}" - النوع: ${searchType}`);
    
    // بناء الاستعلام المناسب حسب نوع البحث
    let query = '';
    switch(searchType) {
        case 'comprehensive':
            query = `هل نشاط ${activityName} وارد بالقرار 104`;
            break;
        case 'sectorA':
            query = `هل نشاط ${activityName} وارد بالقطاع أ`;
            break;
        case 'sectorB':
            query = `هل نشاط ${activityName} وارد بالقطاع ب`;
            break;
        default:
            console.error('نوع بحث غير معروف:', searchType);
            return;
    }

    console.log(`🎯 [Smart Search] إرسال الاستعلام: "${query}"`);

    // استدعاء sendMessage لمعالجة الاستعلام بنفس طريقة الكتابة اليدوية
    if (typeof window.sendMessage === 'function') {
        window.sendMessage(query);
    } else {
        console.error('❌ sendMessage غير متوفرة');
        // يمكنك إضافة fallback هنا إذا أردت (اختياري)
    }
}

// دالة مساعدة للتهرب من علامات التنصيص (نسخة مبسطة)
function escapeForJS(text) {
    if (!text) return "";
    return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
}

// ==================== 🆕 دالة فحص القرار 104 لنشاط (تستخدمها gpt_activities.js) ====================

/**
 * دالة فحص ما إذا كان النشاط مدرجاً في القرار 104، مع إرجاع HTML مناسب
 * @param {string} activityName - اسم النشاط
 * @returns {string|null} HTML أو null إذا لم يوجد
 */
function checkDecision104Full(activityName) {
    if (typeof window.decision104 === 'undefined' || !window.decision104.unifiedSearchDB) return null;
    const found = window.decision104.unifiedSearchDB.find(item => 
        activityName.includes(item.activity) || item.activity.includes(activityName)
    );
    if (found) {
        return `
            <div class="decision-badge">⭐ هذا النشاط مدرج في القرار 104 لسنة 2022</div>
            <div class="info-card" style="background: linear-gradient(135deg, #fff9c4, #fffde7); border-left-color: #f57f17;">
                <div class="info-card-header" style="color: #f57f17;">🎯 تفاصيل القرار 104</div>
                <div class="info-card-content" style="color: #e65100;">
                    <div class="info-row"><div class="info-label">📊 القطاع:</div><div class="info-value"><strong>القطاع ${found.sector}</strong></div></div>
                    <div class="info-row"><div class="info-label">🏢 القطاع الرئيسي:</div><div class="info-value">${found.mainSector}</div></div>
                    <div class="info-row"><div class="info-label">📂 القطاع الفرعي:</div><div class="info-value">${found.subSector}</div></div>
                    <div class="info-row"><div class="info-label">💰 الحوافز:</div><div class="info-value">يتمتع بالحوافز والإعفاءات المقررة</div></div>
                </div>
            </div>
        `;
    }
    return showSmartSearchButtons(activityName);
}

// ==================== 🎯 تصدير الدوال العامة ====================

window.gptAgent = window.gptAgent || {};
window.gptAgent.smartSearch = smartSearchFixed;
window.gptAgent.showSmartSearchButtons = showSmartSearchButtons;
window.handleDecision104Query = handleDecision104Query;
window.checkDecision104Full = checkDecision104Full;

window.selectSpecificActivityInDecision104 = function(activityName, sector) {
    console.log(`🚀 [Click Handler] تم اختيار النشاط: "${activityName}" - القطاع: ${sector}`);
    let itemData = null;
    const dataSource = (sector === 'A') ? window.sectorAData : window.sectorBData;
    if (dataSource) {
        const normalizedTarget = normalizeArabic(activityName);
        for (const [mainSector, subSectors] of Object.entries(dataSource)) {
            for (const [subSector, activities] of Object.entries(subSectors)) {
                const found = activities.find(act => {
                    const normAct = normalizeArabic(act);
                    return normAct === normalizedTarget || normAct.includes(normalizedTarget) || normalizedTarget.includes(normAct);
                });
                if (found) {
                    itemData = { activity: found, mainSector, subSector, sector };
                    break;
                }
            }
            if (itemData) break;
        }
    }
    if (!itemData) {
        console.warn("⚠️ [Click Handler] لم يتم العثور على التفاصيل الكاملة، استخدام بيانات الطوارئ.");
        itemData = { activity: activityName, mainSector: "غير محدد", subSector: "غير محدد", sector };
    }
    addMessageToUI('user', activityName);
    AgentMemory.setDecisionActivity(itemData, activityName);
    const responseHTML = formatSingleActivityInDecision104WithIncentives(itemData.activity, itemData, sector);
    const typingId = showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator(typingId);
        typeWriterResponse(responseHTML);
    }, 500);
};

console.log('✅ gpt_decision104.js - تم تحميله بنجاح مع فصل المسؤوليات.');