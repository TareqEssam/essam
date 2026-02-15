// gpt_agent.js
/****************************************************************************
 * 🤖 GPT-Like Agent v10.0 - HYBRID SEMANTIC EDITION
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
    <div id="hybridEngineLoadingModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
         background: rgba(0,0,0,0.85); z-index: 999999; justify-content: center; align-items: center;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
             padding: 40px; border-radius: 20px; text-align: center; max-width: 500px; 
             box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="font-size: 60px; margin-bottom: 20px;">🧠</div>
            <h2 style="color: white; margin: 0 0 15px 0; font-size: 24px;">تهيئة المحرك الدلالي</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 0 0 25px 0; font-size: 16px;">
                جاري تحميل البيانات...<br>
                <small style="opacity: 0.8;">(هذه العملية تتم مرة واحدة فقط)</small>
            </p>
            <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 15px;">
                <div id="loadingProgress" style="background: white; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
            </div>
            <div id="loadingStatus" style="color: rgba(255,255,255,0.8); font-size: 14px; min-height: 20px;">
                التحضير...
            </div>
        </div>
    </div>
`;

document.body.insertAdjacentHTML('beforeend', chatHTML);

// ==================== 🚀 تهيئة المحرك الدلالي ====================
let hybridEngine = null;
let isEngineReady = false;

async function initializeHybridEngine() {
    // فحص إذا كان المحرك محمل مسبقاً
    const engineStatus = localStorage.getItem('hybrid-engine-initialized');
    const lastInitTime = localStorage.getItem('hybrid-engine-init-time');
    const currentTime = Date.now();
    
    // إذا كان المحرك محمل خلال آخر ساعة، لا نعرض النافذة
    if (engineStatus === 'true' && lastInitTime && (currentTime - parseInt(lastInitTime)) < 3600000) {
        console.log('🚀 المحرك الدلالي محمل مسبقاً - تحميل سريع...');
        try {
            const { hybridEngine: engine } = await import('./HybridSearchV1.js');
            hybridEngine = engine;
            await hybridEngine.initialize();
            isEngineReady = true;
            console.log('✅ المحرك الدلالي جاهز!');
            return;
        } catch (error) {
            console.warn('⚠️ فشل التحميل السريع، سيتم التحميل الكامل...');
            localStorage.removeItem('hybrid-engine-initialized');
        }
    }

    // عرض نافذة التحميل
    const modal = document.getElementById('hybridEngineLoadingModal');
    const progress = document.getElementById('loadingProgress');
    const status = document.getElementById('loadingStatus');
    
    modal.style.display = 'flex';
    
    try {
        // المرحلة 1: استيراد المحرك
        status.textContent = 'تحميل المحرك الدلالي...';
        progress.style.width = '20%';
        
        const { hybridEngine: engine } = await import('./HybridSearchV1.js');
        hybridEngine = engine;
        
        // المرحلة 2: تحميل النموذج
        status.textContent = 'تحميل نموذج E5 متعدد اللغات...';
        progress.style.width = '40%';
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // المرحلة 3: تهيئة قاعدة البيانات
        status.textContent = 'تحميل قاعدة البيانات الموحدة...';
        progress.style.width = '60%';
        
        await hybridEngine.initialize();
        
        // المرحلة 4: الاختبار والتحقق
        status.textContent = 'التحقق من جاهزية النظام...';
        progress.style.width = '80%';
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // اكتمال
        status.textContent = '✅ المحرك جاهز للعمل!';
        progress.style.width = '100%';
        
        // حفظ حالة التهيئة
        localStorage.setItem('hybrid-engine-initialized', 'true');
        localStorage.setItem('hybrid-engine-init-time', currentTime.toString());
        
        isEngineReady = true;
        
        await new Promise(resolve => setTimeout(resolve, 800));
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '1';
        }, 500);
        
        console.log('✅ المحرك الدلالي جاهز!');
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة المحرك الدلالي:', error);
        status.textContent = '❌ فشل التحميل - سيتم استخدام البحث التقليدي';
        status.style.color = '#ff6b6b';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000);
        
        isEngineReady = false;
    }
}

// تحميل المحرك عند فتح التطبيق لأول مرة
initializeHybridEngine();

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

// ==================== أدوات المعالجة اللغوية ====================

function normalizeArabic(text) {
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
}

window.GPT_AGENT.stopWords = ['في', 'من', 'الى', 'على', 'عن', 'هل', 'ما', 'هو', 'هي', 'ذلك', 'تلك', 'لي', 'لك', 'كيف', 'ماذا', 'متى', 'اين', 'لماذا', 'كم'];

function extractKeywords(text) {
    const normalized = normalizeArabic(text);
    const stopWordsList = window.GPT_AGENT.stopWords || [];
    return normalized.split(/\s+/)
        .filter(word => word.length > 2 && !stopWordsList.includes(word));
}

// ==================== 🧠 كاشف نوع السؤال - محسّن ====================
window.detectQuestionType = function(query) {
    const q = normalizeArabic(query);

    // فحص مبكر: إذا كان السؤال عن "عدد المناطق التابعة لجهة"
    const isCountAreasForDependency = (
        /عدد.*مناطق.*تابع/i.test(q) ||
        /كم.*منطق.*تابع/i.test(q) ||
        /كام.*منطق.*تابع/i.test(q)
    );
    
    if (isCountAreasForDependency) {
        return {
            isCount: true, isList: false, isLocation: false, isLicense: false,
            isAuthority: false, isLaw: false, isGuide: false, isTechnical: false,
            isDecision104: false, isDependency: true, isGovernorate: false,
            isIndustrial: true, isActivity: false, isYesNo: /هل|ايه|صح|خطأ/.test(q),
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
    const isDecision104 = /قرار.*104|104|حافز|حوافز|قطاع\s*(أ|ا|ب)/.test(q);

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

// ==================== 🔍 فحص وجود نوع نشاط محدد ====================
function checkForSpecificActivityType(normalizedQuery) {
    if (typeof activitiesData === 'undefined') return { found: false, type: null };
    for (const activity of activitiesData) {
        const activityName = normalizeArabic(activity['النشاط المحدد'] || '');
        if (activityName && normalizedQuery.includes(activityName)) {
            return { found: true, type: activity['النشاط المحدد'] };
        }
    }
    return { found: false, type: null };
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

function extractGovernorates(normalizedQuery) {
    if (typeof industrialAreasData === 'undefined') return [];
    const found = [];
    const govMap = new Map();
    for (const area of industrialAreasData) {
        const gov = area.governorate;
        if (!gov) continue;
        const normalizedGov = normalizeArabic(gov);
        if (!govMap.has(normalizedGov)) govMap.set(normalizedGov, gov);
        if (normalizedQuery.includes(normalizedGov)) {
            const confidence = (normalizedGov.length / normalizedQuery.length) * 100;
            found.push({ value: gov, confidence: Math.min(confidence, 100) });
        }
    }
    return removeDuplicates(found);
}

function extractDependencies(normalizedQuery) {
    if (typeof industrialAreasData === 'undefined') return [];
    const found = [];
    const depMap = new Map();
    for (const area of industrialAreasData) {
        const dep = area.dependency;
        if (!dep) continue;
        const normalizedDep = normalizeArabic(dep);
        if (!depMap.has(normalizedDep)) depMap.set(normalizedDep, dep);
        if (normalizedQuery.includes(normalizedDep)) {
            const confidence = (normalizedDep.length / normalizedQuery.length) * 100;
            found.push({ value: dep, confidence: Math.min(confidence, 100) });
        }
    }
    return removeDuplicates(found);
}

function extractAreaNames(normalizedQuery) {
    if (typeof industrialAreasData === 'undefined') return [];
    const found = [];
    for (const area of industrialAreasData) {
        const areaName = normalizeArabic(area.name);
        const simplifiedName = areaName.replace(/المنطقة الصناعية/g, '').replace(/المنطقه الصناعيه/g, '').replace(/^ب/g, '').trim();
        const words = simplifiedName.split(/\s+/).filter(w => w.length > 3);
        let matches = 0;
        for (const word of words) {
            if (normalizedQuery.includes(word)) matches++;
        }
        if (matches > 0) {
            const confidence = words.length > 0 ? (matches / words.length) * 100 : 0;
            const matchType = matches === words.length ? 'full' : 'partial';
            found.push({
                name: area.name,
                distinctiveName: simplifiedName,
                confidence: Math.min(confidence, 100),
                matchType
            });
        }
    }
    return found.sort((a, b) => b.confidence - a.confidence);
}

function extractActivityTypes(normalizedQuery) {
    if (typeof activitiesData === 'undefined') return [];
    const found = [];
    for (const activity of activitiesData) {
        const activityName = normalizeArabic(activity['النشاط المحدد'] || '');
        const mainActivity = normalizeArabic(activity['النشاط الرئيسي'] || '');
        if (activityName && normalizedQuery.includes(activityName)) {
            found.push({
                text: activity['النشاط المحدد'],
                value: activity.value,
                confidence: 100,
                matchType: 'exact'
            });
        } else if (mainActivity && normalizedQuery.includes(mainActivity)) {
            found.push({
                text: activity['النشاط الرئيسي'],
                value: activity.value,
                confidence: 80,
                matchType: 'synonym'
            });
        }
    }
    return removeDuplicates(found);
}

function removeDuplicates(found) {
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

function calculateSimilarity(str1, str2) {
    const s1 = normalizeArabic(str1);
    const s2 = normalizeArabic(str2);
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    let matches = 0;
    for (const w1 of words1) {
        for (const w2 of words2) {
            if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) {
                matches++;
                break;
            }
        }
    }
    const maxLen = Math.max(words1.length, words2.length);
    return maxLen > 0 ? (matches / maxLen) * 100 : 0;
}

// ==================== 🔍 البحث باستخدام المحرك الدلالي ====================
async function searchWithHybridEngine(query, options = {}) {
    if (!isEngineReady || !hybridEngine) {
        console.warn('⚠️ المحرك الدلالي غير جاهز، استخدام البحث التقليدي...');
        return null;
    }

    try {
        console.log('🚀 استخدام المحرك الدلالي الهجين...');
        const results = await hybridEngine.search(query, options);
        
        if (!results || !results.results || results.results.length === 0) {
            console.log('❌ لم يتم العثور على نتائج من المحرك الدلالي');
            return null;
        }

        console.log(`✅ المحرك الدلالي وجد ${results.results.length} نتيجة`);
        console.log(`🎯 أعلى نتيجة: ${results.topMatch?.id} (${Math.round(results.confidence * 100)}%)`);
        
        return results;
    } catch (error) {
        console.error('❌ خطأ في المحرك الدلالي:', error);
        return null;
    }
}

// ==================== 🔍 البحث الذكي مع Fallback للبحث التقليدي ====================
async function smartSearch(query, database) {
    // محاولة البحث بالمحرك الدلالي أولاً
    const hybridResults = await searchWithHybridEngine(query, { topK: 5 });
    
    if (hybridResults && hybridResults.topMatch && hybridResults.confidence > 0.5) {
        console.log('✅ نتيجة من المحرك الدلالي');
        
        // 🔧 إضافة معلومات قاعدة البيانات المصدر
        const resultWithMeta = {
            source: 'hybrid',
            data: hybridResults.topMatch.data.original_data,
            confidence: hybridResults.confidence,
            allResults: hybridResults.results,
            dbName: hybridResults.topMatch.dbName || hybridResults.intent // اسم قاعدة البيانات
        };
        
        console.log(`🎯 المصدر: ${resultWithMeta.dbName}`);
        return resultWithMeta;
    }

    // Fallback للبحث التقليدي
    console.log('🔄 استخدام البحث التقليدي كبديل...');
    
    if (database === 'activities' && typeof NeuralSearch !== 'undefined' && typeof activitiesData !== 'undefined') {
        const results = NeuralSearch(query, activitiesData, { minScore: 50 });
        if (results.results.length > 0) {
            return {
                source: 'neural',
                data: results.results[0].originalData,
                confidence: results.results[0].finalScore / 1000,
                allResults: results.results,
                dbName: 'activities'
            };
        }
    }
    
    if (database === 'areas' && typeof industrialAreasData !== 'undefined') {
        const result = searchIndustrialZonesWithNeural(query);
        if (result) {
            return {
                source: 'neural',
                data: result,
                confidence: 0.7,
                allResults: [result],
                dbName: 'areas'
            };
        }
    }

    return null;
}

// ==================== 🏭 معالج المناطق الصناعية ====================
async function handleIndustrialQuery(query, questionType, analysisContext, entities) {
    console.log('🏭 معالجة سؤال المناطق الصناعية...');
    
    // البحث الذكي
    const searchResult = await smartSearch(query, 'areas');
    
    if (searchResult && searchResult.data) {
        console.log(`✅ وجدت منطقة من ${searchResult.source}: ${searchResult.data.name}`);
        
        // حفظ في الذاكرة
        await window.AgentMemory.setIndustrial(searchResult.data, query);
        
        // تنسيق الرد
        return formatIndustrialResponse(searchResult.data, questionType);
    }

    // الاستمرار في المعالجة التقليدية إذا لم نجد نتيجة
    if (typeof industrialAreasData === 'undefined') {
        return '⚠️ <strong>قاعدة بيانات المناطق الصناعية غير متوفرة حالياً</strong>';
    }

    // معالجة الحالات الخاصة
    if (questionType.isGeneralAreaCount) {
        const totalCount = industrialAreasData.length;
        return `📊 <strong>إجمالي عدد المناطق الصناعية في مصر:</strong> ${totalCount} منطقة صناعية`;
    }

    if (questionType.isSpecificAreaCount && entities.hasDependency) {
        const dep = entities.dependencies[0].value;
        const filtered = industrialAreasData.filter(a => a.dependency === dep);
        return `📊 <strong>عدد المناطق التابعة لـ ${dep}:</strong> ${filtered.length} منطقة صناعية`;
    }

    // محاولة البحث التقليدي
    const area = searchIndustrialZonesWithNeural(query);
    if (area) {
        await window.AgentMemory.setIndustrial(area, query);
        return formatIndustrialResponse(area, questionType);
    }

    return null;
}

// ==================== 📋 معالج الأنشطة ====================
async function handleActivityQuery(query, questionType, analysisContext, entities) {
    console.log('📋 معالجة سؤال الأنشطة...');
    
    // البحث الذكي
    const searchResult = await smartSearch(query, 'activities');
    
    if (searchResult && searchResult.data) {
        // 🔧 استخراج البيانات بشكل آمن
        const activityName = searchResult.data['النشاط المحدد'] || 
                            searchResult.data['النشاط_المحدد'] || 
                            searchResult.data['الاسم'] || 
                            searchResult.data.name || 
                            'نشاط غير محدد';
        
        console.log(`✅ وجدت نشاط من ${searchResult.source}: ${activityName}`);
        
        // حفظ في الذاكرة
        const activityData = {
            value: searchResult.data.value || searchResult.data.id || 'unknown',
            text: activityName
        };
        await window.AgentMemory.setActivity(activityData, query);
        
        // تنسيق الرد
        return formatActivityResponse(searchResult.data, questionType);
    }

    // الاستمرار في المعالجة التقليدية
    if (typeof NeuralSearch === 'undefined' || typeof activitiesData === 'undefined') {
        return '⚠️ <strong>قاعدة بيانات الأنشطة غير متوفرة حالياً</strong>';
    }

    const results = NeuralSearch(query, activitiesData, { minScore: 50 });
    
    if (results.results.length === 0) {
        return null;
    }

    const topResult = results.results[0];
    
    if (topResult.finalScore >= 800) {
        const activityData = {
            value: topResult.originalData.value,
            text: topResult.originalData['النشاط المحدد']
        };
        await window.AgentMemory.setActivity(activityData, query);
        return formatActivityResponse(topResult.originalData, questionType);
    }

    if (results.results.length >= 2) {
        const secondScore = results.results[1].finalScore;
        const scoreDiff = topResult.finalScore - secondScore;
        
        if (scoreDiff < 200 && secondScore >= 300) {
            await window.AgentMemory.setClarification(
                results.results.slice(0, 3).map(r => ({
                    type: 'activity',
                    name: r.originalData['النشاط المحدد'],
                    data: { value: r.originalData.value, text: r.originalData['النشاط المحدد'] },
                    score: r.finalScore
                }))
            );
            return buildMultipleActivitiesClarification(
                results.results.slice(0, 3).map(r => ({
                    text: r.originalData['النشاط المحدد'],
                    value: r.originalData.value,
                    confidence: Math.round((r.finalScore / 1000) * 100),
                    matchType: 'search'
                }))
            );
        }
    }

    if (topResult.finalScore >= 300) {
        const activityData = {
            value: topResult.originalData.value,
            text: topResult.originalData['النشاط المحدد']
        };
        await window.AgentMemory.setActivity(activityData, query);
        return formatActivityResponse(topResult.originalData, questionType);
    }

    return null;
}

// ==================== 🎨 تنسيق الردود ====================
function formatIndustrialResponse(area, questionType) {
    let html = `<div class="info-card industrial">
        <div class="info-card-header">🏭 ${area.name}</div>`;
    
    if (area.governorate) html += `<div class="info-row"><strong>المحافظة:</strong> ${area.governorate}</div>`;
    if (area.dependency) html += `<div class="info-row"><strong>جهة الولاية:</strong> ${area.dependency}</div>`;
    if (area.area) html += `<div class="info-row"><strong>المساحة:</strong> ${area.area}</div>`;
    if (area.decision) html += `<div class="info-row"><strong>قرار الإنشاء:</strong> ${area.decision}</div>`;
    
    html += `</div>`;
    return html;
}

function formatActivityResponse(activity, questionType) {
    // 🔧 استخراج آمن للبيانات من مصادر متعددة
    const activityName = activity['النشاط المحدد'] || 
                        activity['النشاط_المحدد'] || 
                        activity['الاسم'] || 
                        activity.name || 
                        'نشاط غير محدد';
    
    const mainActivity = activity['النشاط الرئيسي'] || 
                        activity['النشاط_الرئيسي'] || 
                        activity['القطاع_العام'] || 
                        activity.sector || 
                        null;
    
    const licensingAuthority = activity['الجهة المُصدرة للترخيص'] || 
                              activity['الجهة_المصدرة'] || 
                              activity['جهة_الولاية'] || 
                              activity.authority || 
                              null;
    
    const legislation = activity['السند التشريعي'] || 
                       activity['السند_التشريعي'] || 
                       activity.legislation || 
                       null;
    
    // 🔧 معالجة خاصة لبيانات القرار 104
    const isDecision104 = activity['القطاع'] || activity.sector_type;
    
    let html = `<div class="info-card activity">
        <div class="info-card-header">📋 ${activityName}</div>`;
    
    if (mainActivity) {
        html += `<div class="info-row"><strong>النشاط الرئيسي:</strong> ${mainActivity}</div>`;
    }
    
    if (isDecision104) {
        const sector = activity['القطاع'] || activity.sector_type || 'غير محدد';
        html += `<div class="info-row"><strong>القطاع (القرار 104):</strong> ${sector}</div>`;
        
        const incentives = activity['الحوافز'] || activity.incentives;
        if (incentives) {
            html += `<div class="info-row"><strong>الحوافز:</strong> ${incentives}</div>`;
        }
        
        const exemptions = activity['الإعفاءات'] || activity.exemptions;
        if (exemptions) {
            html += `<div class="info-row"><strong>الإعفاءات:</strong> ${exemptions}</div>`;
        }
    }
    
    if (licensingAuthority) {
        html += `<div class="info-row"><strong>الجهة المُصدرة:</strong> ${licensingAuthority}</div>`;
    }
    
    if (legislation) {
        html += `<div class="info-row"><strong>السند التشريعي:</strong> ${legislation}</div>`;
    }
    
    // 🔧 إضافة معلومات إضافية من البيانات الأصلية
    const guide = activity['دليل_الترخيص'] || activity.guide;
    if (guide && guide !== 'لا يوجد') {
        html += `<div class="info-row"><strong>دليل الترخيص:</strong> <a href="${guide}" target="_blank">تحميل الدليل</a></div>`;
    }
    
    const notes = activity['ملاحظات_فنية'] || activity.technical_notes;
    if (notes && notes !== 'لا يوجد') {
        html += `<div class="info-row"><strong>ملاحظات فنية:</strong> ${notes}</div>`;
    }
    
    html += `</div>`;
    return html;
}

// ==================== 📤 توضيحات متعددة ====================
function buildMultipleActivitiesClarification(activityTypes) {
    let optionsHTML = '';
    activityTypes.slice(0, 3).forEach((activity, index) => {
        optionsHTML += `<div class="choice-btn" onclick="selectSpecificActivity('${activity.value}', '${escapeForJS(activity.text)}')">
            <span class="choice-icon">${index === 0 ? '🎯' : '📋'}</span> 
            <div class="choice-content"><strong>${activity.text}</strong><small>تطابق ${activity.confidence}%</small></div>
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

window.selectSpecificActivity = async function(value, text) {
    if (typeof activitiesData === 'undefined') return;
    const activity = activitiesData.find(a => a.value === value);
    if (activity) {
        await window.AgentMemory.setActivity({ value, text }, text);
        addMessageToUI('user', text);
        const responseHTML = formatActivityResponse(activity, detectQuestionType(text));
        const typingId = showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator(typingId);
            typeWriterResponse(responseHTML);
        }, 600);
    }
};

// ==================== 🧠 محاكاة NeuralSearch للمناطق ====================
function searchIndustrialZonesWithNeural(query) {
    const q = normalizeArabic(query);
    if (q === 'المحافظه' || q === 'المحافظة' || q === 'الجهه' || q === 'الجهة') return null;
    if (typeof industrialAreasData === 'undefined' || !industrialAreasData) return null;
    
    console.log("🏭 البحث في المناطق:", query);
    
    // بحث بسيط بالكلمات
    for (const area of industrialAreasData) {
        const areaName = normalizeArabic(area.name);
        if (areaName.includes(q) || q.includes(areaName)) {
            console.log("✅ تطابق مباشر:", area.name);
            return area;
        }
    }
    
    return null;
}

// ==================== 🔄 معالج الأسئلة السياقية ====================
async function handleContextualQuery(query, questionType, context) {
    console.log('🔄 معالجة سؤال سياقي...');
    
    if (context.type === 'activity') {
        // استخدام البيانات المحفوظة مباشرة
        if (typeof activitiesData !== 'undefined') {
            const activity = activitiesData.find(a => a.value === context.data.value);
            if (activity) {
                return formatActivityResponse(activity, questionType);
            }
        }
    }
    
    if (context.type === 'industrial') {
        return formatIndustrialResponse(context.data, questionType);
    }
    
    return null;
}

// ==================== ⚙️ دوال مساعدة ====================
function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeForJS(text) {
    if (!text) return "";
    return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
}

// ==================== 🎯 المحرك الرئيسي ====================
async function processUserQuery(query) {
    console.log("🔍 معالجة السؤال:", query);

    const q = normalizeArabic(query);
    const questionType = detectQuestionType(query);
    const context = window.AgentMemory.getContext();

    // 🎯 توجيه مباشر لمحرك القرار 104 - يأخذ أولوية عالية
    if (window.isDecision104Question && window.isDecision104Question(query)) {
        console.log("🎯 توجيه السؤال لمحرك القرار 104");
        const decision104Response = window.handleDecision104Query(query, questionType);
        if (decision104Response) return decision104Response;
    }

    // 🔧 كشف إضافي لأسئلة القرار 104 من المحرك الدلالي
    const isLikelyDecision104 = /اعفاء|اعفاءات|إعفاء|إعفاءات|حافز|حوافز|قرار.*104|104|قطاع\s*(أ|ا|ب)/i.test(query);
    
    // معالجة الأسئلة الموجهة صراحة
    if (q.startsWith('المناطق الصناعيه:') || q.startsWith('مناطق صناعيه:') || q.startsWith('مناطق:')) {
        const actualQuery = query.replace(/^(المناطق الصناعيه:|مناطق صناعيه:|مناطق:)/i, '').trim();
        await window.AgentMemory.clear();
        return await handleIndustrialQuery(actualQuery, detectQuestionType(actualQuery), null, null);
    }

    if (q.startsWith('الانشطه والتراخيص:') || q.startsWith('نشاط:') || q.startsWith('تراخيص:')) {
        const actualQuery = query.replace(/^(الانشطه والتراخيص:|نشاط:|تراخيص:)/i, '').trim();
        await window.AgentMemory.clear();
        return await handleActivityQuery(actualQuery, detectQuestionType(actualQuery), null, null);
    }

    // معالجة السياق
    if (context && context.type !== 'clarification') {
        const contextResponse = await handleContextualQuery(query, questionType, context);
        if (contextResponse) return contextResponse;
    }

    // التحليل الشامل
    const analysisContext = analyzeContext(query, questionType);
    const entities = extractEntities(query);

    console.log("📊 السياق:", analysisContext);
    console.log("🎯 الكيانات:", entities);

    // 🔧 إذا كان السؤال عن إعفاءات/حوافز، استخدم المحرك الدلالي مباشرة
    if (isLikelyDecision104) {
        console.log("🎯 سؤال محتمل عن القرار 104 - استخدام البحث الدلالي...");
        const searchResult = await smartSearch(query, 'activities');
        
        if (searchResult && searchResult.data) {
            // التحقق من نوع البيانات المُرجعة
            const dbName = searchResult.allResults[0]?.dbName;
            
            if (dbName === 'decision104') {
                console.log("✅ تم العثور على نتيجة من قاعدة القرار 104");
                return formatActivityResponse(searchResult.data, questionType);
            }
        }
    }

    // البحث الذكي
    if (analysisContext.recommendation === 'areas' || questionType.isIndustrial) {
        const response = await handleIndustrialQuery(query, questionType, analysisContext, entities);
        if (response) return response;
    }

    if (analysisContext.recommendation === 'activities' || questionType.isActivity) {
        const response = await handleActivityQuery(query, questionType, analysisContext, entities);
        if (response) return response;
    }

    // البحث المزدوج
    const activityResponse = await handleActivityQuery(query, questionType, analysisContext, entities);
    if (activityResponse) return activityResponse;

    const industrialResponse = await handleIndustrialQuery(query, questionType, analysisContext, entities);
    if (industrialResponse) return industrialResponse;

    // رد افتراضي
    console.log("❌ لم يتم العثور على إجابة");
    return generateDefaultResponse(query);
}

window.generateDefaultResponse = function(query) {
    const q = normalizeArabic(query);
    if (q.length < 3) {
        return `😕 <strong>السؤال قصير جداً</strong><br><br>💡 جرب أن تسأل:<br>• "كم عدد المناطق الصناعية؟"<br>• "ما التراخيص المطلوبة لفندق؟"`;
    }
    return `😕 <strong>عذراً، لم أجد معلومات عن: "${query}"</strong><br><br>💡 جرب أحد هذه الأسئلة:<br>• "كم عدد المناطق الصناعية في مصر؟"<br>• "اذكر اسم أي نشاط"<br>• "هل نشاط النقل الجماعي وارد بالقرار 104؟"`;
};

// ==================== 🖥️ واجهة المستخدم ====================

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
    const context = window.AgentMemory.getContext();
    if (!context || context.type === 'clarification') {
        showGPTNotification('لا يوجد سياق محفوظ حالياً', 'info');
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
    await window.AgentMemory.clear();
    const confirmBox = document.getElementById('memory-confirm-box');
    if (confirmBox) confirmBox.remove();
    showGPTNotification('تم مسح الذاكرة بنجاح', 'success');
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

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const container = document.getElementById('gptMessages');
    const div = document.createElement('div');
    div.className = 'message-row ai';
    div.id = id;
    div.innerHTML = `<div class="avatar ai"><i class="fas fa-robot"></i></div><div class="message-bubble"><div class="typing-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

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
    
    const msgRow = document.createElement('div');
    msgRow.className = 'message-row ai';
    msgRow.innerHTML = `<div class="avatar ai"><i class="fas fa-robot"></i></div><div class="message-bubble"></div>`;
    chatMessagesContainer.appendChild(msgRow);
    const bubble = msgRow.querySelector('.message-bubble');
    
    // عرض فوري للمحتوى
    bubble.innerHTML = htmlContent;
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
};

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

window.addEventListener('load', function() {
    setTimeout(checkInputState, 100);
});

// تصدير الدوال للاستخدام الخارجي
window.extractEntities = extractEntities;
window.extractGovernorates = extractGovernorates;
window.extractDependencies = extractDependencies;
window.calculateSimilarity = calculateSimilarity;
window.extractAreaNames = extractAreaNames;
window.normalizeArabic = normalizeArabic;

console.log('✅ GPT Agent v10.0 - Hybrid Semantic Edition initialized!');
console.log('🚀 Features: Semantic Search • Smart Memory • Instant Loading');
console.log('🧠 Hybrid Engine: E5 Embeddings + Neural Search + Keyword Matching');
console.log('💾 Memory: Persistent Context with localStorage');

} // نهاية الشرط الواقي من التحميل المزدوج
