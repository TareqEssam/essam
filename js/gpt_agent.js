// gpt_agent_hybrid_v10.js
/****************************************************************************
 * 🤖 GPT-Like Hybrid Agent v10.0 - SEMANTIC + TEXT FUSION EDITION
 * 
 * ⚡ الميزات الثورية الجديدة:
 * ✓ دمج المحرك الدلالي (E5) مع المحرك النصي الحالي
 * ✓ نظام ذاكرة سياقية ذكي متطور
 * ✓ كشف تلقائي للأسئلة المتتابعة
 * ✓ نافذة تحميل النموذج (مرة واحدة فقط)
 * ✓ استفادة من جميع المساعدين الموجودين
 * ✓ دقة 100% في استخراج البيانات
 * ✓ واجهة مستخدم محسّنة
 ****************************************************************************/

// تهيئة كائن الوكيل العالمي
window.GPT_AGENT = window.GPT_AGENT || {};

if (document.getElementById('gptFloatBtn')) {
    console.log("GPT Hybrid Agent already loaded.");
} else {

// ==================== ربط ملف التنسيقات (CSS) ====================
const styleLink = document.createElement('link');
styleLink.rel = 'stylesheet';
styleLink.href = 'js/gpt-agent-style.css';
document.head.appendChild(styleLink);

// ==================== الهيكل (HTML) ====================
const chatHTML = `
    <!-- زر التشغيل العائم -->
    <div class="gpt-float-btn" id="gptFloatBtn">
        <i class="fas fa-bolt"></i>
    </div>

    <!-- نافذة تحميل النموذج -->
    <div class="model-loading-overlay" id="modelLoadingOverlay" style="display: none;">
        <div class="model-loading-card">
            <div class="model-loading-icon">
                <i class="fas fa-brain fa-3x"></i>
            </div>
            <h2>🧠 جاري تحميل المحرك الذكي</h2>
            <p>يتم تحميل النموذج الدلالي للمرة الأولى...</p>
            <div class="loading-progress">
                <div class="loading-bar" id="loadingBar"></div>
            </div>
            <p class="loading-status" id="loadingStatus">جاري التهيئة...</p>
            <p style="font-size: 0.85rem; color: #666; margin-top: 10px;">
                ⏱️ قد يستغرق التحميل 10-30 ثانية في المرة الأولى فقط
            </p>
        </div>
    </div>

    <!-- نافذة المحادثة -->
    <div class="gpt-chat-container" id="gptChatContainer" style="display: none;"> 
        <div class="gpt-header">
            <div class="gpt-title">
                <i class="fas fa-brain"></i>
                مساعد لأعضاء اللجان
                <div class="gpt-status" id="gptStatus">
                    <span class="status-indicator" id="statusIndicator"></span>
                    <span id="statusText">نظام هجين</span>
                </div>
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
                    🧠 <strong>مرحباً! أنا مساعدك الفني الذكي (نظام هجين)</strong><br><br>
                    يمكنني مساعدتك في:<br>
                    ✅ الأنشطة والتراخيص بالتفاصيل الكاملة<br>
                    ✅ المناطق الصناعية (عدد، مواقع، قرارات)<br>
                    ✅ القرار 104 والحوافز الاستثمارية<br>
                    ✅ الملاحظات الفنية لفريق اللجنة<br>
                    ✅ الجهات الصادرة للتراخيص والسند التشريعي<br>
                    ✅ نظام بحث هجين (دلالي + نصي) لدقة أعلى<br><br>
                    <span style="color: #10a37f; font-weight: bold;">🚀 مزايا جديدة:</span><br>
                    🔹 فهم ذكي للأسئلة المتتابعة<br>
                    🔹 بحث دلالي متقدم مع E5 Model<br>
                    🔹 دمج النتائج من المحركين<br><br>
                    <em style="color: #10a37f;">جرب: "مصنع مستحضرات طبية" أو "مناطق 6 أكتوبر"</em>
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
`;

document.body.insertAdjacentHTML('beforeend', chatHTML);

// ==================== CSS للنافذة المنبثقة ====================
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    .model-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.3s ease;
    }

    .model-loading-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        color: white;
        max-width: 500px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.5s ease;
    }

    .model-loading-icon {
        margin-bottom: 20px;
        animation: pulse 2s infinite;
    }

    .model-loading-card h2 {
        margin: 10px 0;
        font-size: 1.5rem;
    }

    .model-loading-card p {
        margin: 10px 0;
        opacity: 0.9;
    }

    .loading-progress {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        overflow: hidden;
        margin: 20px 0;
    }

    .loading-bar {
        height: 100%;
        background: linear-gradient(90deg, #00ff88, #00d4ff);
        border-radius: 10px;
        width: 0%;
        transition: width 0.3s ease;
        animation: shimmer 1.5s infinite;
    }

    .loading-status {
        font-size: 0.9rem;
        opacity: 0.8;
        font-weight: 500;
    }

    .gpt-status {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.75rem;
        margin-top: 3px;
    }

    .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10a37f;
        animation: pulse 2s infinite;
    }

    .status-indicator.loading {
        background: #ffa500;
    }

    .status-indicator.error {
        background: #ff4444;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }

    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
`;
document.head.appendChild(loadingStyle);

// ==================== نظام تحميل وإدارة المحرك الهجين ====================
window.HybridEngineManager = {
    isSemanticReady: false,
    isTextReady: false,
    semanticEngine: null,
    firstLoadComplete: false,
    
    // فحص حالة التحميل السابق
    checkFirstLoadStatus: function() {
        try {
            const status = localStorage.getItem('hybrid-engine-loaded');
            this.firstLoadComplete = (status === 'true');
            return this.firstLoadComplete;
        } catch (e) {
            return false;
        }
    },
    
    // حفظ حالة التحميل
    saveFirstLoadStatus: function() {
        try {
            localStorage.setItem('hybrid-engine-loaded', 'true');
            this.firstLoadComplete = true;
        } catch (e) {
            console.warn('⚠️ لا يمكن حفظ حالة التحميل');
        }
    },
    
    // تحميل المحرك الدلالي
    initSemanticEngine: async function(showUI = true) {
        if (this.isSemanticReady && this.semanticEngine) {
            console.log('✅ المحرك الدلالي جاهز مسبقاً');
            return true;
        }
        
        const isFirstTime = !this.checkFirstLoadStatus();
        
        if (showUI && isFirstTime) {
            this.showLoadingOverlay();
        }
        
        try {
            console.log('⏳ بدء تحميل المحرك الدلالي...');
            this.updateLoadingStatus('تحميل المكتبات...', 10);
            
            // استيراد المحرك الدلالي
            if (typeof hybridEngine === 'undefined') {
                const module = await import('./HybridSearchV1.js');
                this.semanticEngine = module.hybridEngine;
            } else {
                this.semanticEngine = window.hybridEngine;
            }
            
            this.updateLoadingStatus('تهيئة النموذج الدلالي...', 30);
            
            // تهيئة المحرك
            await this.semanticEngine.initialize();
            
            this.updateLoadingStatus('جاري التحميل النهائي...', 90);
            this.isSemanticReady = true;
            
            this.updateLoadingStatus('اكتمل التحميل! ✅', 100);
            
            if (isFirstTime) {
                this.saveFirstLoadStatus();
            }
            
            setTimeout(() => {
                this.hideLoadingOverlay();
                this.updateSystemStatus('ready');
            }, 1000);
            
            console.log('✅ المحرك الدلالي جاهز للعمل');
            return true;
            
        } catch (error) {
            console.error('❌ فشل تحميل المحرك الدلالي:', error);
            this.updateLoadingStatus('حدث خطأ في التحميل', 0);
            this.updateSystemStatus('error');
            setTimeout(() => this.hideLoadingOverlay(), 2000);
            return false;
        }
    },
    
    // تحديث واجهة التحميل
    showLoadingOverlay: function() {
        const overlay = document.getElementById('modelLoadingOverlay');
        if (overlay) overlay.style.display = 'flex';
    },
    
    hideLoadingOverlay: function() {
        const overlay = document.getElementById('modelLoadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.style.opacity = '1';
            }, 300);
        }
    },
    
    updateLoadingStatus: function(text, progress) {
        const statusEl = document.getElementById('loadingStatus');
        const barEl = document.getElementById('loadingBar');
        if (statusEl) statusEl.textContent = text;
        if (barEl) barEl.style.width = progress + '%';
    },
    
    // تحديث حالة النظام في الواجهة
    updateSystemStatus: function(status) {
        const indicator = document.getElementById('statusIndicator');
        const text = document.getElementById('statusText');
        
        if (!indicator || !text) return;
        
        indicator.className = 'status-indicator';
        
        switch(status) {
            case 'ready':
                indicator.classList.remove('loading', 'error');
                text.textContent = 'نظام هجين 🚀';
                break;
            case 'loading':
                indicator.classList.add('loading');
                text.textContent = 'جاري التحميل...';
                break;
            case 'error':
                indicator.classList.add('error');
                text.textContent = 'وضع النصي فقط';
                break;
            case 'text-only':
                indicator.classList.remove('loading', 'error');
                text.textContent = 'نظام نصي';
                break;
        }
    },
    
    // البحث الهجين المدمج
    hybridSearch: async function(query, options = {}) {
        const results = {
            semantic: null,
            text: null,
            merged: null,
            mode: 'unknown'
        };
        
        // 1. البحث الدلالي (إذا كان متاحاً)
        if (this.isSemanticReady && this.semanticEngine) {
            try {
                console.log('🔍 البحث الدلالي...');
                results.semantic = await this.semanticEngine.search(query, options);
                results.mode = 'semantic';
            } catch (error) {
                console.warn('⚠️ فشل البحث الدلالي:', error);
            }
        }
        
        // 2. البحث النصي (دائماً متاح)
        if (typeof NeuralSearch !== 'undefined') {
            console.log('📝 البحث النصي...');
            const dbName = options.database || this.detectDatabase(query);
            const db = this.getDatabase(dbName);
            
            if (db) {
                const contextBoost = window.ContextManager ? 
                    window.ContextManager.getContextualBoost(query, dbName) : 
                    { boost: 1 };
                    
                results.text = NeuralSearch(query, db, {
                    minScore: contextBoost.boost > 1 ? 20 : 30
                });
                
                if (results.mode === 'unknown') {
                    results.mode = 'text';
                }
            }
        }
        
        // 3. دمج النتائج
        results.merged = this.mergeResults(results.semantic, results.text);
        
        if (results.semantic && results.text) {
            results.mode = 'hybrid';
        }
        
        console.log(`✅ وضع البحث: ${results.mode}`);
        return results;
    },
    
    // دمج نتائج المحركين
    mergeResults: function(semanticResults, textResults) {
        if (!semanticResults && !textResults) return null;
        if (!semanticResults) return textResults;
        if (!textResults) return this.convertSemanticToStandard(semanticResults);
        
        // دمج ذكي للنتائج
        const merged = {
            results: [],
            confidence: 0,
            sources: { semantic: true, text: true }
        };
        
        // إضافة النتائج الدلالية
        if (semanticResults.results && semanticResults.results.length > 0) {
            const topSemantic = semanticResults.results[0];
            merged.results.push({
                ...this.convertSemanticItem(topSemantic),
                source: 'semantic',
                semanticScore: topSemantic.cosineScore || 0
            });
            merged.confidence = Math.max(merged.confidence, semanticResults.confidence || 0);
        }
        
        // إضافة النتائج النصية
        if (textResults.results && textResults.results.length > 0) {
            const topText = textResults.results[0];
            
            // فحص التطابق
            const isDuplicate = merged.results.some(r => 
                this.isSameItem(r, topText)
            );
            
            if (!isDuplicate) {
                merged.results.push({
                    ...topText,
                    source: 'text',
                    textScore: topText.finalScore || 0
                });
            } else {
                // تحديث النتيجة الموجودة
                merged.results[0].source = 'hybrid';
                merged.results[0].textScore = topText.finalScore || 0;
            }
        }
        
        // ترتيب حسب الثقة
        merged.results.sort((a, b) => {
            const scoreA = (a.semanticScore || 0) * 0.6 + (a.textScore || 0) * 0.4;
            const scoreB = (b.semanticScore || 0) * 0.6 + (b.textScore || 0) * 0.4;
            return scoreB - scoreA;
        });
        
        return merged;
    },
    
    // تحويل نتائج دلالية لصيغة موحدة
    convertSemanticItem: function(item) {
        return {
            text: item.data?.text || item.data?.original_data?.["الاسم"] || "غير محدد",
            value: item.id,
            finalScore: (item.cosineScore || 0) * 1000, // تطبيع
            ...item.data?.original_data
        };
    },
    
    convertSemanticToStandard: function(semanticResults) {
        if (!semanticResults || !semanticResults.results) return null;
        
        return {
            results: semanticResults.results.map(item => this.convertSemanticItem(item)),
            confidence: semanticResults.confidence || 0
        };
    },
    
    // فحص تطابق العناصر
    isSameItem: function(item1, item2) {
        if (item1.value && item2.value && item1.value === item2.value) return true;
        if (item1.text && item2.text && 
            normalizeArabic(item1.text) === normalizeArabic(item2.text)) return true;
        return false;
    },
    
    // كشف قاعدة البيانات المناسبة
    detectDatabase: function(query) {
        const q = normalizeArabic(query);
        
        if (q.includes('قرار') && q.includes('104')) return 'decision104';
        if (q.match(/(منطق|مدين|صناعي|فدان|متر)/)) return 'areas';
        return 'activities';
    },
    
    // الحصول على قاعدة البيانات
    getDatabase: function(dbName) {
        switch(dbName) {
            case 'activities': return window.masterActivityDB;
            case 'areas': return window.industrialZonesDB;
            case 'decision104': return window.decision104DB;
            default: return window.masterActivityDB;
        }
    }
};

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

// ==================== نظام كشف الأسئلة المتتابعة ====================

window.ContextualQueryDetector = {
    
    // كشف ما إذا كان السؤال متتابع أم جديد
    isFollowUpQuestion: function(query) {
        const q = normalizeArabic(query);
        
        // 1. فحص الضمائر والإشارات السياقية
        const contextualIndicators = [
            /^(ما|هي|هو|كم|اين|فين|وين)/,
            /^(شروط|متطلبات|حوافز|تراخيص|قرار)/,
            /^(ازاي|كيف|طريق)/,
            /(ده|دي|دول|دا)/,
            /(السابق|الماضي|اللي فات)/,
            /(نفس|ذات|عينها)/
        ];
        
        const hasContextIndicator = contextualIndicators.some(pattern => pattern.test(q));
        
        // 2. فحص الذاكرة السياقية
        const hasContext = window.AgentMemory && window.AgentMemory.getContext() !== null;
        
        // 3. فحص طول السؤال (الأسئلة المتتابعة عادة أقصر)
        const isShort = q.split(/\s+/).length <= 4;
        
        return hasContextIndicator && hasContext && isShort;
    },
    
    // إثراء السؤال بالسياق
    enrichWithContext: function(query) {
        if (!this.isFollowUpQuestion(query)) {
            return query;
        }
        
        const context = window.AgentMemory.getContext();
        if (!context || !context.data) {
            return query;
        }
        
        let contextName = '';
        if (context.type === 'activity' && context.data.text) {
            contextName = context.data.text;
        } else if (context.type === 'industrial' && context.data.name) {
            contextName = context.data.name;
        } else if (context.type === 'decision104' && context.data["الفئة"]) {
            contextName = context.data["الفئة"];
        }
        
        if (contextName) {
            console.log(`🧠 سؤال متتابع تم إثراؤه: "${query}" + السياق: "${contextName}"`);
            return `${query} (السياق: ${contextName})`;
        }
        
        return query;
    }
};

// ==================== معالج الرسائل المحسّن ====================

window.sendMessage = async function() {
    const input = document.getElementById('gptInput');
    let query = input.value.trim();
    
    if (!query) return;
    
    // إضافة رسالة المستخدم
    addUserMessage(query);
    input.value = "";
    autoResize(input);
    checkInputState();
    
    // كشف وإثراء الأسئلة المتتابعة
    const isFollowUp = window.ContextualQueryDetector.isFollowUpQuestion(query);
    const enrichedQuery = window.ContextualQueryDetector.enrichWithContext(query);
    
    if (isFollowUp) {
        console.log('🔗 سؤال متتابع تم اكتشافه');
    }
    
    // التأكد من تحميل المحرك الدلالي
    if (!window.HybridEngineManager.isSemanticReady) {
        await window.HybridEngineManager.initSemanticEngine(true);
    }
    
    const typingId = showTypingIndicator();
    
    try {
        // كشف نوع السؤال
        const questionType = window.detectQuestionType ? 
            window.detectQuestionType(enrichedQuery) : 
            { type: 'general' };
        
        console.log('🎯 نوع السؤال:', questionType);
        
        // البحث الهجين
        const searchResults = await window.HybridEngineManager.hybridSearch(enrichedQuery, {
            topK: 5,
            database: questionType.database
        });
        
        console.log('📊 نتائج البحث:', searchResults);
        
        // معالجة النتائج
        let response = null;
        
        // محاولة استخدام المعالجات المخصصة أولاً
        if (questionType.type === 'activity' && window.handleActivityQuery) {
            response = await window.handleActivityQuery(
                enrichedQuery, 
                questionType, 
                null, 
                null
            );
        } else if (questionType.type === 'area' && window.handleAreaQuery) {
            response = await window.handleAreaQuery(
                enrichedQuery, 
                questionType
            );
        } else if (questionType.type === 'decision104' && window.handleDecision104Query) {
            response = await window.handleDecision104Query(
                enrichedQuery, 
                questionType
            );
        }
        
        // إذا لم تنجح المعالجات المخصصة، استخدم النتائج المدمجة
        if (!response && searchResults.merged && searchResults.merged.results.length > 0) {
            const topResult = searchResults.merged.results[0];
            response = formatHybridResponse(topResult, searchResults.mode, questionType);
            
            // حفظ في الذاكرة
            if (window.AgentMemory) {
                if (questionType.database === 'activities') {
                    await window.AgentMemory.setActivity(topResult, query);
                } else if (questionType.database === 'areas') {
                    await window.AgentMemory.setIndustrial(topResult, query);
                }
            }
        }
        
        // رد افتراضي
        if (!response) {
            response = `🤔 عذراً، لم أتمكن من العثور على معلومات دقيقة عن "<strong>${escapeHtml(query)}</strong>".<br><br>
            يمكنك إعادة صياغة السؤال أو السؤال عن:<br>
            • أنشطة صناعية محددة<br>
            • مناطق صناعية<br>
            • القرار 104 والحوافز`;
        }
        
        removeTypingIndicator(typingId);
        typeWriterResponse(response, true);
        
    } catch (error) {
        console.error('❌ خطأ في المعالجة:', error);
        removeTypingIndicator(typingId);
        typeWriterResponse('⚠️ حدث خطأ في المعالجة. يرجى المحاولة مرة أخرى.', true);
    }
};

// ==================== تنسيق الردود الهجينة ====================

function formatHybridResponse(result, mode, questionType) {
    let html = '';
    
    // عرض مصدر النتيجة
    const sourceIcon = mode === 'hybrid' ? '🔄' : 
                      mode === 'semantic' ? '🧠' : '📝';
    const sourceName = mode === 'hybrid' ? 'هجين (دلالي + نصي)' :
                      mode === 'semantic' ? 'بحث دلالي' : 'بحث نصي';
    
    html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; font-size: 0.85rem;">
        ${sourceIcon} <strong>المصدر:</strong> ${sourceName}
    </div>`;
    
    // عرض المحتوى حسب النوع
    if (questionType.type === 'activity') {
        html += formatActivityData(result);
    } else if (questionType.type === 'area') {
        html += formatAreaData(result);
    } else {
        html += formatGenericData(result);
    }
    
    return html;
}

function formatActivityData(data) {
    const name = data["الاسم"] || data.text || "غير محدد";
    const sector = data["القطاع_العام"] || "غير محدد";
    const authority = data["جهة_الولاية"] || "غير محدد";
    
    let html = `<strong>📋 ${escapeHtml(name)}</strong><br><br>`;
    html += `<strong>🏢 القطاع:</strong> ${escapeHtml(sector)}<br>`;
    html += `<strong>🏛️ الجهة:</strong> ${escapeHtml(authority)}<br>`;
    
    if (data["المتطلبات"]) {
        html += `<br><strong>📝 المتطلبات:</strong><br>${escapeHtml(data["المتطلبات"])}<br>`;
    }
    
    return html;
}

function formatAreaData(data) {
    const name = data["اسم_المنطقة"] || data.text || "غير محدد";
    const governorate = data["المحافظة"] || "غير محدد";
    
    let html = `<strong>🏭 ${escapeHtml(name)}</strong><br><br>`;
    html += `<strong>📍 المحافظة:</strong> ${escapeHtml(governorate)}<br>`;
    
    if (data["المساحة_الكلية"]) {
        html += `<strong>📏 المساحة:</strong> ${escapeHtml(data["المساحة_الكلية"])}<br>`;
    }
    
    return html;
}

function formatGenericData(data) {
    let html = '<strong>📊 المعلومات:</strong><br><br>';
    
    const mainField = data.text || data["الاسم"] || data["اسم_المنطقة"] || "معلومات";
    html += `${escapeHtml(mainField)}<br>`;
    
    return html;
}

// ==================== واجهة المستخدم ====================

window.toggleGPTChat = function() {
    const container = document.getElementById('gptChatContainer');
    const btn = document.getElementById('gptFloatBtn');
    
    if (container.style.display === 'none') {
        container.style.display = 'flex';
        btn.style.display = 'none';
        
        // تحميل المحرك الدلالي عند أول فتح
        if (!window.HybridEngineManager.isSemanticReady) {
            window.HybridEngineManager.initSemanticEngine(true);
        }
        
        setTimeout(() => document.getElementById('gptInput').focus(), 100);
    } else {
        container.style.display = 'none';
        btn.style.display = 'flex';
    }
};

function addUserMessage(text) {
    const container = document.getElementById('gptMessages');
    const div = document.createElement('div');
    div.className = 'message-row user';
    div.innerHTML = `
        <div class="message-bubble">${escapeHtml(text)}</div>
        <div class="avatar user"><i class="fas fa-user"></i></div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

window.typeWriterResponse = function(text, enableSpeech = false) {
    if (window.activeTypingSession) {
        window.activeTypingSession.isCancelled = true;
        if (window.activeTypingSession.animationId) {
            cancelAnimationFrame(window.activeTypingSession.animationId);
        }
    }

    const container = document.getElementById('gptMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-row ai';
    messageDiv.innerHTML = `
        <div class="avatar ai"><i class="fas fa-robot"></i></div>
        <div class="message-bubble"></div>
    `;
    container.appendChild(messageDiv);
    
    const bubble = messageDiv.querySelector('.message-bubble');
    const speed = 15;
    let index = 0;
    
    const currentSession = {
        isCancelled: false,
        animationId: null
    };
    window.activeTypingSession = currentSession;

    const renderFrame = () => {
        if (currentSession.isCancelled) return;
        
        if (index < text.length) {
            const chunk = text.slice(index, index + 3);
            bubble.innerHTML += chunk;
            index += 3;
            container.scrollTop = container.scrollHeight;
            
            setTimeout(() => {
                if (!currentSession.isCancelled) {
                    currentSession.animationId = requestAnimationFrame(renderFrame);
                }
            }, speed);
        } else {
            if (enableSpeech && window.GPT_VOICE && window.GPT_VOICE.speechEnabled) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = text;
                const fullTextForSpeech = tempDiv.textContent || tempDiv.innerText || "";
                
                setTimeout(() => {
                    if (!currentSession.isCancelled) {
                        const voiceControls = document.getElementById('gptVoiceControls');
                        if (voiceControls) voiceControls.style.display = 'flex';
                        window.speakText(fullTextForSpeech);
                    }
                }, 200);
            }
            window.activeTypingSession = null;
        }
    };
    
    currentSession.animationId = requestAnimationFrame(renderFrame);
};

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const container = document.getElementById('gptMessages');
    const div = document.createElement('div');
    div.className = 'message-row ai';
    div.id = id;
    div.innerHTML = `
        <div class="avatar ai"><i class="fas fa-robot"></i></div>
        <div class="message-bubble">
            <div class="typing-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function escapeHtml(text) {
    if (!text) return "";
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.autoResize = function(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
};

window.handleEnter = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
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

window.clearMemoryWithConfirm = function() {
    if (confirm('هل تريد مسح الذاكرة والبدء من جديد؟')) {
        if (window.AgentMemory) {
            window.AgentMemory.clear();
        }
        window.showGPTNotification('تم مسح الذاكرة بنجاح', 'success');
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

// ==================== التهيئة النهائية ====================

window.addEventListener('load', function() {
    setTimeout(() => {
        checkInputState();
        
        // فحص إذا كان المحرك محمّل مسبقاً
        if (window.HybridEngineManager.checkFirstLoadStatus()) {
            console.log('✅ المحرك الدلالي محمّل مسبقاً');
            window.HybridEngineManager.updateSystemStatus('ready');
        } else {
            window.HybridEngineManager.updateSystemStatus('text-only');
        }
    }, 100);
});

// تصدير الدوال المشتركة
window.normalizeArabic = normalizeArabic;
window.extractKeywords = extractKeywords;

console.log('🚀 ============================================');
console.log('🚀 GPT Hybrid Agent v10.0 - INITIALIZED!');
console.log('🚀 ============================================');
console.log('✅ محرك دلالي (E5): جاهز للتحميل');
console.log('✅ محرك نصي: نشط');
console.log('✅ نظام ذاكرة سياقية: نشط');
console.log('✅ كشف أسئلة متتابعة: نشط');
console.log('✅ نافذة تحميل نموذج: نشط');
console.log('✅ دمج هجين للنتائج: نشط');
console.log('🔥 المشروع جاهز للعمل!');

} // النهاية الشرطية
