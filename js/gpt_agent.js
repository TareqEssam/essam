// gpt_agent.js
/****************************************************************************
 * 🤖 GPT-Like Agent v11.0 - ULTIMATE COORDINATOR EDITION
 * 
 * ⚡ المبدأ: فصل المسؤوليات (Separation of Concerns)
 * 
 * هذا الملف يعمل كـ COORDINATOR فقط:
 * ✓ يستقبل السؤال من المستخدم
 * ✓ يحدد نوع السؤال (نشاط / منطقة / قرار 104)
 * ✓ يستخدم المحرك الدلالي للبحث الذكي
 * ✓ يُمرر النتائج للمعالج المتخصص
 * ✓ يعرض النتيجة النهائية
 * 
 * ❌ لا يحتوي على منطق معالجة معقد
 * ❌ لا يحتوي على تنسيق HTML مباشر
 * ❌ كل شيء يتم عبر الملفات المتخصصة
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
                          font-weight: bold;">🚀 محرك دلالي متقدم • معالجات متخصصة • ذاكرة ذكية</span><br><br>
                    <em style="color: #10a37f;">جرب أن تسأل: "فندق" أو "المناطق الصناعية"</em>
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
                جاري تحميل نموذج E5 للذكاء الاصطناعي...<br>
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
    const engineStatus = localStorage.getItem('hybrid-engine-initialized');
    const lastInitTime = localStorage.getItem('hybrid-engine-init-time');
    const currentTime = Date.now();
    
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

    const modal = document.getElementById('hybridEngineLoadingModal');
    const progress = document.getElementById('loadingProgress');
    const status = document.getElementById('loadingStatus');
    
    modal.style.display = 'flex';
    
    try {
        status.textContent = 'تحميل المحرك الدلالي...';
        progress.style.width = '20%';
        
        const { hybridEngine: engine } = await import('./HybridSearchV1.js');
        hybridEngine = engine;
        
        status.textContent = 'تحميل نموذج E5 متعدد اللغات...';
        progress.style.width = '40%';
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        status.textContent = 'تحميل قاعدة البيانات الموحدة...';
        progress.style.width = '60%';
        
        await hybridEngine.initialize();
        
        status.textContent = 'التحقق من جاهزية النظام...';
        progress.style.width = '80%';
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        status.textContent = '✅ المحرك جاهز للعمل!';
        progress.style.width = '100%';
        
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

// ==================== 🔍 البحث الذكي باستخدام المحرك الدلالي ====================
async function searchWithHybridEngine(query, options = {}) {
    if (!isEngineReady || !hybridEngine) {
        console.warn('⚠️ المحرك الدلالي غير جاهز');
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
        console.log(`📊 القاعدة المستهدفة: ${results.intent}`);
        
        return results;
    } catch (error) {
        console.error('❌ خطأ في المحرك الدلالي:', error);
        return null;
    }
}

// ==================== 🎯 المحرك الرئيسي - المنسق ====================
async function processUserQuery(query) {
    console.log("\n🚀 ========== بداية المعالجة ==========");
    console.log("📝 السؤال:", query);

    // 🎯 توجيه مباشر لمحرك القرار 104 (أعلى أولوية)
    if (window.isDecision104Question && window.isDecision104Question(query)) {
        console.log("🎯 العقل المدبر: توجيه السؤال لمحرك القرار 104 المطور");
        const decision104Response = window.handleDecision104Query(query, detectQuestionType(query));
        if (decision104Response) return decision104Response;
    }

    const q = normalizeArabic(query);
    const questionType = detectQuestionType(query);

    // معالجة الأسئلة الموجهة صراحة
    if (q.startsWith('المناطق الصناعيه:') || q.startsWith('مناطق صناعيه:') || q.startsWith('مناطق:')) {
        const actualQuery = query.replace(/^(المناطق الصناعيه:|مناطق صناعيه:|مناطق:)/i, '').trim();
        await window.AgentMemory.clear();
        
        // استخدام معالج المناطق المتخصص
        if (typeof handleIndustrialQuery === 'function') {
            return await handleIndustrialQuery(actualQuery, detectQuestionType(actualQuery), null, null);
        }
    }

    if (q.startsWith('الانشطه والتراخيص:') || q.startsWith('نشاط:') || q.startsWith('تراخيص:')) {
        const actualQuery = query.replace(/^(الانشطه والتراخيص:|نشاط:|تراخيص:)/i, '').trim();
        await window.AgentMemory.clear();
        
        // استخدام معالج الأنشطة المتخصص
        if (typeof handleActivityQuery === 'function') {
            return await handleActivityQuery(actualQuery, detectQuestionType(actualQuery), null, null);
        }
    }

    // 🧠 استخدام المحرك الدلالي للبحث
    const hybridResults = await searchWithHybridEngine(query, { topK: 10 });

    if (hybridResults && hybridResults.intent) {
        const intent = hybridResults.intent;
        console.log(`🎯 المحرك الدلالي حدد القاعدة: ${intent}`);

        // توجيه للمعالج المناسب بناءً على القاعدة
        if (intent === 'activities' && typeof handleActivityQuery === 'function') {
            console.log("📋 تمرير النتائج لمعالج الأنشطة المتخصص...");
            
            // تحويل نتائج المحرك الدلالي لصيغة متوافقة مع NeuralSearch
            const compatibleResults = {
                results: hybridResults.results.map(r => ({
                    text: r.data.original_data['النشاط المحدد'] || r.data.original_data['النشاط_المحدد'] || '',
                    value: r.data.original_data.value || r.id,
                    originalData: r.data.original_data,
                    finalScore: r.cosineScore * 1000, // تحويل للصيغة القديمة
                    source: 'hybrid'
                }))
            };
            
            // استخدام المعالج الأصلي بالنتائج المحسّنة
            window.lastHybridResults = compatibleResults; // حفظ مؤقت
            return await handleActivityQuery(query, questionType, null, null);
        }

        if (intent === 'areas' && typeof handleIndustrialQuery === 'function') {
            console.log("🏭 تمرير النتائج لمعالج المناطق المتخصص...");
            
            // تحويل النتائج للصيغة المناسبة
            const compatibleResults = {
                results: hybridResults.results.map(r => ({
                    text: r.data.original_data.name || r.data.original_data['اسم_المنطقة'] || '',
                    originalData: r.data.original_data,
                    finalScore: r.cosineScore * 1000,
                    source: 'hybrid'
                }))
            };
            
            window.lastHybridResults = compatibleResults;
            return await handleIndustrialQuery(query, questionType, null, null);
        }

        if (intent === 'decision104' && typeof window.handleDecision104Query === 'function') {
            console.log("📊 تمرير النتائج لمعالج القرار 104 المتخصص...");
            return window.handleDecision104Query(query, questionType);
        }
    }

    // Fallback: استخدام المعالجات الأصلية مباشرة
    console.log("🔄 استخدام المعالجات التقليدية...");
    
    if (typeof handleActivityQuery === 'function') {
        const activityResponse = await handleActivityQuery(query, questionType, null, null);
        if (activityResponse) return activityResponse;
    }

    if (typeof handleIndustrialQuery === 'function') {
        const industrialResponse = await handleIndustrialQuery(query, questionType, null, null);
        if (industrialResponse) return industrialResponse;
    }

    console.log("❌ لم يتم العثور على إجابة");
    return generateDefaultResponse(query);
}

// ==================== دوال مساعدة ====================
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

window.detectQuestionType = function(query) {
    const q = normalizeArabic(query);
    return {
        isCount: /عدد|كام|كم|تعداد/.test(q),
        isList: /اسماء|قائمه|قائمة|اذكر|وضح|ايه|اي|ما هي/.test(q),
        isLocation: /مكان|موقع|فين|اين|خريطه|خريطة/.test(q),
        isLicense: /ترخيص|تراخيص|رخصه|موافقه/.test(q),
        isAuthority: /جهه|جهة|هيئه|هيئة|وزاره|وزارة/.test(q),
        isLaw: /قانون|سند|تشريع|قرار/.test(q),
        isGuide: /دليل|guide|رابط/.test(q),
        isTechnical: /ملاحظات|فنيه|معاينه/.test(q),
        isDecision104: /قرار.*104|104|حافز|حوافز/.test(q),
        isIndustrial: /منطقه صناعيه|مناطق صناعيه|منطقة صناعية/.test(q),
        isActivity: /نشاط|مشروع|عمل/.test(q),
        isYesNo: /هل|ايه|صح|خطأ/.test(q)
    };
};

window.generateDefaultResponse = function(query) {
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
            const chars = text.split('');
            chars.forEach(char => taskQueue.push({ type: 'append-char', node: secureTextNode, char }));
        } else if (node.nodeType === 1) {
            const clonedElement = document.createElement(node.tagName);
            Array.from(node.attributes).forEach(attr => clonedElement.setAttribute(attr.name, attr.value));
            taskQueue.push({ type: 'inject-node', node: clonedElement, parent: parentElement });
            Array.from(node.childNodes).forEach(child => traverseAndQueue(child, clonedElement));
        }
    }

    Array.from(tempDiv.childNodes).forEach(child => traverseAndQueue(child, bubble));

    const currentSession = { isCancelled: false, animationId: null };
    window.activeTypingSession = currentSession;
    let taskIndex = 0;
    const charsPerFrame = 3;
    let fullTextForSpeech = '';

    const renderFrame = () => {
        if (currentSession.isCancelled) return;
        const endIndex = Math.min(taskIndex + charsPerFrame, taskQueue.length);
        for (let i = taskIndex; i < endIndex; i++) {
            const task = taskQueue[i];
            if (task.type === 'inject-node') {
                task.parent.appendChild(task.node);
            } else if (task.type === 'append-char') {
                task.node.nodeValue += task.char;
                fullTextForSpeech += task.char;
            }
        }
        taskIndex = endIndex;
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        if (taskIndex < taskQueue.length) {
            currentSession.animationId = requestAnimationFrame(renderFrame);
        } else {
            if (shouldAutoSpeak && window.GPT_VOICE && window.GPT_VOICE.speechEnabled) {
                setTimeout(() => {
                    if (!currentSession.isCancelled) {
                        const voiceControls = document.getElementById('gptVoiceControls');
                        if (voiceControls) voiceControls.style.display = 'flex';
                        if (window.speakText) window.speakText(fullTextForSpeech);
                    }
                }, 200);
            }
            window.activeTypingSession = null;
        }
    };
    currentSession.animationId = requestAnimationFrame(renderFrame);
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
        text-align: center;
    `;
    div.innerHTML = `✨ ${msg}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    setTimeout(() => div.remove(), 3000);
};

window.GPT_AGENT.closeKeywords = ['شكرا', 'شكراً', 'باي', 'مع السلامة', 'إغلاق'];

window.checkForGPTCloseIntent = function(text) {
    const q = normalizeArabic(text);
    return window.GPT_AGENT.closeKeywords.some(k => q.includes(k));
};

window.gptGracefulClose = function() {
    const msgs = ['تشرفنا بخدمتك، في أمان الله.', 'سعدت بمساعدتك، مع السلامة.'];
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

window.normalizeArabic = normalizeArabic;

console.log('✅ GPT Agent v11.0 - Ultimate Coordinator Edition initialized!');
console.log('🎯 Architecture: Separation of Concerns');
console.log('🧠 Hybrid Engine: E5 + Specialized Handlers');
console.log('📋 gpt_activities.js → Activity Processing');
console.log('🏭 gpt_areas.js → Industrial Zones Processing');
console.log('📊 gpt_decision104.js → Decision 104 Processing');

} 

