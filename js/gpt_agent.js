// gpt_agent.js
/****************************************************************************
 * 🤖 GPT-  Like Agent v10.0 - HYBRID SEMANTIC EDITION
 * 
 * ⚡ الميزات الثورية:
 * ✓ محرك دلالي هجين (HybridSearchV1) - بحث ذكي بتقنية E5 Embeddings
 * ✓ ذاكرة سياقية متقدمة مع التخزين الدائم
 * ✓ نافذة تحميل ذكية (مرة واحدة فقط)
 * ✓ تطبيع نصي متقدم للغة العربية
 * ✓ دقة عالية في فهم الأسئلة المعقدة
 * ✓ ربط ديناميكي مع القرار 104
 * ✓ واجهة محسنة وتجربة سلسة
 ****************************************************************************/

// تهيئة كائن الوكيل العالمي
window.GPT_AGENT = window.GPT_AGENT || {};

if (document.getElementById('gptFloatBtn')) {
    console.log("✅ GPT Agent already loaded.");
} else {

// ==================== ربط ملف التنسيقات (CSS) ====================
const styleLink = document.createElement('link');
styleLink.rel = 'stylesheet';
styleLink.href = 'js/gpt-agent-style.css';
document.head.appendChild(styleLink);

// ==================== الهيكل (HTML) ====================
const chatHTML = `
    <div class="gpt-float-btn" id="gptFloatBtn">
        <i class="fas fa-bolt"></i>
    </div>

    <div class="gpt-chat-container" id="gptChatContainer" style="display: none;"> 
        <div class="gpt-header">
            <div class="gpt-title">
                <i class="fas fa-brain"></i>
                مساعد لأعضاء اللجان
                <div class="gpt-status"></div>
            </div>
            <div class="gpt-header-actions">
                <div class="gpt-settings-btn" onclick="window.showGPTVoiceSelector()" title="إعدادات الصوت">
                    <i class="fas fa-cog"></i>
                </div>
                <div class="gpt-clear-btn" onclick="clearMemoryWithConfirm()" title="مسح الذاكرة">
                    <i class="fas fa-eraser"></i>
                </div>
                <div class="gpt-expand-btn" id="gptExpandBtn" onclick="toggleExpandChat()" title="توسيع/تصغير">
                    <i class="fas fa-expand-alt"></i>
                </div>
                <div class="gpt-close" onclick="toggleGPTChat()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        </div>
        
        <div class="gpt-messages" id="gptMessages">
            <div class="message-row ai">
                <div class="avatar ai"><i class="fas fa-sparkles"></i></div>
                <div class="message-bubble">
                    🧠 <strong>مرحباً! أنا مساعدك الذكي المطور</strong><br><br>
                    يمكنني مساعدتك في:<br>
                    ✅ الأنشطة والتراخيص بالتفاصيل الكاملة<br>
                    ✅ المناطق الصناعية (عدد، مواقع، قرارات)<br>
                    ✅ القرار 104 والحوافز الاستثمارية<br>
                    ✅ الملاحظات الفنية لفريق اللجنة<br>
                    ✅ الجهات الصادرة للتراخيص والسند التشريعي<br><br>
                    <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                          font-weight: bold;">🚀 محرك بحث دلالي متقدم • ذاكرة سياقية ذكية</span><br><br>
                    <em style="color: #10a37f;">جرب أن تسأل: "مصنع مستحضرات طبية"</em>
                </div>
            </div>
        </div>

        <div class="gpt-input-area">
            <div class="gpt-input-wrapper" id="gptInputWrapper">
                <textarea class="gpt-input" id="gptInput" placeholder="اكتب سؤالك هنا أو اضغط على المايك..." rows="1" oninput="autoResize(this); checkInputState()" onkeydown="handleEnter(event)"></textarea>
                
                <div class="gpt-voice-controls" id="gptVoiceControls" style="display: none; margin-left: 8px;">
                    <button class="voice-btn speaker" id="gptSpeakerBtn" title="كتم الصوت" onclick="window.toggleSpeech()">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
                
                <button class="gpt-action-btn" id="gptActionBtn" title="التحدث بالصوت" onclick="handleActionButtonClick()">
                    <i class="fas fa-microphone" id="actionIcon"></i>
                </button>
            </div>
            
            <div class="voice-wave" id="voiceWave" style="display: none;">
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
            </div>
            
            <div class="voice-text" id="voiceText" style="display: none;"></div>
        </div>
    </div>

    <!-- نافذة التحميل الأولي -->
    <!-- نافذة التحميل الأولي (تم توحيد المعرفات) -->
    <div id="gpt-onboarding" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
         background: rgba(0,0,0,0.85); z-index: 999999; justify-content: center; align-items: center;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
             padding: 40px; border-radius: 20px; text-align: center; max-width: 500px; 
             box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="font-size: 60px; margin-bottom: 20px;">🧠</div>
            <h2 style="color: white; margin: 0 0 15px 0; font-size: 24px;">تهيئة المساعد</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 0 0 25px 0; font-size: 16px;">
                جاري تحميل البيانات...<br>
                <small style="opacity: 0.8;">(هذه العملية تتم مرة واحدة فقط)</small>
            </p>
            <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 15px;">
                <div id="onboarding-progress" style="background: white; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
            </div>
            <div id="onboarding-status" style="color: rgba(255,255,255,0.8); font-size: 14px; min-height: 20px;">
                التحضير...
            </div>
        </div>
    </div>
`;

document.body.insertAdjacentHTML('beforeend', chatHTML);

// ==================== منطق التحريك (Draggable Logic) ====================
(function initDraggable() {
    const btn = document.getElementById('gptFloatBtn');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let hasMoved = false;

    function dragStart(e) {
        if (e.type === 'mousedown' && e.which !== 1) return;
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        initialLeft = btn.offsetLeft;
        initialTop = btn.offsetTop;
        startX = clientX;
        startY = clientY;
        isDragging = true;
        hasMoved = false;
        btn.style.bottom = 'auto';
        btn.style.right = 'auto';
        btn.style.left = initialLeft + "px";
        btn.style.top = initialTop + "px";

        if (e.type === 'touchstart') {
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('touchend', dragEnd);
        } else {
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', dragEnd);
        }
    }

    function dragMove(e) {
        if (!isDragging) return;
        if (e.type === 'touchmove') e.preventDefault();
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startX;
        const dy = clientY - startY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            hasMoved = true;
        }
        btn.style.left = (initialLeft + dx) + "px";
        btn.style.top = (initialTop + dy) + "px";
    }

    function dragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('touchend', dragEnd);
        if (!hasMoved && typeof toggleGPTChat === 'function') {
            toggleGPTChat();
        }
    }

    btn.addEventListener('mousedown', dragStart);
    btn.addEventListener('touchstart', dragStart, { passive: false });
})();

// ==================== أدوات المعالجة اللغوية العالمية ====================

window.normalizeArabic = function(text) {
    if (!text) return "";
    return text.toString()
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/[ةه]/g, 'ه')
        .replace(/[ىي]/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
};

window.GPT_AGENT.stopWords = ['في', 'من', 'الى', 'على', 'عن', 'هل', 'ما', 'هو', 'هي', 'ذلك', 'تلك', 'لي', 'لك', 'كيف', 'ماذا', 'متى', 'اين', 'لماذا', 'كم'];

window.extractKeywords = function(text) {
    const normalized = window.normalizeArabic(text);
    const stopWordsList = window.GPT_AGENT.stopWords || [];
    return normalized.split(/\s+/)
        .filter(word => word.length > 2 && !stopWordsList.includes(word));
};

// للاستخدام الداخلي أيضاً
const normalizeArabic = window.normalizeArabic;
const extractKeywords = window.extractKeywords;
// كاشف نوع السؤال - الإصدار المحسّن
window.detectQuestionType = function(query) {
    const q = normalizeArabic(query);

    // فحص مبكر: إذا كان السؤال عن "عدد المناطق التابعة لجهة"
    const isCountAreasForDependency = (
        /عدد.*مناطق.*تابع/i.test(q) ||
        /كم.*منطق.*تابع/i.test(q) ||
        /عدد.*منطق.*تابع/i.test(q)
    );
    if (isCountAreasForDependency) {
        return {
            isCount: true, isList: false, isLocation: false, isLicense: false, isAuthority: false,
            isLaw: false, isGuide: false, isTechnical: false, isDecision104: false,
            isDependency: true, isGovernorate: false, isIndustrial: true, isActivity: false,
            isYesNo: /هل|ايه|صح|خطأ/.test(q),
            isGeneralAreaCount: false, isSpecificAreaCount: true,
            isAreaList: false, isGovernanceAuthority: false, isLicensingAuthority: false,
            isAreaExistenceCheck: false, hasLicenseContext: false, hasLocationContext: false
        };
    }

    const hasIndustrialPattern = (
        /منطقه صناعيه|مناطق صناعيه|منطقة صناعية|مناطق صناعية/.test(q) ||
        (q.includes('صناعيه') && q.includes('منطقه')) ||
        (q.includes('صناعية') && q.includes('منطقة'))
    );
    const hasAreaKeywords = q.includes('منطقه') || q.includes('منطقة') || q.includes('صناعيه') || q.includes('صناعية');
    const hasLicenseKeywords = /ترخيص|تراخيص|رخصه|رخصة|موافقه|موافقة|اذن|إذن|اجراءات|إجراءات|متطلبات|شروط/.test(q);
    const hasLocationKeywords = /مكان|موقع|فين|اين|خريطه|خريطة|احداثيات|إحداثيات|عنوان/.test(q);
    const isGovernanceAuthority = /جهة (ولاية|تبعية|ادارة|إدارة) (المنطقة|منطقة|المناطق)/.test(q) || 
                                   /تابع(ة)? ل(ـ)?(المحافظة|الهيئة|وزارة)/.test(q);
    const isLicensingAuthority = /جهة (مصدرة|اصدار|إصدار|ترخيص|منح|موافقة)/.test(q) ||
                                  /(من|اي|أي) (يصدر|تصدر|يمنح|تمنح) (الترخيص|الرخصة)/.test(q);
    const isAreaExistenceCheck = /هل/.test(q) && hasIndustrialPattern && 
                                  !hasLicenseKeywords && 
                                  !/(ترخيص|نشاط|مشروع)/.test(q);
    const isDecision104 = /قرار.*104|104|حافز|حوافز|قطاع\s*(أ|ا|ب)/.test(q) ||
    /\b(وارد|مدرج|مشمول|يستفيد|يندرج|يخضع)\b/.test(q) ||
    /\b(اعفاء|إعفاء|اعفاءات|إعفاءات|مزايا|ضريبي|ضريبية|ضريبيه)\b/.test(q) ||
    /هل\s*(هو|هي|ده|دي|النشاط)?\s*(له|لها)?\s*(مزايا|حوافز|اعفاء|إعفاء)/.test(q) ||
    /هل\s*(هو|هي|ده|دي)?\s*(مشمول|مدرج|وارد|يستفيد|ينضوي)/.test(q);

    return {
        isCount: /عدد|كام|كم|تعداد|عدده/.test(q),
        isList: /اسماء|قائمه|قائمة|اذكر|وضح|ايه|اي|ما هي|عرض|اظهر/.test(q),
        isLocation: hasLocationKeywords,
        isLicense: hasLicenseKeywords,
        isAuthority: /جهه|جهة|هيئه|هيئة|وزاره|وزارة|مسئول|مسؤول|من يصدر/.test(q),
        isLaw: /قانون|سند|تشريع|قرار|تشريعي/.test(q),
        isGuide: /دليل|جايد|guide|رابط|لينك|تحميل|مجلد/.test(q),
        isTechnical: /ملاحظات|فنيه|فنية|معاينه|معاينة|لجنه|لجنة|فحص/.test(q),
        isDecision104: isDecision104,
        isDependency: /تابع|تبعيه|تبعية|ولايه|ولاية|جهه ولايه|جهة ولاية/.test(q),
        isGovernorate: /محافظه|محافظة|مدينه|مدينة|مركز|قرية/.test(q),
        isIndustrial: hasIndustrialPattern || hasAreaKeywords,
        isActivity: /نشاط|مشروع|عمل|business/.test(q),
        isYesNo: /هل|ايه|صح|خطأ|صحيح|غلط/.test(q),
        isGeneralAreaCount: (q.includes('عدد') && hasAreaKeywords && !/(محافظه|جهه|ولاية|تابع)/.test(q)),
        isSpecificAreaCount: (q.includes('عدد') && hasAreaKeywords && /(محافظه|جهه|ولاية|تابع)/.test(q)),
        isAreaList: (
            (q.includes('ما هي') && hasAreaKeywords) || 
            (q.includes('قائمه') && hasAreaKeywords) ||
            (q.includes('عرض') && hasAreaKeywords) || 
            (q.includes('اظهر') && hasAreaKeywords) ||
            (q.includes('المناطق') && q.includes('تابعه')) ||
            (q.includes('المناطق') && q.includes('تبعية')) ||
            (q.includes('المناطق') && q.includes('تبع'))
        ),
        isGovernanceAuthority: isGovernanceAuthority,
        isLicensingAuthority: isLicensingAuthority,
        isAreaExistenceCheck: isAreaExistenceCheck,
        hasLicenseContext: hasLicenseKeywords,
        hasLocationContext: hasLocationKeywords
    };
};

// ==================== 🧠 محلل السياق الذكي ====================
function analyzeContext(query, questionType) {
    const q = normalizeArabic(query);
    let areaScore = 0;
    let activityScore = 0;
    const hasAreaKeywords = q.includes('منطقه') || q.includes('منطقة') || q.includes('صناعيه') || q.includes('صناعية');
    const hasLicenseContext = /ترخيص|تراخيص|متطلبات|شروط|اجراءات/.test(q);

    if (questionType.isGeneralAreaCount) areaScore += 2000;
    if (questionType.isSpecificAreaCount) areaScore += 1900;
    if (questionType.isAreaList) areaScore += 1850;
    if (questionType.isGovernanceAuthority) areaScore += 1800;
    if (questionType.isAreaExistenceCheck) areaScore += 1750;

    if (hasAreaKeywords) {
        if (/عرض|اظهر/.test(q) && /(كل|جميع)/.test(q)) {
            areaScore += 1850;
        } else if (/(كل|جميع)/.test(q) && !hasLicenseContext) {
            areaScore += 1700;
        }
    }

    if (questionType.isCount && /منطقه|منطقة|مناطق/.test(q)) {
        areaScore += 1500;
    }

    if (/منطقة صناعية/.test(q) || /مناطق صناعية/.test(q)) areaScore += 1000;
    if (questionType.hasLocationContext && questionType.isIndustrial) areaScore += 800;
    if (questionType.isGovernorate && questionType.isIndustrial) areaScore += 700;
    if (/قرار (إنشاء|انشاء)/.test(q)) areaScore += 700;
    if (/موقع.*منطقة/.test(q) || /مكان.*منطقة/.test(q)) areaScore += 750;
    if (/(محافظة|محافظه).*صناعية/.test(q)) areaScore += 600;
    if (questionType.isDependency && questionType.isIndustrial) areaScore += 650;

    if (questionType.hasLicenseContext && questionType.isIndustrial) {
        areaScore -= 400;
    }
    if (questionType.hasLocationContext && questionType.isActivity) {
        activityScore -= 300;
    }

    const hasSpecificAreaName = checkForSpecificAreaName(q);
    if (hasSpecificAreaName.found) {
        areaScore += 500;
    }

    const hasSpecificActivityType = checkForSpecificActivityType(q);
    if (hasSpecificActivityType.found) {
        activityScore += 500;
    }

    const delta = areaScore - activityScore;
    const totalScore = areaScore + activityScore;
    const confidence = totalScore > 0 ? Math.min(Math.abs(delta) / totalScore * 100, 100) : 0;

    return {
        areaScore, activityScore, delta, confidence: Math.round(confidence),
        recommendation: delta > 300 ? 'areas' : delta < -300 ? 'activities' : 'ambiguous',
        needsClarification: Math.abs(delta) < 300 && totalScore > 0,
        specificAreaName: hasSpecificAreaName.name || null,
        specificActivityType: hasSpecificActivityType.type || null
    };
}

// ==================== 🔍 فحص وجود اسم منطقة محددة ====================
function checkForSpecificAreaName(normalizedQuery) {
    if (typeof industrialAreasData === 'undefined') return { found: false, name: null };
    for (const area of industrialAreasData) {
        const areaName = normalizeArabic(area.name);
        const simplifiedName = areaName.replace(/المنطقة الصناعية/g, '').replace(/المنطقه الصناعيه/g, '').replace(/ب/g, '').trim();
        if (normalizedQuery.includes(areaName)) return { found: true, name: area.name };
        if (simplifiedName.length > 4 && normalizedQuery.includes(simplifiedName)) return { found: true, name: area.name };
    }
    return { found: false, name: null };
}

// ==================== 🎯 مستخرج الكيانات ====================
function extractEntities(query) {
    const q = normalizeArabic(query);
    const governorates = extractGovernorates(q);
    const dependencies = extractDependencies(q);
    const areaNames = extractAreaNames(q);
    const activityTypes = extractActivityTypes(q);
    return {
        governorates, dependencies, areaNames, activityTypes,
        hasGovernorate: governorates.length > 0,
        hasDependency: dependencies.length > 0,
        hasAreaName: areaNames.length > 0,
        hasActivityType: activityTypes.length > 0
    };
}

// ==================== 📍 استخراج المحافظات ====================
function extractGovernorates(normalizedQuery) {
    if (typeof industrialAreasData === 'undefined') return [];
    const governorates = [...new Set(industrialAreasData.map(a => a.governorate))];
    return governorates.filter(gov => normalizedQuery.includes(normalizeArabic(gov)));
}

// ==================== 🏛️ استخراج جهات الولاية ====================
function extractDependencies(normalizedQuery) {
    if (typeof industrialAreasData === 'undefined') return [];
    const dependencies = [...new Set(industrialAreasData.map(a => a.dependency))];
    const found = [];
    for (const dep of dependencies) {
        const normalizedDep = normalizeArabic(dep);
        const depKeywords = normalizedDep.split(/\s+/).filter(w => w.length > 2);
        const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
        let matchScore = 0;
        let totalPossible = depKeywords.length;
        for (const depWord of depKeywords) {
            for (const queryWord of queryWords) {
                if (depWord === queryWord) { matchScore += 2; break; }
                else if (depWord.includes(queryWord) && queryWord.length > 2) { matchScore += 1.5; break; }
                else if (queryWord.includes(depWord) && depWord.length > 2) { matchScore += 1.5; break; }
                else if (depWord.length > 3 && queryWord.length > 3) {
                    const similarity = calculateSimilarity(depWord, queryWord);
                    if (similarity > 0.7) { matchScore += 1; break; }
                }
            }
        }
        const matchPercentage = (matchScore / (totalPossible * 2)) * 100;
        if (matchPercentage >= 30) found.push(dep);
    }
    return found;
}

function calculateSimilarity(word1, word2) {
    const len1 = word1.length, len2 = word2.length;
    const maxLen = Math.max(len1, len2);
    let matches = 0;
    for (let i = 0; i < Math.min(len1, len2); i++) {
        if (word1[i] === word2[i]) matches++;
    }
    return matches / maxLen;
}

// ==================== 🏭 استخراج أسماء المناطق ====================
function extractAreaNames(normalizedQuery) {
    if (typeof industrialAreasData === 'undefined') return [];
    const found = [];
    for (const area of industrialAreasData) {
        const areaName = normalizeArabic(area.name);
        const distinctiveName = areaName.replace(/المنطقة الصناعية/g, '').replace(/المنطقه الصناعيه/g, '').replace(/^ب/g, '').trim();
        if (distinctiveName.length > 3) {
            if (normalizedQuery.includes(distinctiveName)) {
                found.push({ name: area.name, distinctiveName, matchType: 'full', confidence: 100 });
                continue;
            }
            const words = distinctiveName.split(/\s+/).filter(w => w.length > 2);
            let matchedWords = 0;
            for (const word of words) {
                if (normalizedQuery.includes(word)) matchedWords++;
            }
            if (matchedWords > 0) {
                const confidence = Math.round((matchedWords / words.length) * 100);
                if (confidence >= 60) found.push({ name: area.name, distinctiveName, matchType: 'partial', confidence });
            }
        }
    }
    return found.sort((a, b) => b.confidence - a.confidence);
}

// ==================== 📋 استخراج أنواع الأنشطة ====================
function extractActivityTypes(normalizedQuery) {
    if (typeof masterActivityDB === 'undefined') return [];
    const found = [];
    for (const activity of masterActivityDB) {
        const activityText = normalizeArabic(activity.text);
        if (normalizedQuery.includes(activityText)) {
            found.push({ text: activity.text, value: activity.value, matchType: 'exact', confidence: 100 });
            continue;
        }
        if (activity.keywords) {
            for (const keyword of activity.keywords) {
                const normalizedKeyword = normalizeArabic(keyword);
                if (normalizedQuery.includes(normalizedKeyword)) {
                    found.push({ text: activity.text, value: activity.value, matchType: 'keyword', confidence: 80 });
                    break;
                }
            }
        }
        if (activity.synonyms) {
            for (const synonym of activity.synonyms) {
                const normalizedSynonym = normalizeArabic(synonym);
                if (normalizedQuery.includes(normalizedSynonym)) {
                    found.push({ text: activity.text, value: activity.value, matchType: 'synonym', confidence: 70 });
                    break;
                }
            }
        }
    }
    const unique = [];
    const seen = new Set();
    for (const item of found) {
        if (!seen.has(item.value)) {
            seen.add(item.value);
            unique.push(item);
        }
    }
    return unique.sort((a, b) => b.confidence - a.confidence);
}

// ==================== 🤔 آلية الاستفسار الذكية ====================
function requestClarification(query, context, entities, questionType) {
    const q = normalizeArabic(query);
    const ambiguityType = detectAmbiguityType(query, context, entities, questionType);
    if (!ambiguityType) return null;
    switch (ambiguityType.type) {
        case 'authority_confusion': return buildAuthorityClairification(query, entities);
        case 'area_vs_activity': return buildAreaVsActivityClarification(query, entities);
        case 'multiple_areas': return buildMultipleAreasClarification(entities.areaNames);
        case 'multiple_activities': return buildMultipleActivitiesClarification(entities.activityTypes);
        case 'dependency_confusion': return buildDependencyClarification(entities.dependencies);
        default: return buildGeneralClarification(query, context);
    }
}

function detectAmbiguityType(query, context, entities, questionType) {
    const q = normalizeArabic(query);
    if (questionType.isAuthority && !questionType.isGovernanceAuthority && !questionType.isLicensingAuthority) {
        if (q.includes('جهه') || q.includes('جهة')) return { type: 'authority_confusion', confidence: 90 };
    }
    if (context.needsClarification && Math.abs(context.delta) < 200) return { type: 'area_vs_activity', confidence: 85 };
    if (entities.areaNames.length > 1 && entities.areaNames[0].confidence < 100) return { type: 'multiple_areas', confidence: 80 };
    if (entities.activityTypes.length > 1 && entities.activityTypes[0].confidence < 100) return { type: 'multiple_activities', confidence: 75 };
    if (entities.dependencies.length > 1) return { type: 'dependency_confusion', confidence: 70 };
    return null;
}

function buildAuthorityClairification(query, entities) {
    return `
        <div class="clarification-card">
            <div class="clarification-header"><div class="clarification-icon">🤔</div><div class="clarification-title">سؤالك يحتمل أكثر من معنى</div></div>
            <div class="clarification-subtitle">هل تقصد:</div>
            <div class="choice-btn" onclick="clarifyIntent('governance_authority')">
                <span class="choice-icon">🏛️</span> 
                <div class="choice-content"><strong>جهة الولاية للمنطقة الصناعية</strong><small>أي جهة حكومية تتبع لها المنطقة (محافظة، هيئة، وزارة)</small></div>
            </div>
            <div class="choice-btn" onclick="clarifyIntent('licensing_authority')">
                <span class="choice-icon">📋</span> 
                <div class="choice-content"><strong>الجهة المُصدرة لتراخيص الأنشطة</strong><small>الجهة التي تمنح التراخيص لممارسة النشاط</small></div>
            </div>
        </div>
    `;
}

function buildAreaVsActivityClarification(query, entities) {
    const areaContext = entities.hasAreaName ? `للمنطقة ${entities.areaNames[0].distinctiveName}` : 'للمناطق الصناعية';
    const activityContext = entities.hasActivityType ? `لنشاط ${entities.activityTypes[0].text}` : 'للأنشطة';
    return `
        <div class="clarification-card">
            <div class="clarification-header"><div class="clarification-icon">🤔</div><div class="clarification-title">سؤالك يحتمل معنيين مختلفين</div></div>
            <div class="clarification-subtitle">هل تبحث عن:</div>
            <div class="choice-btn" onclick="clarifyIntent('industrial_areas')">
                <span class="choice-icon">🏭</span> 
                <div class="choice-content"><strong>معلومات عن المناطق الصناعية</strong><small>الموقع، جهة الولاية، المساحة، قرار الإنشاء ${areaContext}</small></div>
            </div>
            <div class="choice-btn" onclick="clarifyIntent('business_activities')">
                <span class="choice-icon">📋</span> 
                <div class="choice-content"><strong>تراخيص ومتطلبات الأنشطة</strong><small>التراخيص المطلوبة، الإجراءات، الجهات المٌصدرة ${activityContext}</small></div>
            </div>
        </div>
    `;
}

function buildMultipleAreasClarification(areaNames) {
    let optionsHTML = '';
    areaNames.slice(0, 3).forEach((area, index) => {
        optionsHTML += `<div class="choice-btn" onclick="selectSpecificArea('${area.name.replace(/'/g, "\\'")}')">
            <span class="choice-icon">${index === 0 ? '🎯' : '🏭'}</span> 
            <div class="choice-content"><strong>${area.name}</strong><small>تطابق ${area.confidence}% - ${area.matchType === 'full' ? 'تطابق كامل' : 'تطابق جزئي'}</small></div>
        </div>`;
    });
    return `
        <div class="clarification-card">
            <div class="clarification-header"><div class="clarification-icon">🗺️</div><div class="clarification-title">وجد عدة مناطق مطابقة</div></div>
            <div class="clarification-subtitle">اختر المنطقة المقصودة:</div>
            ${optionsHTML}
        </div>
    `;
}

function buildMultipleActivitiesClarification(activityTypes) {
    let optionsHTML = '';
    activityTypes.slice(0, 3).forEach((activity, index) => {
        optionsHTML += `<div class="choice-btn" onclick="selectSpecificActivity('${activity.value}', '${activity.text.replace(/'/g, "\\'")}')">
            <span class="choice-icon">${index === 0 ? '🎯' : '📋'}</span> 
            <div class="choice-content"><strong>${activity.text}</strong><small>تطابق ${activity.confidence}% - ${activity.matchType === 'exact' ? 'تطابق دقيق' : 'مرادف'}</small></div>
        </div>`;
    });
    return `
        <div class="clarification-card">
            <div class="clarification-header"><div class="clarification-icon">📋</div><div class="clarification-title">وجد عدة أنشطة مطابقة</div></div>
            <div class="clarification-subtitle">اختر النشاط المقصود:</div>
            ${optionsHTML}
        </div>
    `;
}

function buildDependencyClarification(dependencies) {
    let optionsHTML = '';
    dependencies.forEach((dep, index) => {
        const count = industrialAreasData.filter(a => a.dependency === dep).length;
        optionsHTML += `<div class="choice-btn" onclick="selectDependency('${dep.replace(/'/g, "\\'")}')">
            <span class="choice-icon">🏛️</span> 
            <div class="choice-content"><strong>${dep}</strong><small>${count} منطقة صناعية</small></div>
        </div>`;
    });
    return `
        <div class="clarification-card">
            <div class="clarification-header"><div class="clarification-icon">🏢</div><div class="clarification-title">وجد عدة جهات ولاية مطابقة</div></div>
            <div class="clarification-subtitle">اختر جهة الولاية المقصودة:</div>
            ${optionsHTML}
        </div>
    `;
}

function buildGeneralClarification(query, context) {
    return `
        <div class="clarification-card">
            <div class="clarification-header"><div class="clarification-icon">💭</div><div class="clarification-title">لم أفهم سؤالك بوضوح</div></div>
            <div class="clarification-subtitle">يمكنك إعادة صياغة السؤال أو اختيار أحد المواضيع:</div>
            <div class="choice-btn" onclick="clarifyIntent('show_areas_options')"><span class="choice-icon">🏭</span> <strong>المناطق الصناعية</strong></div>
            <div class="choice-btn" onclick="clarifyIntent('show_activities_options')"><span class="choice-icon">📋</span> <strong>تراخيص الأنشطة</strong></div>
        </div>
    `;
}

// ==================== 🎯 دوال معالجة اختيارات التوضيح ====================
window.clarifyIntent = function(intent) {
    const input = document.getElementById('gptInput');
    switch(intent) {
        case 'governance_authority': input.value = 'المناطق الصناعية: ما جهات الولاية للمناطق الصناعية؟'; break;
        case 'licensing_authority': input.value = 'الانشطة والتراخيص: ما الجهات المُصدرة للتراخيص؟'; break;
        case 'industrial_areas': input.value = 'المناطق الصناعية: ' + document.getElementById('gptInput').value; break;
        case 'business_activities': input.value = 'الانشطة والتراخيص: ' + document.getElementById('gptInput').value; break;
        case 'show_areas_options': input.value = 'كم عدد المناطق الصناعية؟'; break;
        case 'show_activities_options': input.value = 'ما التراخيص المطلوبة لمصنع؟'; break;
    }
    sendMessage();
};

window.selectSpecificArea = function(areaName) {
    document.getElementById('gptInput').value = areaName;
    sendMessage();
};

window.selectSpecificActivity = function(value, text) {
    document.getElementById('gptInput').value = text;
    sendMessage();
};

window.selectDependency = function(dependency) {
    document.getElementById('gptInput').value = `المناطق التابعة لـ ${dependency}`;
    sendMessage();
};

// ==================== 🔍 فحص وجود نوع نشاط محدد ====================
function checkForSpecificActivityType(normalizedQuery) {
    if (typeof masterActivityDB === 'undefined') return { found: false, type: null };
    const activityIndicators = ['فندق', 'مطعم', 'مصنع', 'صيدلية', 'عيادة', 'مخزن', 'مستودع', 'ورشة', 'معمل', 'مزرعة', 'مخبز', 'محل'];
    for (const indicator of activityIndicators) {
        if (normalizedQuery.includes(indicator)) return { found: true, type: indicator };
    }
    return { found: false, type: null };
}

// ==================== 🧠 DeepIntentAnalyzer - فاحص النية العميق ====================
const DeepIntentAnalyzer = {
    knownActivityWords: [
        'فندق', 'مطعم', 'مصنع', 'صيدلية', 'عيادة', 'مخزن', 'مستودع', 'ورشة', 'معمل', 'مزرعة', 'مخبز', 'محل',
        'كافيه', 'كافتيريا', 'بقالة', 'سوبر', 'جزار', 'حلاوي', 'نجار', 'سباك', 'كهربائي', 'طبيب', 'دكتور', 'بيطري',
        'مدرسة', 'جامعة', 'معهد', 'محطة', 'مزار', 'منتجع'
    ],
    isStandaloneActivity(query) {
        const q = normalizeArabic(query).trim();
        const words = q.split(/\s+/).filter(w => w.length > 1);
        if (words.length <= 2) {
            for (const actWord of this.knownActivityWords) {
                if (q.includes(normalizeArabic(actWord))) return { found: true, activity: actWord };
            }
        }
        return { found: false };
    },
    scanForAreaName(query) {
        if (typeof industrialAreasData === 'undefined' || !industrialAreasData) return { found: false, score: 0, areaName: null };
        const q = normalizeArabic(query);
        const queryWords = q.split(/\s+/).filter(w => w.length > 2);
        if (queryWords.length === 0) return { found: false, score: 0, areaName: null };
        let bestMatch = { found: false, score: 0, areaName: null, area: null };
        for (const area of industrialAreasData) {
            const areaName = normalizeArabic(area.name);
            const areaWords = areaName.replace(/المنطقة الصناعية/g, '').replace(/المنطقه الصناعيه/g, '').replace(/^ب/g, '').split(/\s+/).filter(w => w.length > 2 && !['في', 'من', 'على', 'الي'].includes(w));
            if (areaWords.length === 0) continue;
            let matchedQueryWords = 0;
            for (const qWord of queryWords) {
                for (const aWord of areaWords) {
                    if (aWord === qWord || aWord.includes(qWord) || qWord.includes(aWord)) {
                        matchedQueryWords++;
                        break;
                    }
                }
            }
            const coverage = matchedQueryWords / queryWords.length;
            if (coverage >= 0.4 && matchedQueryWords > 0) {
                const score = coverage * 100;
                if (score > bestMatch.score) {
                    bestMatch = { found: true, score, areaName: area.name, area };
                }
            }
        }
        return bestMatch;
    },
    analyze(query) {
        const activityCheck = this.isStandaloneActivity(query);
        if (activityCheck.found) return { intent: 'activity', confidence: 95, reason: 'standalone_activity', details: activityCheck };
        const areaCheck = this.scanForAreaName(query);
        if (areaCheck.found && areaCheck.score >= 50) return { intent: 'industrial', confidence: areaCheck.score, reason: 'deep_area_scan', details: areaCheck };
        if (areaCheck.found && areaCheck.score >= 40) return { intent: 'probable_industrial', confidence: areaCheck.score, reason: 'weak_area_scan', details: areaCheck };
        return { intent: 'unknown', confidence: 0, reason: 'no_signal', details: null };
    }
};


   

// ==================== 🔍 البحث في المناطق الصناعية باستخدام NeuralSearch ====================
function searchIndustrialZonesWithNeural(query) {
    const q = normalizeArabic(query);
    if (q === 'المحافظه' || q === 'المحافظة' || q === 'الجهه' || q === 'الجهة') return null;
    if (typeof industrialAreasData === 'undefined' || !industrialAreasData) return null;
    console.log("🏭 البحث في المناطق باستخدام NeuralSearch:", query);
    const searchResults = NeuralSearch(query, industrialAreasData, { minScore: 50 });
    if (searchResults.results.length === 0) return null;
    const topResult = searchResults.results[0];
    if (topResult.finalScore >= 1000) return topResult.originalData;
    if (searchResults.results.length >= 2) {
        const secondScore = searchResults.results[1].finalScore;
        const scoreDiff = topResult.finalScore - secondScore;
        if (scoreDiff < 200 && secondScore >= 300) {
            AgentMemory.setClarification(searchResults.results.slice(0, 3).map(r => ({
                type: 'industrial', name: r.originalData.name, data: r.originalData, score: r.finalScore
            })));
            return null;
        }
    }
    if (topResult.finalScore >= 300) return topResult.originalData;
    return null;
}

window.generateDefaultResponse = function(query) {
    const q = normalizeArabic(query);
    if (q.length < 3) {
        return `😕 <strong>السؤال قصير جداً</strong><br><br>💡 جرب أن تسأل:<br>• "كم عدد المناطق الصناعية؟"<br>• "ما التراخيص المطلوبة لفندق؟"`;
    }
    return `😕 <strong>عذراً، لم أجد معلومات عن: "${query}"</strong><br><br>💡 جرب أحد هذه الأسئلة:<br>• "كم عدد المناطق الصناعية في مصر؟"<br>• "اذكر اسم أي نشاط"<br>• "هل نشاط النقل الجماعي وارد بالقرار 104؟"`;
};

// ==================== دالة فحص الارتباط الذكية المُحسّنة ====================
function isQueryRelatedToContext(query, context) {
    const q = normalizeArabic(query);
    const questionType = detectQuestionType(query);
    const previous = AgentMemory.getBacklinkContext();

    let isReferringToPrevious = q.includes('السابق') || q.includes('القديم') || q.includes('الاول');
    if (!isReferringToPrevious && previous && previous.data) {
        const prevName = normalizeArabic(previous.data.text || previous.data.name || "");
        const coreWords = prevName.split(/\s+/).filter(w => w.length > 3);
        isReferringToPrevious = coreWords.some(word => q.includes(word));
    }

    if (isReferringToPrevious && previous) {
        console.log("🔄 تبديل السياق للنشاط السابق المذكور جزئياً...");
        const currentBackup = { type: context.type, data: context.data };
        const nameToRestore = previous.data.text || previous.data.name;
        if (previous.type === 'activity') {
            AgentMemory.lastActivity = previous.data;
            AgentMemory.lastIndustrial = null;
        } else {
            AgentMemory.lastIndustrial = previous.data;
            AgentMemory.lastActivity = null;
        }
        AgentMemory.previousContext = currentBackup;
        AgentMemory.save();
        showGPTNotification(`تم العودة إلى: ${nameToRestore}`, 'success');
        return true;
    }

    if (!context || !context.data) return false;
    console.log("🔍 فحص الارتباط - السؤال:", query);
    console.log("📋 السياق الحالي:", context.type);

    const isShortFollowUpQuestion = (
        q.length <= 30 &&
        (
            q === 'ترخيص' || q === 'تراخيص' || q === 'موقع' || q === 'موقع ملائم' || q === 'الموقع الملائم' ||
            q === 'قرار' || q === 'قانون' || q === 'المحافظه' || q === 'المحافظة' || q.includes('محافظه') ||
            q.includes('محافظة') || q.includes('تبعيه') || q.includes('تبعية') || q === 'جهه' || q === 'جهة' ||
            q === 'الجهه المصدره' || q === 'دليل' || q === 'رابط' || q === 'ملاحظات' || q === 'ملاحظات فنيه' ||
            q === '104' || q === 'قرار 104' || q === 'حوافز' || q === 'خريطه' || q === 'خريطة' || q === 'احداثيات' ||
            q === 'هل هو وارد بالقرار 104' || q === 'هل هوارد بالقرار 104' || q === 'هل هو وارد' ||
            q === 'هل موجود' || q === 'وارد بالقرار 104' || q === 'هل موجود بالقرار 104' || q === 'هل مدرج بالقرار 104' ||
            /^(ما|ماذا|كيف|هل)\s+(ترخيص|تراخيص|موقع|قرار|جهه|دليل)/.test(q) ||
            /^(اين|فين|وين)\s/.test(q) && q.length < 15 ||
            /^هل\s*(هو|هي|هوارد|هيوارد)?\s*(وارد|موجود|مدرج)\s*(بالقرار|في القرار|ب)?\s*104?/.test(q)
        )
    );

    if (isShortFollowUpQuestion) {
        console.log("✅ سؤال مكمل قصير - مرتبط بالسياق");
        return true;
    }

    if (context.type === 'activity') {
        const isDetailedFollowUp = (
            questionType.isLicense || questionType.isAuthority || questionType.isLaw ||
            questionType.isGuide || questionType.isTechnical || questionType.isLocation || questionType.isDecision104
        );
        if (isDetailedFollowUp) {
            const deepCheck = DeepIntentAnalyzer.isStandaloneActivity(query);
            if (deepCheck.found) {
                const currentActivityName = normalizeArabic(context.data.text || "");
                const newActivityFound = normalizeArabic(deepCheck.activity);
                if (!currentActivityName.includes(newActivityFound) && !newActivityFound.includes(currentActivityName)) {
                    console.log(`⚠️ تصادم كيانات: نشاط جديد [${newActivityFound}] يختلف عن السياق الحالي [${currentActivityName}]`);
                    return false;
                }
            }
        }
        if (isDetailedFollowUp && !/(منطقه|منطقة|مناطق|صناعيه|صناعية)/.test(q)) {
            console.log("✅ سؤال تفصيلي عن النشاط - مرتبط");
            return true;
        }
    }

    if (context.type === 'industrial') {

        // ══════════════════════════════════════════════════════════════════════
        // 🔬 [مرحلة 1] استخراج الكلمات المُعرِّفة للمنطقة الحالية
        // ─────────────────────────────────────────────────────────────────────
        // الكلمات العامة التي تظهر في جميع المناطق ولا تُعرِّف منطقةً بعينها.
        // نستبعدها لأن q قد يحتويها بصورة طبيعية دون قصد الإشارة للمنطقة الحالية.
        // مثال: "الصناعيه" موجودة في اسم كل منطقة → لا تصلح معرِّفاً.
        // ══════════════════════════════════════════════════════════════════════
        const GENERIC_AREA_WORDS = new Set([
            'منطقه','منطقة','مناطق','الصناعيه','الصناعية','صناعيه','صناعية',
            'صناعي','منطقه صناعيه','منطقة صناعية','المنطقه','المنطقة',
            'الصناعي','استثماريه','استثمارية'
        ]);

        const currentAreaName = normalizeArabic(context.data?.name || '');
        // الكلمات المميِّزة فقط (طول > 3 وليست عامة)
        const distinctiveWords = currentAreaName
            .split(/\s+/)
            .filter(w => w.length > 3 && !GENERIC_AREA_WORDS.has(w));

        // ══════════════════════════════════════════════════════════════════════
        // 🔬 [مرحلة 2] هل السؤال يتحدث عن كل المناطق؟ (جمع + جار)
        // ─────────────────────────────────────────────────────────────────────
        // مؤشرات قاطعة على أن السؤال عام (يسأل عن كل المناطق دفعةً واحدة):
        //   - "للمناطق" / "جهات الولاية للمناطق" / "كل المناطق"
        //   - "المناطق الصناعية" بدون اسم مميِّز بعدها
        // ══════════════════════════════════════════════════════════════════════
        const isPlurallAreaPattern = (
            /للمناطق/.test(q) ||                               // "جهات الولاية للمناطق"
            /جهات\s+(الولايه|ولايه|ولاية)/.test(q) ||        // "جهات الولاية" صريحة
            /كل\s+(المناطق|مناطق)/.test(q) ||                 // "كل المناطق"
            /جميع\s+(المناطق|مناطق)/.test(q) ||               // "جميع المناطق"
            (/المناطق الصناعيه|المناطق الصناعية/.test(q))     // الصياغة الجمعية
        );

        // هل يذكر السؤال كلمةً مميِّزة للمنطقة الحالية؟
        const mentionsDistinctivePart = distinctiveWords.length > 0 &&
            distinctiveWords.some(w => q.includes(w));

        console.log(`🔬 [تحليل السياق] جمع=${isPlurallAreaPattern} | مميز=${mentionsDistinctivePart} | كلمات مميزة: [${distinctiveWords.join(', ')}]`);

        // ══════════════════════════════════════════════════════════════════════
        // 🔬 [مرحلة 3] القرار
        // ══════════════════════════════════════════════════════════════════════

        // ── الحالة أ: سؤال عام قاطع ─────────────────────────────────────────
        // يذكر جمع المناطق ولا يذكر اسم المنطقة الحالية بشكل مميِّز
        if (isPlurallAreaPattern && !mentionsDistinctivePart) {
            console.log("❌ [حارس عام] سؤال عام عن كل المناطق - سؤال جديد → مسح السياق");
            return false;
        }

        // ── الحالة ب: سؤال استكمالي قاطع ────────────────────────────────────
        // يذكر كلمة مميِّزة للمنطقة الحالية → استكمال بدون شك
        if (mentionsDistinctivePart) {
            console.log("✅ [استكمالي مؤكد] يذكر اسم المنطقة الحالية - مرتبط");
            return true;
        }

        // ── الحالة ج: الالتباس الحقيقي ───────────────────────────────────────
        // لا يذكر جمعاً ولا يذكر اسم المنطقة → يحتمل الأمرين
        // نتحقق من نوع السؤال: هل هو من نوع "تفصيلي محدد" يُرجَّح أنه استكمال؟
        const isDetailedFollowUp = (
            questionType.isLocation || questionType.isLaw || questionType.isDependency ||
            /قرار|انشاء|مساحه|فدان|احداثيات/.test(q)
        );

        if (isDetailedFollowUp && q.length <= 25 && !/ترخيص|تراخيص|نشاط|مشروع/.test(q)) {
            // سؤال قصير + تفصيلي بدون جمع = مرجَّح أنه استكمال (مثل: "جهه الولايه")
            console.log("✅ [استكمالي مرجَّح] سؤال تفصيلي قصير - مرتبط بالمنطقة الحالية");
            return true;
        }

        if (isDetailedFollowUp && q.length > 25 && !/ترخيص|تراخيص|نشاط|مشروع/.test(q)) {
            // سؤال طويل + تفصيلي + لا يذكر اسم المنطقة → التباس → اطرح سؤال توضيحي
            console.log("🤔 [التباس] سؤال طويل تفصيلي بدون مُعرِّف واضح - سيُطرح توضيح");
            return 'ambiguous';   // ← قيمة ثالثة جديدة تُفعِّل التوضيح
        }
    }

    if (context.type === 'activity') {
        const isAboutAreas = (
            /كم عدد.*منطقه|كم عدد.*مناطق/.test(q) || /ما هي.*المناطق/.test(q) ||
            /عرض.*كل.*المناطق/.test(q) || /قائمه.*مناطق/.test(q) ||
            questionType.isGeneralAreaCount || questionType.isSpecificAreaCount ||
            (questionType.isAreaList && q.length > 15)
        );
        if (isAboutAreas) {
            console.log("❌ السؤال الجديد عن المناطق - غير مرتبط");
            return false;
        }
    }

    if (context.type === 'industrial') {
        const isAboutCompleteActivity = (
            q.length > 15 && /نشاط.*ترخيص|ترخيص.*نشاط/.test(q) && !/منطقه|منطقة|مناطق/.test(q)
        );
        if (isAboutCompleteActivity) {
            console.log("❌ السؤال الجديد عن نشاط كامل - غير مرتبط");
            return false;
        }
    }

    if (context.type === 'activity') {
        const activityName = normalizeArabic(context.data.text);
        const mainWords = activityName.split(/\s+/).filter(w => w.length > 4);
        let matchCount = 0;
        for (const word of mainWords) if (q.includes(word)) matchCount++;
        if (mainWords.length > 0 && matchCount === 0 && q.length > 15) {
            console.log("❌ لا يحتوي على كلمات النشاط السابق - غير مرتبط");
            return false;
        }
        if (matchCount >= Math.ceil(mainWords.length * 0.5)) {
            console.log("✅ يحتوي على كلمات النشاط السابق - مرتبط");
            return true;
        }
    }

    if (context.type === 'industrial') {
        const areaName = normalizeArabic(context.data.name);
        const mainWords = areaName.split(/\s+/).filter(w => w.length > 4);
        let matchCount = 0;
        for (const word of mainWords) if (q.includes(word)) matchCount++;
        if (mainWords.length > 0 && matchCount === 0 && q.length > 15) {
            console.log("❌ لا يحتوي على كلمات المنطقة السابقة - غير مرتبط");
            return false;
        }
        if (matchCount >= Math.ceil(mainWords.length * 0.5)) {
            console.log("✅ يحتوي على كلمات المنطقة السابقة - مرتبط");
            return true;
        }
    }

    if (q.length < 10) {
        // ── [حارس النشاط الجديد] ──────────────────────────────────────────
        // الكلمات القصيرة (< 10 أحرف) خطرة: قد تكون نشاطاً جديداً أو استكمالاً.
        // إذا كان السياق السابق activity ونتائج البحث تجد هذه الكلمة كنشاط مستقل
        // في قاعدة الأنشطة → هي نشاط جديد وليست استكمالاً
        // ──────────────────────────────────────────────────────────────────
        if (context.type === 'activity' && typeof masterActivityDB !== 'undefined') {
            const qNorm = normalizeArabic(q);
            const foundInActivities = masterActivityDB.some(act => {
                const actNorm = normalizeArabic(act.text || act.value || '');
                return actNorm.includes(qNorm) || qNorm.includes(actNorm.split(/\s+/)[0]);
            });
            if (foundInActivities) {
                console.log(`❌ [حارس النشاط الجديد] "${q}" موجود في قاعدة الأنشطة - نشاط جديد وليس استكمالاً`);
                return false;
            }
        }

        const deepCheck = DeepIntentAnalyzer.isStandaloneActivity(query);
        if (deepCheck.found) {
            console.log(`❌ كلمة نشاط مستقلة "${deepCheck.activity}" - غير مرتبط بالسياق`);
            return false;
        }
        console.log("✅ سؤال قصير جداً وليس نشاطاً مستقلاً - افتراضياً مرتبط");
        return true;
    }

    console.log("⚠️ غير محدد - افتراضياً غير مرتبط");
    return false;
}

// ==================== 🚀 المحرك الرئيسي المطور (Hybrid Precision Engine V2) ====================
async function processUserQuery(query) {
    const startTime = performance.now();
    console.log("🚀 ========== بدء المعالجة الذكية (الهجينة) ==========");
    console.log("📝 السؤال الأصلي:", query);

    // ✅ [جديد] تصحيح إملائي قبل أي معالجة
    // يعمل على مستوى العبارات والكلمات المنفردة
    if (window.ArabicNLP) {
        const corrected = window.ArabicNLP.correctSpelling(query);
        if (corrected !== query) {
            console.log(`✍️ [إملائي] تصحيح: "${query}" → "${corrected}"`);
            query = corrected;
        }
    }

    // 1️⃣ التطهير الأولي واستخراج السياق الأساسي
    const q = window.normalizeArabic(query);
    const questionType = window.detectQuestionType(query);
    const context = AgentMemory.getContext();

    // ═══════════════════════════════════════════════════════════
    // 🔍 بوابة الكلمة الغامضة - اسم نشاط مفرد بدون سياق واضح
    // عندما يكتب الباحث كلمة واحدة أو جملة قصيرة تمثل اسم نشاط
    // لا يمكن توجيهها لقاعدة واحدة → ابحث في activities + decision104 معاً
    // ═══════════════════════════════════════════════════════════
    const _ambiguousTokens = q.trim().split(/\s+/).filter(w => w.length > 1);
    const _isShortQuery = _ambiguousTokens.length <= 3;

    // كلمات تدل على منطقة صناعية → تخرج من هذا المسار
    const _hasAreaSignal = /(منطقه|منطقة|مناطق|صناعيه|صناعية|محافظه|محافظة|تبعيه|تبعية|ولايه|ولاية|فدان|مساحه|مساحة)/.test(q);
    // كلمات تدل على القرار 104 صراحةً → تخرج من هذا المسار
    const _hasDecisionSignal = /(قرار.*104|\b104\b|حوافز|اعفاء|قطاع\s*(أ|ا|ب))/.test(q);
    // كلمات تدل على سؤال عن ترخيص صريح → تخرج من هذا المسار
    const _hasLicenseSignal = /(ترخيص|تراخيص|رخصه|رخصة|متطلبات|شروط|اجراءات|جهه|جهة)/.test(q);

    // ══════════════════════════════════════════════════════════════════════
    // 🔧 [إصلاح v1.1] بوابة الغموض: كانت مشروطة بـ !context
    // المشكلة: عند السؤال عن نشاط جديد (مثل "فندق") بعد نشاط سابق،
    //   context موجود من الجلسة السابقة → كانت بوابة الغموض تُتجاوز كلياً
    //   فيذهب المحرك الدلالي لـ areas بدلاً من activities.
    //
    // الحل: السماح لبوابة الغموض بالعمل حتى مع وجود context، لكن فقط
    //   إذا أثبت حارس النشاط الجديد (isQueryRelatedToContext=false) أن
    //   هذا الاستعلام نشاط مستقل جديد وليس استكمالاً للسياق السابق.
    //
    // الشرط الجديد: !context أو (context موجود وسيُعالج لاحقاً كنشاط جديد)
    // ══════════════════════════════════════════════════════════════════════
    const _isNewActivityWithContext = context && context.type === 'activity' &&
        typeof masterActivityDB !== 'undefined' &&
        (() => {
            const qNorm = normalizeArabic(q);
            return masterActivityDB.some(act => {
                const actNorm = normalizeArabic(act.text || act.value || '');
                return actNorm === qNorm ||
                    (actNorm.includes(qNorm) && qNorm.length > 2) ||
                    qNorm.includes(actNorm.split(/\s+/)[0]);
            });
        })();

    if (_isShortQuery && !_hasAreaSignal && !_hasDecisionSignal && !_hasLicenseSignal &&
        (!context || _isNewActivityWithContext)) {
        console.log(`🔍 [بوابة الغموض] كلمة/جملة غير محددة: "${query}" ← فحص الوجود في activities + decision104`);
        if (_isNewActivityWithContext) {
            console.log("🔄 [بوابة الغموض] نشاط جديد مع context قديم — مسح السياق أولاً");
            await AgentMemory.clear();
        }

        const _ambCtx = (typeof analyzeContext === 'function') ? analyzeContext(query, questionType) : {};
        const _ambEnt = (typeof extractEntities === 'function') ? extractEntities(query) : {};

        // ══════════════════════════════════════════════════════════════════════
        // 🧠 [استراتيجية ذكية] بدلاً من دمج النتيجتين (مربك للمستخدم)،
        // نُقرر أولاً هل النشاط موجود في القاعدتين؟
        //   وُجد في الاثنتين  → توضيح تفاعلي "ماذا تريد بالضبط؟"
        //   وُجد في واحدة     → عرض نتيجتها مباشرة
        //   لم يُوجد بأيٍّ منهما → تابع التدفق الطبيعي
        // ══════════════════════════════════════════════════════════════════════

        // أ. البحث في قاعدة الأنشطة
        const _actRes = await handleActivityQuery(query, questionType, _ambCtx, _ambEnt);
        const _actFound = _actRes && typeof _actRes === 'string' && !_actRes.includes('لم أجد');

        // ب. البحث في قاعدة القرار 104
        let _dec104Res = null;
        if (typeof handleDecision104Query === 'function') {
            _dec104Res = await Promise.resolve(handleDecision104Query(query, questionType));
        }
        const _decFound = _dec104Res && typeof _dec104Res === 'string' &&
            !_dec104Res.includes('لم أجد') && !_dec104Res.includes('formatDecision104Options');

        console.log(`🔎 [بوابة الغموض] activities=${_actFound} | decision104=${_decFound}`);

        // ── الحالة 1: موجود في الاثنتين → توضيح تفاعلي ذكي ─────────────────
        if (_actFound && _decFound) {
            console.log("🤔 [بوابة الغموض] وُجد في الاثنتين - عرض توضيح تفاعلي");
            const _displayName = query.replace(/^(نشاط|مشروع|عن|هل|ما هو)\s*/i, '').trim();
            const _safeName = _displayName.replace(/'/g, "\\'");
            return `
                <div class="clarification-card">
                    <div class="clarification-header">
                        <div class="clarification-icon">🤔</div>
                        <div class="clarification-title">سؤالك يحتمل أكثر من معنى</div>
                    </div>
                    <div class="clarification-subtitle">
                        وجدت معلومات عن <strong>"${_displayName}"</strong>  ماذا تريد بالضبط؟
                    </div>
                    <div class="choice-btn" onclick="(function(){
                        window.AgentMemory && window.AgentMemory.clear();
                        window.sendMessage('تراخيص ${_safeName}');
                    })()">
                        <span class="choice-icon">📋</span>
                        <div class="choice-content">
                            <strong>تراخيص وإجراءات ممارسة النشاط</strong>
                            <small>الجهات المُصدرة للتراخيص، المتطلبات،الملاحظات الفنية لأعضاء اللجنة عند معاينة هذا النشاط، الموقع الملائم للمارسة النشاط، الإجراءات، السند التشريعي للتراخيص</small>
                        </div>
                    </div>
                    <div class="choice-btn" onclick="(function(){
                        window.AgentMemory && window.AgentMemory.clear();
                        window.sendMessage('هل نشاط ${_safeName} وارد بالقرار 104');
                    })()">
                        <span class="choice-icon">⚖️</span>
                        <div class="choice-content">
                            <strong>هل هذا النشاط وارد بالقرار 104؟</strong>
                            <small>الحوافز والإعفاءات الضريبية المتاحة وفقاً لقانون الاستثمار</small>
                        </div>
                    </div>
                </div>
            `;
        }

        // ── الحالة 2: موجود في activities فقط → عرض مباشر ──────────────────
        if (_actFound) {
            console.log("✅ [بوابة الغموض] موجود في activities فقط - عرض مباشر");
            return _actRes;
        }

        // ── الحالة 3: موجود في decision104 فقط → عرض مباشر ─────────────────
        if (_decFound) {
            console.log("✅ [بوابة الغموض] موجود في decision104 فقط - عرض مباشر");
            return _dec104Res;
        }

        // لم يجد في أي منهما → يكمل التدفق الطبيعي
        console.log("⚠️ [بوابة الغموض] لم يُعثر في أي قاعدة - متابعة التدفق");
    }

    // ═══════════════════════════════════════════════════════════
    // 🚪 بوابة النية الصريحة - أعلى أولوية مطلقة في النظام
    // عندما يصرح المستخدم بنوع سؤاله صراحةً لا نتجادل مع المحركات
    // ═══════════════════════════════════════════════════════════

    // 🏭 تصريح صريح بسؤال عن منطقة صناعية
    if (q.startsWith('المناطق الصناعيه:') || q.startsWith('مناطق صناعيه:') || q.startsWith('مناطق:')) {
        const actualQuery = query.replace(/^(المناطق الصناعيه:|مناطق صناعيه:|مناطق:)/i, '').trim();
        await AgentMemory.clear();
        return await handleIndustrialQuery(actualQuery, window.detectQuestionType(actualQuery), null, null);
    }

    // 📋 تصريح صريح بسؤال عن ترخيص / نشاط تجاري
    if (q.startsWith('الانشطه والتراخيص:') || q.startsWith('نشاط:') || q.startsWith('تراخيص:')) {
        const actualQuery = query.replace(/^(الانشطه والتراخيص:|نشاط:|تراخيص:)/i, '').trim();
        await AgentMemory.clear();
        return await handleActivityQuery(actualQuery, window.detectQuestionType(actualQuery), null, null);
    }

    // 🧠 بوابة النية الضمنية: استخلاص نوع السؤال من صياغة المستخدم
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // القاعدة: "نشاط + اسم" → دائماً activities (رخصة/ترخيص)
    //          "منطقة + اسم" → دائماً areas
    //          "قرار/حوافز/قطاع أ/ب" → دائماً decision104
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // ✅ المستخدم يبدأ بكلمة "نشاط" → يريد ترخيص نشاط (وليس قرار 104)
    const isExplicitActivityQuery = /^نشاط\s+\S/.test(q) ||
        /^(ما\s+هي\s+)?(شروط|متطلبات|تراخيص|اجراءات|رخصه|رخصة)\s+(نشاط|ممارسه|ممارسة)/.test(q) ||
        /^(تراخيص|رخصه|رخصة)\s+\S+/.test(q);

    if (isExplicitActivityQuery) {
        console.log("🎯 [بوابة النية] تصريح بنشاط تجاري → activities");
        // ✅ إصلاح: تمرير context و entities محسوبتين مسبقاً لتجنب ReferenceError
        const _ctx = (typeof analyzeContext === 'function') ? analyzeContext(query, questionType) : {};
        const _ent = (typeof extractEntities === 'function') ? extractEntities(query) : {};
        const res = await handleActivityQuery(query, questionType, _ctx, _ent);
        if (res && !res.includes('لم أجد')) return res;
    }

    // ✅ المستخدم يبدأ بكلمة "منطقة/مناطق" أو يسأل عن عددها → areas
    const isExplicitAreaQuery = /^(كم\s+عدد|عدد)\s+(المناطق|مناطق)/.test(q) ||
        /^(هل|ما\s+هي?|اين|أين)\s+(منطقه|منطقة|مناطق)/.test(q) ||
        /^(المنطقه|المنطقة|منطقه|منطقة)\s+\S/.test(q) ||
        // ✅ إضافة: "المناطق التابعة لـ" → areas دائماً
        /^المناطق\s+(التابعه|التابعة|الصناعيه|الصناعية|الحره|الحرة)/.test(q) ||
        /^(ما|اذكر|اعرض|عرض)\s+(المناطق|مناطق)\s+(التابعه|التابعة|الصناعيه|الصناعية)/.test(q);

    if (isExplicitAreaQuery) {
        console.log("🏭 [بوابة النية] تصريح بمنطقة صناعية → areas");
        // ✅ إصلاح: تمرير context و entities محسوبتين مسبقاً
        const _ctx2 = (typeof analyzeContext === 'function') ? analyzeContext(query, questionType) : {};
        const _ent2 = (typeof extractEntities === 'function') ? extractEntities(query) : {};
        const res = await handleIndustrialQuery(query, questionType, _ctx2, _ent2);
        if (res && !res.includes('لم أجد')) return res;
    }

    // ✅ المستخدم يسأل صراحةً عن القرار 104 / الحوافز / القطاعات
    const isExplicitDecision104Query = /قرار\s*104|\b104\b/.test(q) ||
        /^(ما\s+هي?|اذكر|عرض)\s+(حوافز|اعفاءات|مزايا)/.test(q) ||
        /قطاع\s*(أ|ا|ب)\b/.test(q);

    if (isExplicitDecision104Query) {
        console.log("⚖️ [بوابة النية] تصريح بقرار 104 → decision104");
        const decision104Response = handleDecision104Query(query, questionType);
        if (decision104Response) return decision104Response;
    }

    // 🎯 [المسار السريع] فحص الكلمات المفتاحية الصريحة للقرار 104 قبل استهلاك موارد المتجهات
    if (typeof isDecision104Question === 'function' && isDecision104Question(query)) {
        console.log("🎯 توجيه صريح لمحرك القرار 104 (Keyword Trigger)");
        const decision104Response = handleDecision104Query(query, questionType);
        if (decision104Response) return decision104Response;
    }

    // 🧠 2️⃣ [المرحلة المتجهية المحسّنة: الموجه الدلالي + المصنف الذكي + Reranker]
    let vectorMatch = null;
    let vectorTargetDB = null;
    let vectorConfidence = 0;
    let keywordClassification = null;
    let searchResponse = null;

    try {
        // أ. التصنيف المسبق بالمصنف الكلماتي
        if (window.intentClassifier) {
            keywordClassification = window.intentClassifier.classify(query, context);
            console.log("🎯 تصنيف المصنف الكلماتي:", keywordClassification);
        }

        // ── 🆕 [بوابة الالتباس المبكر activities ↔ decision104] ───────────────
        // إذا أعاد IntentClassifier علامة isActDecAmbiguous وكانت الثقة منخفضة
        // نعرض توضيحاً تفاعلياً قبل أي بحث دلالي مكلف
        // ─────────────────────────────────────────────────────────────────────
        if (keywordClassification?.isActDecAmbiguous && keywordClassification.confidence < 5.0 && !context) {
            console.log("🤔 [بوابة مبكرة] التباس activities↔decision104 - عرض توضيح تفاعلي");
            const _dn = query.replace(/^(نشاط|مشروع|هل|ما هو|عن)\s*/i, '').trim();
            const _sn = _dn.replace(/'/g, "\\'");
            return `
                <div class="clarification-card">
                    <div class="clarification-header">
                        <div class="clarification-icon">🤔</div>
                        <div class="clarification-title">سؤالك يحتمل أكثر من معنى</div>
                    </div>
                    <div class="clarification-subtitle">
                        ماذا تريد معرفته عن <strong>"${_dn}"</strong>؟
                    </div>
                    <div class="choice-btn" onclick="(function(){
                        var q='تراخيص ${_sn}';
                        window.sendMessage(q);
                    })()">
                        <span class="choice-icon">📋</span>
                        <div class="choice-content">
                            <strong>تراخيص وإجراءات ممارسة النشاط</strong>
                            <small>الجهات المُصدرة، المتطلبات، السند التشريعي، الموقع الملائم</small>
                        </div>
                    </div>
                    <div class="choice-btn" onclick="(function(){
                        var q='هل نشاط ${_sn} وارد بالقرار 104';
                        window.sendMessage(q);
                    })()">
                        <span class="choice-icon">⚖️</span>
                        <div class="choice-content">
                            <strong>هل هذا النشاط وارد بالقرار 104؟</strong>
                            <small>الحوافز والإعفاءات الضريبية المتاحة وفقاً لقانون الاستثمار</small>
                        </div>
                    </div>
                </div>
            `;
        }
        // ─────────────────────────────────────────────────────────────────────
        // ب. البحث الدلالي
        console.log("⏳ جاري استشارة الموجه الدلالي (Semantic Routing)...");
        // انتظار جهوزية المحرك إذا كان لا يزال يتهيأ
        if (window.hybridEngine && !window.hybridEngine.isReady) {
            console.log("⏳ انتظار اكتمال تهيئة المحرك...");
            await window.hybridEngine.initialize();
        }
        searchResponse = (window.hybridEngine && window.hybridEngine.isReady) ? await window.hybridEngine.search(query) : null;
        
        // ج. البحث النصي بالتوازي — NeuralSearch دالة مباشرة تحتاج (query, database)
        let keywordResults = null;
        if (typeof NeuralSearch === 'function' && typeof masterActivityDB !== 'undefined') {
            try {
                const nsResult = NeuralSearch(query, masterActivityDB, { minScore: 30 });
                keywordResults = nsResult?.results || null;
                console.log("🔤 نتائج المحرك النصي:", keywordResults?.length || 0);
            } catch (e) {
                console.warn("⚠️ المحرك النصي غير متاح:", e.message);
            }
        }
        
        // د. إعادة الترتيب بالـ Reranker
        if (searchResponse && searchResponse.results && window.resultReranker) {
            const rerankedResults = window.resultReranker.rerank(
                searchResponse.results,
                keywordResults || [],
                query,
                context
            );
            
            if (rerankedResults && rerankedResults.length > 0) {
               vectorMatch = rerankedResults[0];
               vectorTargetDB = vectorMatch.dbName || searchResponse.intent;
               vectorConfidence = vectorMatch.cosineScore || vectorMatch.data?.score || searchResponse.confidence;

              // حفظ كل النتائج المتساوية مباشرة من searchResponse
              const topCosine = searchResponse.results?.[0]?.cosineScore || 0;
              const tiedFromSearch = (searchResponse.results || []).filter(r =>
              Math.abs((r.cosineScore || 0) - topCosine) < 0.01
              );
                vectorMatch._allResults = tiedFromSearch.length > 1 ? tiedFromSearch : null;
                console.log(`📦 النتائج المتساوية: ${tiedFromSearch.length}`);
                console.log(`✨ القرار النهائي بعد Reranking: القاعدة [${vectorTargetDB}] | النقاط [${vectorConfidence.toFixed(3)}]`);
            }
        } else if (searchResponse && searchResponse.topMatch) {
            // Fallback: استخدام النتيجة الدلالية فقط
            vectorMatch = searchResponse.topMatch; 
            vectorTargetDB = searchResponse.topMatch.dbName || searchResponse.intent;
            vectorConfidence = searchResponse.confidence;
            console.log(`✨ القرار الدلالي: القاعدة [${vectorTargetDB}] | المعرف [${vectorMatch.id}]`);
        }
    } catch (e) {
        console.error("⚠️ فشل المعالجة الذكية، الاعتماد على التحليل النصي فقط:", e);
    }

    // 🔄 3️⃣ [إدارة الذاكرة والسياق] - الحفاظ على تسلسل الأفكار
    if (context && context.type !== 'clarification') {
        const isRelated = isQueryRelatedToContext(query, context);

        // ── حالة الالتباس الحقيقي: اعرض توضيح تفاعلي ────────────────────────
        if (isRelated === 'ambiguous') {
            console.log("🤔 [التباس] سيُطرح سؤال توضيحي على المستخدم");
            const areaName = context.data?.name || 'المنطقة الحالية';
            const areaDistinctive = context.data?.name
                ? context.data.name.replace(/^(المنطقة الصناعية|منطقة)\s*/i, '').trim()
                : '';

            return `
                <div class="clarification-card">
                    <div class="clarification-header">
                        <div class="clarification-icon">🤔</div>
                        <div class="clarification-title">هل سؤالك عن المنطقة الحالية أم عام؟</div>
                    </div>
                    <div class="clarification-subtitle">
                        لاحظت أنك سألت عن <strong>"${query}"</strong> — هل تقصد:
                    </div>
                    <div class="choice-btn" onclick="(function(){
                        document.getElementById('gptInput').value = 'جهه الولايه';
                        window.processUserQuery && window.processUserQuery('جهه الولايه');
                    })()">
                        <span class="choice-icon">🏭</span>
                        <div class="choice-content">
                            <strong>جهة ولاية ${areaDistinctive || areaName}</strong>
                            <small>معلومات تفصيلية عن المنطقة التي تحدثنا عنها</small>
                        </div>
                    </div>
                    <div class="choice-btn" onclick="(function(){
                        window.AgentMemory && window.AgentMemory.clear();
                        window.sendMessage('ما هي جهات الولايه للمناطق الصناعيه');
                    })()">
                        <span class="choice-icon">🗂️</span>
                        <div class="choice-content">
                            <strong>جهات الولاية لكل المناطق الصناعية</strong>
                            <small>عرض إحصائي شامل لجميع جهات الولاية</small>
                        </div>
                    </div>
                </div>
            `;
        }

        if (!isRelated) {
            console.log("🔄 سؤال جديد غير مرتبط - مسح السياق المؤقت");
            await AgentMemory.clear();

            // ══════════════════════════════════════════════════════════════════
            // 🔧 [إصلاح v1.1] بعد مسح السياق لنشاط جديد
            // المشكلة: كان التنفيذ يكمل للمسار الدلالي الذي قد يختار areas
            //   بدلاً من activities رغم أن حارس النشاط أثبت وجوده في masterActivityDB.
            //
            // الحل: إذا كان الاستعلام قصيراً (≤ 3 كلمات) وموجوداً في masterActivityDB
            //   → وجّهه لبوابة الغموض مباشرة بدلاً من انتظار المحرك الدلالي
            // ══════════════════════════════════════════════════════════════════
            if (_isShortQuery && !_hasAreaSignal && !_hasDecisionSignal && !_hasLicenseSignal) {
                const _isInActivities = typeof masterActivityDB !== 'undefined' &&
                    masterActivityDB.some(act => {
                        const actNorm = normalizeArabic(act.text || act.value || '');
                        const qNorm   = normalizeArabic(q);
                        return actNorm === qNorm ||
                            (actNorm.includes(qNorm) && qNorm.length > 2) ||
                            qNorm.includes(actNorm.split(/\s+/)[0]);
                    });

                if (_isInActivities) {
                    console.log(`🔀 [إصلاح] نشاط جديد مؤكد "${query}" — توجيه مباشر لبوابة الغموض`);
                    // إعادة استدعاء processUserQuery بعد مسح الذاكرة
                    // (الذاكرة مُسحت للتو → context = null → بوابة الغموض ستعمل)
                    return await processUserQuery(query);
                }
            }
        } else {
            console.log("💡 السؤال مرتبط بالسياق الحالي، جاري المعالجة السياقية...");
            const contextResponse = await handleContextualQuery(query, questionType, AgentMemory.getContext());
            if (contextResponse) return contextResponse;
        }
    }
    
    // 🤔 4️⃣ [معالجة التوضيحات] - إذا كان المستخدم يختار من قائمة سابقة
    if (context && context.type === 'clarification') {
        const choice = context.data.find(c => normalizeArabic(c.name).split(/\s+/).some(word => q.includes(word)));
        if (choice) {
            if (choice.type === 'industrial') {
                AgentMemory.setIndustrial(choice.data, query);
                return formatIndustrialResponse(choice.data);
            } else {
                await AgentMemory.setActivity(choice.data, query);
                return formatActivityResponse(choice.data, questionType);
            }
        }
    }

    // 🛠️ 5️⃣ [التحليل العميق] - استخراج الكيانات والنية العميقة
    const analysisContext = analyzeContext(query, questionType);
    const entities = extractEntities(query);
    const deepIntent = DeepIntentAnalyzer.analyze(query);
    
    // 🚀 6️⃣ [اتخاذ القرار الهجين - Hybrid Execution Logic]

    // ─────────────────────────────────────────────────────────────
    // 🔒 قاعدة الفيتو: إذا قال المصنف الكلماتي "activities" بثقة ≥ 3.0
    // والمحرك الدلالي يريد إرساله لـ decision104 → نرفض ونوجه لـ activities
    // السبب: كلمة "نشاط" صريحة تعني دائماً: رخصة نشاط (وليس قرار 104)
    // ─────────────────────────────────────────────────────────────
    if (vectorTargetDB === 'decision104' &&
        keywordClassification?.primary === 'activities' &&
        keywordClassification?.confidence >= 3.0) {
        console.log(`🔒 [فيتو المصنف] المصنف الكلماتي يرفض قرار 104 → توجيه لـ activities`);
        const res = await handleActivityQuery(query, questionType, analysisContext, entities);
        if (res && !res.includes('لم أجد')) return res;
    }

    // ─────────────────────────────────────────────────────────────
    // 🔒 قاعدة الفيتو: إذا قال المصنف الكلماتي "areas" بثقة ≥ 3.0
    // والمحرك الدلالي يريد إرساله لـ decision104 → نرفض ونوجه لـ areas
    // ─────────────────────────────────────────────────────────────
    if (vectorTargetDB === 'decision104' &&
        (keywordClassification?.primary === 'areas' || keywordClassification?.primary === 'industrial_zones') &&
        keywordClassification?.confidence >= 3.0) {
        console.log(`🔒 [فيتو المصنف] المصنف الكلماتي يرفض قرار 104 → توجيه لـ areas`);
        const res = await handleIndustrialQuery(query, questionType, analysisContext, entities);
        if (res && !res.includes('لم أجد')) return res;
    }

    if (vectorMatch && vectorConfidence > 0.70) {
     console.log(`🎯 قبول النية الدلالية بثقة: ${Math.round(vectorConfidence * 100)}%`);
     
     if (vectorTargetDB === 'decision104') {
    console.log("⚖️ توجيه ذكي لمسار القرار 104");
    // استخدام cosineScore الخام من searchResponse.results (قبل Reranker) للمقارنة الصحيحة
    const allDecisionResults = (searchResponse?.results || []).filter(r =>
        r.dbName === 'decision104' || (r.id + '').toLowerCase().includes('dec')
    );
    const topCosine2 = allDecisionResults[0]?.cosineScore || 0;
    const tiedFinal = topCosine2 > 0
        ? allDecisionResults.filter(r => Math.abs((r.cosineScore || 0) - topCosine2) < 0.01)
        : [];
    window._lastVectorMatch = vectorMatch;
    // تمرير النتائج المتساوية دائماً إذا وُجدت (سواء كانت 1 أو أكثر)
    window._lastVectorResults = tiedFinal.length > 1 ? tiedFinal : null;
    console.log(`📦 النتائج المتساوية المُمررة: ${window._lastVectorResults?.length || 0}`);
    return handleDecision104Query(query, questionType);
     
             
             // 1. استخراج البيانات من المتجه
             const originalData = vectorMatch.data?.original_data;

             // 2. [الجراحة العلمية]: 
             // إذا كانت الثقة "فائقة" (> 0.90) فهذا يعني أن المستخدم يسأل عن نشاط محدد جداً (اسم النشاط بالكامل)
             // في هذه الحالة فقط نعرض النشاط الفردي.
             if (vectorConfidence > 0.90 && originalData && originalData.sub_activity) {
                 console.log(`✅ ثقة فائقة: عرض نشاط فردي: ${originalData.sub_activity}`);
                 const itemData = {
                     activity: originalData.sub_activity,
                     mainSector: originalData.sector,
                     subSector: originalData.main_activity,
                     sector: originalData.sector_type === 'القطاع أ' ? 'A' : 'B'
                 };
                 AgentMemory.setDecisionActivity(itemData, query);
                 return formatSingleActivityInDecision104WithIncentives(query, itemData, 'both');
             } 
             
             // 3. [الحل العلمي للذكاء]:
             // في حالات البحث العام (مثل: برامج الكمبيوتر) نترك المهمة لمحرك القرار 104 المتخصص
             // لأنه الأقدر على استخراج "كل" الأنشطة المرتبطة وعرضها بشكل شامل (الـ 23 نشاط)
             else {
                 console.log("🔍 بحث دلالي واسع: تحويل الاستعلام لمحرك القرار 104 الشامل");
                 return handleDecision104Query(query, questionType);
             }

        } else if (vectorTargetDB === 'activities') {
            // [كما هي]
            const act = masterActivityDB.find(a => a.value === vectorMatch.id);
            if (act) { await AgentMemory.setActivity(act, query); return formatActivityResponse(act, questionType); }
        } else if (vectorTargetDB === 'areas') {
            // ✅ حماية: إذا كانت الثقة الدلالية تعادلية (فارق < 3% بين القواعد)
            // لا نثق في اختيار areas وحدها - نتحقق أن السؤال فعلاً يتعلق بمنطقة جغرافية
            const _areasScores = searchResponse?.results?.filter(r => r.dbName === 'areas') || [];
            const _activitiesScores = searchResponse?.results?.filter(r => r.dbName === 'activities') || [];
            const _topAreasScore = _areasScores[0]?.cosineScore || 0;
            const _topActScore = _activitiesScores[0]?.cosineScore || 0;
            const _scoreDiff = Math.abs(_topAreasScore - _topActScore);

            if (_scoreDiff < 0.03 && !_hasAreaSignal) {
                // تعادل دلالي + لا يوجد مؤشر منطقة → تجاهل نتيجة areas
                console.log(`⚠️ [حماية areas] تعادل دلالي (فارق ${(_scoreDiff*100).toFixed(1)}%) + لا مؤشر منطقة → تجاهل`);
            } else {
                // ✅ إصلاح التعادل المطور: فحص مزدوج (نقاط + أسماء)
                const _topCosine = _areasScores[0]?.cosineScore || 0;

                // 1️⃣ فحص التعادل بالنقاط (فارق ≤ 3%)
                const _tiedAreasFromSearch = _areasScores.filter(r =>
                    (r.cosineScore || 0) > 0 &&
                    Math.abs((r.cosineScore || 0) - _topCosine) <= 0.03
                );

                // 2️⃣ فحص اسمي: هل كلمة البحث موجودة في أكثر من منطقة؟
                const _queryKeyword = normalizeArabic(query)
                    .replace(/(هل|منطقه|منطقة|صناعيه|صناعية|مناطق|يوجد|توجد|هناك)/g, '')
                    .trim().split(/\s+/).filter(w => w.length > 2)[0] || '';
                const _nameMatchesCount = _queryKeyword
                    ? _areasScores.filter(r =>
                        (r.cosineScore || 0) > 0 &&
                        normalizeArabic(r.id || '').includes(_queryKeyword)
                      ).length
                    : 0;

                const _isAmbiguous = _tiedAreasFromSearch.length >= 2 || _nameMatchesCount >= 2;

                if (_isAmbiguous) {
                    console.log(`🔀 [areas التباس] نقاط-متساوية=${_tiedAreasFromSearch.length} | اسم-متكرر=${_nameMatchesCount} → handleIndustrialQuery`);
                    const res = await handleIndustrialQuery(query, questionType, analysisContext, entities);
                    if (res && !res.includes('لم أجد')) return res;
                } else {
                    // نتيجة واحدة واضحة → عرض مباشر
                    const area = industrialAreasData.find(a => a.name === vectorMatch.id);
                    if (area) { await AgentMemory.setIndustrial(area, query); return formatIndustrialResponse(area); }
                }
            }
        }
   }

     // ب. [التوجيه الدلالي الذكي] تنفيذ بناءً على النية المصنفة
                if (vectorMatch && vectorConfidence > 0.30) {
    // استخدام النص الأصلي من المتجه بدلاً من المعرّف
    const originalText = vectorMatch.data?.text || query;
    
    switch (vectorTargetDB) {
        case 'decision104':
         console.log("⚖️ مسار القرار 104 المتخصص");
             window._lastVectorMatch = vectorMatch;
             window._lastVectorResults = vectorMatch?._allResults || null;
             const res104 = await handleDecision104Query(originalText, questionType);
             if (res104 && !res104.includes('لم أجد معلومات')) return res104;
                break;

        case 'activities':
    console.log("📋 مسار التراخيص والأنشطة (الدلالي المباشر)");
    // ✅ [إصلاح] البحث أولاً في masterActivityDB بالـ id للحصول على البيانات الكاملة مع details
    const actFromDB = masterActivityDB?.find(a => a.value === vectorMatch.id);
    if (actFromDB) {
        await AgentMemory.setActivity(actFromDB, query);
        return formatActivityResponse(actFromDB, questionType);
    }
    // Fallback: استخدام بيانات المتجه إذا لم يُوجد في masterActivityDB
    const directAct = vectorMatch.data?.original_data || vectorMatch.data;
    if (directAct) {
        await AgentMemory.setActivity(directAct, query);
        return formatActivityResponse(directAct, questionType);
    }
    break;

        case 'areas':
            console.log("🏭 مسار المناطق الجغرافية");
            const areaData = vectorMatch.data?.original_data;

            // ✅ إصلاح التعادل المطور: فحص مزدوج (نقاط + أسماء)
            const _areasResultsLow = (searchResponse?.results || []).filter(r => r.dbName === 'areas');
            const _topCosineLow = _areasResultsLow[0]?.cosineScore || 0;

            // فحص التعادل بالنقاط (فارق ≤ 3%)
            const _tiedAreasLow = _areasResultsLow.filter(r =>
                (r.cosineScore || 0) > 0 &&
                Math.abs((r.cosineScore || 0) - _topCosineLow) <= 0.03
            );

            // فحص اسمي
            const _qKwLow = normalizeArabic(query)
                .replace(/(هل|منطقه|منطقة|صناعيه|صناعية|مناطق|يوجد|توجد|هناك)/g, '')
                .trim().split(/\s+/).filter(w => w.length > 2)[0] || '';
            const _nameCountLow = _qKwLow
                ? _areasResultsLow.filter(r =>
                    (r.cosineScore || 0) > 0 &&
                    normalizeArabic(r.id || '').includes(_qKwLow)
                  ).length
                : 0;

            if (_tiedAreasLow.length >= 2 || _nameCountLow >= 2) {
                console.log(`🔀 [areas التباس - مسار منخفض] نقاط=${_tiedAreasLow.length} | اسم=${_nameCountLow} → handleIndustrialQuery`);
                const resAreaTied = await handleIndustrialQuery(query, questionType, analysisContext, entities);
                if (resAreaTied) return resAreaTied;
            } else if (areaData && areaData.name) {
                const area = industrialAreasData.find(a => a.name === areaData.name);
                if (area) {
                    await AgentMemory.setIndustrial(area, query);
                    return formatIndustrialResponse(area);
                }
            }

            // Fallback: البحث بالنص
            const resArea = await handleIndustrialQuery(originalText, questionType, analysisContext, entities);
            if (resArea) return resArea;
            break;
    }
}

    // ج. [آلية التوضيح] - إذا كان هناك التباس دلالي
    if (analysisContext.needsClarification && vectorConfidence < 0.80) {
        const clarification = requestClarification(query, analysisContext, entities, questionType);
        if (clarification) return clarification;
    }
    
    // د. [صمام الأمان النهائي - Fallback]
    console.log("🛡️ تفعيل صمام الأمان: البحث في المسارات البديلة");

    // 🎯 أولوية قصوى: تنفيذ قرار المصنف الكلماتي إذا كان واثقاً
    if (keywordClassification && keywordClassification.confidence >= 3.0) {
        console.log(`🎯 صمام الأمان يستخدم قرار المصنف: ${keywordClassification.primary}`);
        if (keywordClassification.primary === 'decision104') {
            return handleDecision104Query(query, questionType);
        }
        // ✅ industrial_zones و areas كلاهما يُوجَّه لـ handleIndustrialQuery
        if (keywordClassification.primary === 'industrial_zones' || keywordClassification.primary === 'areas') {
            const res = await handleIndustrialQuery(query, questionType, analysisContext, entities);
            if (res) return res;
        }
        if (keywordClassification.primary === 'activities') {
            const res = await handleActivityQuery(query, questionType, analysisContext, entities);
            if (res) return res;
        }
    }

    const isClearlyIndustrial = checkIfIndustrialQuestion(query, questionType, analysisContext, entities);
    const isClearlyActivity = checkIfActivityQuestion(query, questionType, analysisContext, entities);
    
    if (analysisContext.recommendation === 'areas' || (isClearlyIndustrial && !isClearlyActivity)) {
        const res = await handleIndustrialQuery(query, questionType, analysisContext, entities);
        if (res) return res;
        return await handleActivityQuery(query, questionType, analysisContext, entities);
    } 
    
    if (analysisContext.recommendation === 'activities' || (isClearlyActivity && !isClearlyIndustrial)) {
        const res = await handleActivityQuery(query, questionType, analysisContext, entities);
        if (res) return res;
        return await handleIndustrialQuery(query, questionType, analysisContext, entities);
    }

    // هـ. [محاولة الإنقاذ الأخيرة] - محاولة دلالية بحد أدنى من الثقة
    if (vectorMatch && vectorConfidence > 0.50) {
        console.log("🔍 محاولة إنقاذ أخيرة بالمعطيات المتجهية...");
        if (vectorTargetDB === 'activities') {
            const act = masterActivityDB.find(a => a.value === vectorMatch.id);
            if (act) return formatActivityResponse(act, questionType);
        } else if (vectorTargetDB === 'areas') {
            const area = industrialAreasData.find(a => a.name === vectorMatch.id);
            if (area) return formatIndustrialResponse(area);
        }
    }

    const endTime = performance.now();
    console.log(`⏱️ إجمالي زمن المعالجة: ${(endTime - startTime).toFixed(2)}ms`);

    console.log("❌ لم يتم العثور على إجابة دقيقة عبر كافة المسارات");
    return generateDefaultResponse(query);
}
// ==================== 📝 تنسيق رسالة السياق ====================
function formatContextMessage(contextAnalysis) {
    if (!contextAnalysis.related || !contextAnalysis.context) return null;
    const { context, strength } = contextAnalysis;
    if (strength === 'strong') {
        return `<div class="info-card" style="background: linear-gradient(135deg, #e3f2fd 0%, #f1f8ff 100%); border-left: 4px solid #2196f3;">
            <div class="info-card-header" style="color: #1565c0;">💡 فهمت! سؤالك متعلق بـ: <strong>${context.name}</strong></div>
        </div>`;
    }
    return null;
}

// ==================== 🔍 كشف نوع قاعدة البيانات من السؤال ====================
function detectQuestionDatabase(query) {
    const q = normalizeArabic(query);
    if (/قرار.*104|القرار|حوافز|اعفاءات|قطاع\s*(أ|ا|ب)/.test(q)) return 'decision104';
    if (/منطقة|منطقه|صناعية|صناعيه|محافظة|تبعية|ولاية/.test(q)) return 'industrial_zones';
    return 'activities';
}

// ==================== ✅ فحص نوع السؤال - مناطق (بدون إعادة حساب) ====================
function checkIfIndustrialQuestion(query, questionType, analysisContext, entities) {
    const q = normalizeArabic(query);
    if (/عرض|اظهر|اعرض/.test(q) && /(كل|جميع|قائمه)/.test(q) && /منطقه|مناطق|صناعيه|صناعية/.test(q)) return true;
    if (q.startsWith('المناطق الصناعية:') || q.startsWith('مناطق صناعية:')) return true;
    if (questionType.isCount && /عدد.*منطقه|عدد.*مناطق/.test(q)) return true;
    if (/المناطق.*التابعه|المناطق.*التابعة/.test(q)) return true;
    if (/(كم|ما) عدد.*المناطق/.test(q)) return true;
    if (questionType.isGeneralAreaCount || questionType.isSpecificAreaCount || questionType.isAreaList || questionType.isGovernanceAuthority || questionType.isAreaExistenceCheck) return true;
    if (entities.hasAreaName && entities.areaNames[0].confidence >= 80) return true;
    if (analysisContext.recommendation === 'areas' && analysisContext.confidence >= 60) return true;
    const strongPatterns = [/عدد.*منطقه.*صناعيه/, /عدد.*مناطق.*صناعيه/, /ما هي.*المناطق.*الصناعيه/, /اسماء.*المناطق.*الصناعيه/, /قائمه.*المناطق.*الصناعيه/, /المنطقة الصناعية ب/, /موقع.*منطقه.*صناعيه/];
    if (strongPatterns.some(p => p.test(q))) return true;
    const hasAreaKeywords = q.includes('منطقه') || q.includes('منطقة') || q.includes('صناعيه') || q.includes('صناعية');
    const hasLicenseContext = /ترخيص|تراخيص|متطلبات|شروط|اجراءات/.test(q);
    if (hasAreaKeywords && !hasLicenseContext) {
        const hasGeographicContext = questionType.hasLocationContext || entities.hasGovernorate || entities.hasDependency || /محافظه|محافظة|مدينه|مدينة/.test(q);
        if (hasGeographicContext) return true;
    }
    if (entities.hasGovernorate && q.includes('صناعي') && !/(نشاط|مشروع|ترخيص).*صناعي/.test(q)) return true;
    if (entities.hasDependency && !hasLicenseContext) return true;
    return false;
}

// ==================== ✅ فحص نوع السؤال - أنشطة (بدون إعادة حساب) ====================
function checkIfActivityQuestion(query, questionType, analysisContext, entities) {
    const q = normalizeArabic(query);
    if (questionType.isCount && /منطقه|منطقة|مناطق/.test(q) && !/(نشاط|ترخيص)/.test(q)) return false;
    if (questionType.isCount && /عدد.*منطقه|عدد.*مناطق/.test(q)) return false;
    if (/المناطق.*التابعه|المناطق.*التابعة/.test(q)) return false;
    const strongActivityPatterns = [
        /تراخيص.*فندق/, /تراخيص.*مطعم/, /تراخيص.*مصنع/, /تراخيص.*صيدلية/, /تراخيص.*مخزن/, /ترخيص.*فندق/, /ترخيص.*مطعم/, /ترخيص.*مصنع/,
        /(انشاء|إنشاء).*تشغيل.*فندق/, /(انشاء|إنشاء).*تشغيل.*مطعم/, /ترخيص.*مطلوب/, /تراخيص.*مطلوبه/, /ما.*التراخيص.*المطلوبه/,
        /كيف.*احصل.*ترخيص/, /متطلبات.*نشاط/, /شروط.*نشاط/, /اجراءات.*ترخيص/, /خطوات.*ترخيص/, /دليل.*الترخيص/, /سجل صناعي/, /رخصة تشغيل/,
        /الجهة المصدرة.*ترخيص/
    ];
    if (strongActivityPatterns.some(p => p.test(q))) return true;
    if (questionType.isLicensingAuthority) return true;
    if (questionType.hasLicenseContext && questionType.isActivity) return true;
    if (questionType.isTechnical && !questionType.isIndustrial) return true;
    if (questionType.isDecision104) return true;
    if (entities.hasActivityType && entities.activityTypes[0].confidence >= 70) return true;
    if (analysisContext.recommendation === 'activities' && analysisContext.confidence >= 60) return true;
    const hasStrongLicenseKeywords = /ترخيص|تراخيص|رخصه|رخصة|متطلبات|شروط|اجراءات|إجراءات/.test(q);
    if (hasStrongLicenseKeywords) {
        const isExplicitlyAboutAreaLocation = questionType.hasLocationContext && /موقع.*منطقه|مكان.*منطقه|اين.*منطقه/.test(q);
        if (!isExplicitlyAboutAreaLocation) return true;
    }
    if (/كيف|ازاي|طريقة/.test(q) && questionType.isActivity && !/(كيف|ازاي).*اروح|اوصل/.test(q)) return true;
    if (/ما (المطلوب|الشروط|المتطلبات)/.test(q)) return true;
    if (questionType.isAuthority && entities.hasActivityType && !questionType.isGovernanceAuthority) return true;
    return false;
}

// ==================== معالج الأسئلة السياقية ====================
async function handleContextualQuery(query, questionType, context) {
    const q = normalizeArabic(query);

    if (context.type === 'industrial') {
        const area = context.data;
        if (questionType.isLocation || q.includes('خريطه') || q.includes('map') || q.includes('موقع')) {
            return formatIndustrialMapLink(area);
        }
        if (q.includes('قرار') || q.includes('انشاء') || questionType.isLaw) {
            return `📜 <strong>قرار إنشاء ${area.name}:</strong><br><br>${area.decision || 'غير متوفر'}`;
        }
        if (q.includes('ولايه') || q.includes('تبعيه') || q.includes('جهه') || questionType.isDependency) {
            return `🏛️ <strong>جهة الولاية:</strong> ${area.dependency}`;
        }
        if (q.includes('مساحه') || q.includes('فدان')) {
            return `📏 <strong>المساحة:</strong> ${area.area} فدان`;
        }
        if (q.includes('محافظه') || q.includes('محافظة') || q.includes('مدينه') || q.includes('مدينة')) {
            return `<div class="info-card" style="border-right: 4px solid #0ea5e9; background: #f0f9ff;">
                <div class="info-card-header">📍 الموقع الإداري</div>
                <div class="info-card-content">منطقة <strong>${area.name}</strong> تقع إدارياً ضمن نطاق <strong>محافظة ${area.governorate}</strong>.</div>
            </div>
            <div class="choice-btn" onclick="selectIndustrialArea('${area.name.replace(/'/g, "\\'")}')">
                <span class="choice-icon">📋</span> عرض باقي تفاصيل المنطقة
            </div>`;
        }
    } else if (context.type === 'activity') {
        const act = context.data;
        const details = act.details || {};
        if (questionType.isLicense || q.includes('ترخيص') || q.includes('رخص')) {
            return formatLicensesDetailed(act);
        }
        if (questionType.isAuthority || q.includes('جهه') || q.includes('وزاره') || q.includes('هيئه')) {
            return formatAuthority(details);
        }
        if (questionType.isLaw || q.includes('قانون') || q.includes('سند') || q.includes('تشريع')) {
            return formatLegislation(details);
        }
        if (questionType.isGuide || q.includes('دليل') || q.includes('جايد') || q.includes('رابط')) {
            return formatGuideInfo(details);
        }
        if (questionType.isTechnical || q.includes('ملاحظات') || q.includes('فنيه') || q.includes('لجنه')) {
            return formatTechnicalNotes(act);
        }
        if (questionType.isLocation || q.includes('موقع') || q.includes('مكان')) {
            return formatSuitableLocation(details);
        }
        const isDecision104Intent =
    questionType.isDecision104 ||
    q.includes('104') ||
    /\b(حوافز|حافز|اعفاء|إعفاء|اعفاءات|إعفاءات|مزايا|ضريبي|ضريبية)\b/.test(q) ||
    /\b(وارد|مدرج|مشمول|يستفيد|يندرج|يخضع|مذكور)\b/.test(q) ||
    /هل\s*(هو|هي|ده|دي|النشاط)?\s*(له|لها)?\s*(مزايا|حوافز|اعفاء|إعفاء)/.test(q) ||
    /هل\s*(هو|هي|ده|دي)?\s*(مشمول|مدرج|وارد|يستفيد|ينضوي)/.test(q);

if (isDecision104Intent) {
    return window.handleDecision104Query(`هل ${act.text} وارد بالقرار 104`, detectQuestionType(query));
}
    }
    return null;
}

// ==================== الوظائف المساعدة ====================

window.toggleGPTChat = function() {
    const container = document.getElementById('gptChatContainer');
    const floatBtn = document.getElementById('gptFloatBtn');
    if (!container || !floatBtn) return;
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'flex';
        floatBtn.style.display = 'none';
    } else {
        container.style.display = 'none';
        floatBtn.style.display = 'flex';
    }
};

window.autoResize = function(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    checkInputState();
};

window.handleEnter = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

window.clearMemoryWithConfirm = async function() {
    const context = AgentMemory.getContext();
    if (!context || context.type === 'clarification') {
        const container = document.getElementById('gptMessages');
        const notification = document.createElement('div');
        notification.style.cssText = 'background: #fff3e0; padding: 10px; border-radius: 8px; margin: 8px 0; text-align: center; color: #e65100;';
        notification.innerHTML = 'ℹ️ لا يوجد سياق محفوظ حالياً';
        container.appendChild(notification);
        container.scrollTop = container.scrollHeight;
        setTimeout(() => notification.remove(), 3000);
        return;
    }
    const contextName = context.type === 'industrial' ? context.data.name : context.data.text;
    const container = document.getElementById('gptMessages');
    const confirmBox = document.createElement('div');
    confirmBox.style.cssText = 'background: #fff3e0; padding: 16px; border-radius: 12px; margin: 8px 0; border: 2px solid #ff9800;';
    confirmBox.innerHTML = `
        <div style="text-align: center; margin-bottom: 12px;">
            <strong style="color: #e65100;">🗑️ هل تريد مسح السياق المحفوظ؟</strong><br>
            <small style="color: #bf360c;">السياق الحالي: ${contextName}</small>
        </div>
        <div style="display: flex; gap: 8px; justify-content: center;">
            <button onclick="confirmClearMemory()" style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold;">✓ نعم، امسح</button>
            <button onclick="cancelClearMemory()" style="background: #e0e0e0; color: #333; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold;">✕ إلغاء</button>
        </div>
    `;
    confirmBox.id = 'memory-confirm-box';
    container.appendChild(confirmBox);
    container.scrollTop = container.scrollHeight;
};

window.confirmClearMemory = async function() {
    await AgentMemory.clear();
    const confirmBox = document.getElementById('memory-confirm-box');
    if (confirmBox) confirmBox.remove();
    const container = document.getElementById('gptMessages');
    const notification = document.createElement('div');
    notification.style.cssText = 'background: #e8f5e9; padding: 10px; border-radius: 8px; margin: 8px 0; text-align: center; color: #2e7d32;';
    notification.innerHTML = '✅ تم مسح الذاكرة بنجاح';
    container.appendChild(notification);
    container.scrollTop = container.scrollHeight;
    setTimeout(() => notification.remove(), 3000);
};

window.cancelClearMemory = function() {
    const confirmBox = document.getElementById('memory-confirm-box');
    if (confirmBox) confirmBox.remove();
};

window.sendMessage = async function(overrideQuery) {
    stopOngoingGeneration();
    const input = document.getElementById('gptInput');
    const query = overrideQuery || input.value.trim();
    if (!query) return;
    if (!overrideQuery) input.value = '';
    autoResize(input);
    checkInputState();
    addMessageToUI('user', query);
    if (window.checkForGPTCloseIntent && window.checkForGPTCloseIntent(query)) {
        window.gptGracefulClose();
        return;
    }
    const typingId = showTypingIndicator();
    try {
        const responseHTML = await processUserQuery(query);
        removeTypingIndicator(typingId);
        if (responseHTML) typeWriterResponse(responseHTML);
    } catch (error) {
        console.error("❌ خطأ في معالجة الرسالة:", error);
        removeTypingIndicator(typingId);
        typeWriterResponse("عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.");
    }
};

window.resolveAmbiguity = async function(type, index) {
    const context = AgentMemory.getContext();
    if (context && context.type === 'clarification') {
        const choice = context.data[index];
        if (choice) {
            AgentMemory.clear();
            if (type === 'industrial') {
                await AgentMemory.setIndustrial(choice.data, choice.name);
                addMessageToUI('user', choice.name);
                const responseHTML = formatIndustrialResponse(choice.data);
                const typingId = showTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator(typingId);
                    typeWriterResponse(responseHTML);
                }, 600);
            } else if (type === 'activity') {
                await AgentMemory.setActivity(choice.data, choice.name);
                addMessageToUI('user', choice.name);
                const responseHTML = formatActivityResponse(choice.data, detectQuestionType(choice.name));
                const typingId = showTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator(typingId);
                    typeWriterResponse(responseHTML);
                }, 600);
            }
        }
    }
};

window.selectIndustrialArea = async function(areaName) {
    if (typeof industrialAreasData === 'undefined') {
        console.error("❌ قاعدة بيانات المناطق غير متوفرة");
        return;
    }
    const area = industrialAreasData.find(a => a.name === areaName);
    if (area) {
        console.log("✅ تم العثور على المنطقة:", area.name);
        await AgentMemory.setIndustrial(area, areaName);
        addMessageToUI('user', areaName);
        const responseHTML = formatIndustrialResponse(area);
        const typingId = showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator(typingId);
            typeWriterResponse(responseHTML);
        }, 600);
    } else {
        console.warn("⚠️ لم يتم العثور على تطابق تام - استخدام البحث الاحتياطي");
        document.getElementById('gptInput').value = areaName;
        window.sendMessage();
    }
};

window.addMessageToUI = function(role, content) {
    const chatMessagesContainer = document.getElementById('gptMessages');
    if (!chatMessagesContainer) return;
    if (role === 'user') {
        const div = document.createElement('div');
        div.className = 'message-row user';
        div.innerHTML = `<div class="avatar user"><i class="fas fa-user"></i></div><div class="message-bubble">${content}</div>`;
        chatMessagesContainer.appendChild(div);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        if (window.speechSynthesis && window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    } else if (role === 'ai') {
        typeWriterResponse(content, true);
    }
};

window.activeTypingSession = null;

function stopOngoingGeneration() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (window.activeTypingSession) {
        window.activeTypingSession.isCancelled = true;
        if (window.activeTypingSession.animationId) cancelAnimationFrame(window.activeTypingSession.animationId);
        window.activeTypingSession = null;
    }
}

window.typeWriterResponse = function(htmlContent, shouldAutoSpeak = true) {
    if (!htmlContent || typeof htmlContent !== 'string') return;
    const chatMessagesContainer = document.getElementById('gptMessages');
    if (!chatMessagesContainer) return;
    stopOngoingGeneration();
    chatMessagesContainer.style.scrollBehavior = 'auto';
    const msgRow = document.createElement('div');
    msgRow.className = 'message-row ai';
    msgRow.innerHTML = `<div class="avatar ai"><i class="fas fa-robot"></i></div><div class="message-bubble"></div>`;
    chatMessagesContainer.appendChild(msgRow);
    const bubble = msgRow.querySelector('.message-bubble');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const taskQueue = [];

    function traverseAndQueue(node, parentElement) {
        if (node.nodeType === 3) {
            const text = node.nodeValue;
            if (!text) return;
            const secureTextNode = document.createTextNode('');
            taskQueue.push({ type: 'inject-node', node: secureTextNode, parent: parentElement });
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                let punctuationDelay = 0;
                if (char === '.' || char === '؟' || char === '!' || char === '\n') punctuationDelay = 5;
                else if (char === '،' || char === ',') punctuationDelay = 0;
                taskQueue.push({ type: 'char', char: char, targetNode: secureTextNode, extraDelay: punctuationDelay });
            }
        } else if (node.nodeType === 1) {
            const tagName = node.tagName.toLowerCase();
            const newEl = document.createElement(tagName);
            Array.from(node.attributes).forEach(attr => newEl.setAttribute(attr.name, attr.value));
            taskQueue.push({ type: 'element', element: newEl, parent: parentElement, extraDelay: 5 });
            node.childNodes.forEach(child => traverseAndQueue(child, newEl));
        }
    }
    Array.from(tempDiv.childNodes).forEach(child => traverseAndQueue(child, bubble));

    const currentSession = { isCancelled: false, animationId: null };
    window.activeTypingSession = currentSession;
    let taskIndex = 0;
    let fullTextForSpeech = "";
    let isUserInteracting = false;
    let accumulatedDelay = 0;
    const interactionEvents = ['mousedown', 'wheel', 'touchstart'];
    const interactHandler = () => { isUserInteracting = true; };
    interactionEvents.forEach(evt => chatMessagesContainer.addEventListener(evt, interactHandler, { passive: true }));

    function renderFrame(timestamp) {
        if (currentSession.isCancelled) return;
        if (taskIndex >= taskQueue.length) {
            finishTyping();
            return;
        }
        const startTime = performance.now();
        if (accumulatedDelay > 0) {
            if (timestamp < accumulatedDelay) {
                currentSession.animationId = requestAnimationFrame(renderFrame);
                return;
            }
            accumulatedDelay = 0;
        }
        let charsToProcessLimit = 10;
        const randomFactor = Math.random();
        if (randomFactor > 0.7) charsToProcessLimit = 6;
        else if (randomFactor < 0.05) charsToProcessLimit = 0;
        if (charsToProcessLimit === 0) {
            accumulatedDelay = timestamp + (Math.random() * 20 + 10);
            currentSession.animationId = requestAnimationFrame(renderFrame);
            return;
        }
        let processedCount = 0;
        while (taskIndex < taskQueue.length && processedCount < charsToProcessLimit) {
            if (currentSession.isCancelled) return;
            const task = taskQueue[taskIndex];
            if (task.type === 'element') {
                task.parent.appendChild(task.element);
                if (task.extraDelay) accumulatedDelay = timestamp + task.extraDelay;
            } else if (task.type === 'inject-node') {
                task.parent.appendChild(task.node);
            } else if (task.type === 'char') {
                task.targetNode.nodeValue += task.char;
                fullTextForSpeech += task.char;
                if (task.extraDelay > 0) {
                    accumulatedDelay = timestamp + task.extraDelay;
                    taskIndex++;
                    break;
                }
            }
            taskIndex++;
            processedCount++;
            if (!isUserInteracting) {
                const currentHeight = chatMessagesContainer.scrollHeight;
                const visibleHeight = chatMessagesContainer.clientHeight;
                if (currentHeight > visibleHeight + chatMessagesContainer.scrollTop) {
                    chatMessagesContainer.scrollTop = currentHeight;
                }
            }
            if (performance.now() - startTime > 12) break;
            if (accumulatedDelay > 0) break;
        }
        currentSession.animationId = requestAnimationFrame(renderFrame);
    }

    function finishTyping() {
        if (currentSession.isCancelled) return;
        interactionEvents.forEach(evt => chatMessagesContainer.removeEventListener(evt, interactHandler));
        chatMessagesContainer.style.scrollBehavior = 'smooth';
        const buttons = bubble.querySelectorAll('.choice-btn, .smart-btn');
        buttons.forEach(btn => {
            btn.style.opacity = 1;
            btn.style.transform = 'translateY(0)';
        });
        if (shouldAutoSpeak && typeof window.speakText === 'function' && fullTextForSpeech.trim().length > 0) {
            setTimeout(() => {
                if (!currentSession.isCancelled) {
                    const voiceControls = document.getElementById('gptVoiceControls');
                    if (voiceControls) voiceControls.style.display = 'flex';
                    window.speakText(fullTextForSpeech);
                    if (window.speechSynthesis) {
                        window.speechSynthesis.addEventListener('end', function hideSpeaker() {
                            if (voiceControls) voiceControls.style.display = 'none';
                            window.speechSynthesis.removeEventListener('end', hideSpeaker);
                        });
                    }
                }
            }, 200);
        }
        window.activeTypingSession = null;
    }
    currentSession.animationId = requestAnimationFrame(renderFrame);
};

window.showTypingIndicator = function() {
    const id = 'typing-' + Date.now();
    const container = document.getElementById('gptMessages');
    const div = document.createElement('div');
    div.className = 'message-row ai';
    div.id = id;
    div.innerHTML = `<div class="avatar ai"><i class="fas fa-robot"></i></div><div class="message-bubble"><div class="typing-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
};

window.removeTypingIndicator = function(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
};

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeForJS(text) {
    if (!text) return "";
    return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
}

window.toggleExpandChat = function() {
    const container = document.getElementById('gptChatContainer');
    const expandBtn = document.getElementById('gptExpandBtn');
    const icon = expandBtn.querySelector('i');
    container.classList.toggle('expanded');
    if (container.classList.contains('expanded')) {
        icon.classList.replace('fa-expand-alt', 'fa-compress-alt');
        expandBtn.title = "تصغير النافذة";
    } else {
        icon.classList.replace('fa-compress-alt', 'fa-expand-alt');
        expandBtn.title = "توسيع النافذة";
    }
    setTimeout(() => document.getElementById('gptInput').focus(), 400);
};

window.checkInputState = function() {
    const input = document.getElementById('gptInput');
    const actionBtn = document.getElementById('gptActionBtn');
    const actionIcon = document.getElementById('actionIcon');
    if (!input || !actionBtn || !actionIcon) return;
    const hasText = input.value.trim().length > 0;
    if (hasText) {
        actionBtn.title = "إرسال الرسالة";
        actionBtn.classList.remove('mic-mode');
        actionBtn.classList.add('send-mode');
        actionIcon.classList.replace('fa-microphone', 'fa-paper-plane');
    } else {
        actionBtn.title = "التحدث بالصوت";
        actionBtn.classList.remove('send-mode');
        actionBtn.classList.add('mic-mode');
        actionIcon.classList.replace('fa-paper-plane', 'fa-microphone');
    }
};

window.handleActionButtonClick = function() {
    const input = document.getElementById('gptInput');
    const hasText = input.value.trim().length > 0;
    if (hasText) {
        sendMessage();
    } else {
        if (window.GPT_VOICE && window.GPT_VOICE.toggleMicrophone) {
            window.GPT_VOICE.toggleMicrophone();
        }
    }
};

window.toggleSpeech = function() {
    if (!window.GPT_VOICE) return;
    window.GPT_VOICE.speechEnabled = !window.GPT_VOICE.speechEnabled;
    const speakerBtn = document.getElementById('gptSpeakerBtn');
    const voiceControls = document.getElementById('gptVoiceControls');
    if (window.GPT_VOICE.speechEnabled) {
        if (speakerBtn) {
            speakerBtn.classList.remove('muted');
            speakerBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            speakerBtn.title = "كتم الصوت";
        }
        if (voiceControls) voiceControls.style.display = 'flex';
        const lastMsg = document.querySelector('.message-row.ai:last-child .message-bubble');
        if (lastMsg && window.speakText) {
            window.speakText(lastMsg.textContent);
            if (window.speechSynthesis) {
                window.speechSynthesis.addEventListener('end', function hideSpeaker() {
                    if (voiceControls) voiceControls.style.display = 'none';
                    window.speechSynthesis.removeEventListener('end', hideSpeaker);
                });
            }
        }
    } else {
        if (speakerBtn) {
            speakerBtn.classList.add('muted');
            speakerBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            speakerBtn.title = "تشغيل الصوت";
        }
        if (voiceControls) voiceControls.style.display = 'none';
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
};

window.GPT_AGENT.closeKeywords = ['شكرا', 'شكراً', 'باي', 'مع السلامة', 'إغلاق', 'كفاية', 'خلاص', 'انتهيت', 'سلام'];

window.checkForGPTCloseIntent = function(text) {
    const q = normalizeArabic(text);
    return window.GPT_AGENT.closeKeywords.some(k => q.includes(k));
};

window.gptGracefulClose = function() {
    const msgs = ['تشرفنا بخدمتك، في أمان الله.', 'سعدت بمساعدتك، مع السلامة.', 'العفو، أنا في الخدمة دائماً.'];
    const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
    const typingId = showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator(typingId);
        typeWriterResponse(randomMsg, true);
        setTimeout(() => {
            if (document.getElementById('gptChatContainer').style.display !== 'none') {
                toggleGPTChat();
            }
        }, 4000);
    }, 500);
};

window.showGPTNotification = function(msg, type = 'success') {
    const container = document.getElementById('gptMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.style.cssText = `
        align-self: center;
        background: ${type === 'success' ? '#e8f5e9' : '#fff3e0'};
        color: ${type === 'success' ? '#2e7d32' : '#e65100'};
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 0.8rem;
        margin: 10px 0;
        border: 1px solid ${type === 'success' ? '#a5d6a7' : '#ffcc80'};
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        animation: fadeIn 0.5s ease;
        text-align: center;
        width: fit-content;
        z-index: 10;
    `;
    div.innerHTML = `✨ ${msg}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    setTimeout(() => {
        div.style.transition = 'opacity 1s';
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 1000);
    }, 4000);
};

window.addEventListener('load', function() {
    setTimeout(checkInputState, 100);
});

// دوال مشتركة للكيانات والبحث والتحليل اللغوي
window.normalizeArabic = normalizeArabic;
window.extractKeywords = extractKeywords;
window.extractEntities = extractEntities;
window.extractGovernorates = extractGovernorates;
window.extractDependencies = extractDependencies;
window.calculateSimilarity = calculateSimilarity;
window.extractAreaNames = extractAreaNames;
window.searchIndustrialZonesWithNeural = searchIndustrialZonesWithNeural;
    
// تحديث سجلات التشغيل للإصدار الهجين v10.0
console.log('✅ GPT Agent v10.0 - Hybrid Semantic Edition initialized!');
console.log('🧠 Engine: Semantic E5 + Keyword Search Enabled');
console.log('🆕 Feature: Onboarding Splash Screen Loaded');

// 5. نظام التهيئة الذكية
window.initializeGptSystem = async function() {
    const isModelLoaded = localStorage.getItem('gpt_model_ready');
    const splash = document.getElementById('gpt-onboarding');
    const progressBar = document.getElementById('onboarding-progress');
    const statusText = document.getElementById('onboarding-status');

    // انتظار جهوزية hybridEngine إذا لم يكن موجوداً بعد
    if (!window.hybridEngine) {
        console.log("⏳ انتظار تحميل HybridEngine...");
        await new Promise(resolve => {
            window.addEventListener('hybridEngineReady', resolve, { once: true });
            setTimeout(resolve, 5000); // timeout بعد 5 ثوان كحد أقصى
        });
    }

    if (!isModelLoaded) {
        if(splash) splash.style.display = 'flex';
        try {
            if (window.hybridEngine) {
                if(statusText) statusText.innerText = "جاري تحميل قاعدة البيانات للمساعد...";
                if(progressBar) progressBar.style.width = '30%';
                await window.hybridEngine.initialize();
                if(progressBar) progressBar.style.width = '90%';
                if (window.AgentMemory && window.hybridEngine.updateContextToken) {
                    window.hybridEngine.updateContextToken(window.AgentMemory.getContext());
                }
            }
            
            
            localStorage.setItem('gpt_model_ready', 'true');
            if(progressBar) progressBar.style.width = '100%';
            if(statusText) statusText.innerText = "تمت التهيئة بنجاح!";
            
            setTimeout(() => { 
                if(splash) {
                    splash.style.transition = 'opacity 0.5s ease';
                    splash.style.opacity = '0';
                    setTimeout(() => splash.remove(), 500);
                }
            }, 1000);
        } catch (e) {
            console.error("Critical Init Error:", e);
            if(statusText) statusText.innerText = "فشل تحميل المحرك، يرجى تحديث الصفحة.";
        }
    } else {
        // تهيئة صامتة مع انتظار الاكتمال
        if (window.hybridEngine && !window.hybridEngine.isReady) {
            console.log("⏳ تهيئة خلفية للمحرك الدلالي...");
            try {
                await window.hybridEngine.initialize();
                console.log("✅ المحرك الدلالي جاهز في الخلفية");
                if (window.AgentMemory && window.hybridEngine.updateContextToken) {
                    window.hybridEngine.updateContextToken(window.AgentMemory.getContext());
                }
            } catch(err) {
                console.error("Background Init Failed", err);
                localStorage.removeItem('gpt_model_ready');
            }
        }
    }
};

// تشغيل نظام التهيئة عند اكتمال تحميل الصفحة
window.addEventListener('load', window.initializeGptSystem);


} // نهاية الملف gpt_agent.js





