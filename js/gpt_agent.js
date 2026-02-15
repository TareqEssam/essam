// gpt_agent.js
/****************************************************************************
 * 🤖 GPT-Like Agent v10.0 - HYBRID SEMANTIC EDITION
 * 
 * ⚡ الميزات الجديدة:
 * ✓ محرك بحث دلالي هجين (E5 + RRF) لفهم دقيق للأسئلة
 * ✓ شاشة تحميل ذكية للنموذج (مرة واحدة فقط)
 * ✓ تكامل كامل مع الذاكرة السياقية (من agent_memory.js)
 * ✓ دقة غير مسبوقة في استخراج المعلومات
 * ✓ محافظة على جميع ميزات الواجهة السابقة
 ****************************************************************************/

// ==================== التهيئة والحماية من التحميل المزدوج ====================
if (document.getElementById('gptFloatBtn')) {
    console.log("GPT Agent already loaded.");
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
                مساعد اللجان الذكي
                <div class="gpt-status"></div>
            </div>
            <div class="gpt-header-actions">
                <div class="gpt-settings-btn" onclick="window.showGPTVoiceSelector?.()" title="إعدادات الصوت">
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
            <div class="message-row ai" id="welcomeMessage">
                <div class="avatar ai"><i class="fas fa-sparkles"></i></div>
                <div class="message-bubble">
                    🧠 <strong>مرحباً! أنا المساعد الذكي</strong><br><br>
                    <div id="loadingStatus" style="display: none;">⏳ جاري تحميل النموذج الدلالي...</div>
                    <div id="readyMessage">
                        يمكنني مساعدتك في:<br>
                        ✅ الأنشطة والتراخيص بالتفاصيل الكاملة<br>
                        ✅ المناطق الصناعية (عدد، مواقع، قرارات..)<br>
                        ✅ القرار 104 والحوافز الاستثمارية<br>
                        ✅ الملاحظات الفنية لفريق اللجنة<br>
                        ✅ الجهات المصدرة للتراخيص والسند التشريعي<br><br>
                        <em style="color: #10a37f;">جرب أن تسأل: "مصنع مستحضرات طبية"</em>
                    </div>
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

// ==================== تحميل المحرك الدلالي مع شاشة انتظار ====================
window.hybridEngineReady = false;
const loadingStatusEl = document.getElementById('loadingStatus');
const readyMessageEl = document.getElementById('readyMessage');

async function loadHybridEngine() {
    if (window.hybridEngine) {
        window.hybridEngineReady = true;
        return;
    }

    // إظهار شاشة التحميل
    if (loadingStatusEl) loadingStatusEl.style.display = 'block';
    if (readyMessageEl) readyMessageEl.style.display = 'none';

    try {
        // استيراد المحرك من الملف module
        const module = await import('./HybridSearchV1.js');
        window.hybridEngine = module.hybridEngine;

        // تهيئة المحرك (تحميل النموذج)
        await window.hybridEngine.initialize();

        window.hybridEngineReady = true;
        console.log('✅ Hybrid engine loaded and initialized.');

        // تحديث الواجهة
        if (loadingStatusEl) loadingStatusEl.style.display = 'none';
        if (readyMessageEl) readyMessageEl.style.display = 'block';
    } catch (error) {
        console.error('❌ فشل تحميل المحرك الدلالي:', error);
        if (loadingStatusEl) loadingStatusEl.innerHTML = '❌ فشل التحميل، يرجى تحديث الصفحة.';
    }
}

// بدء التحميل فوراً (مع تأخير بسيط لظهور الواجهة)
setTimeout(loadHybridEngine, 500);

// ==================== دوال مساعدة أساسية ====================
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

// كاشف نوع السؤال (يبقى اختيارياً للـ fallback)
window.detectQuestionType = function(query) {
    const q = normalizeArabic(query);
    return {
        isCount: /عدد|كام|كم/.test(q),
        isList: /اسماء|قائمه|قائمة|اذكر|وضح/.test(q),
        isLocation: /مكان|موقع|فين|اين|خريطه/.test(q),
        isLicense: /ترخيص|تراخيص|رخصه/.test(q),
        isAuthority: /جهه|جهة|هيئه|وزاره/.test(q),
        isLaw: /قانون|سند|تشريع|قرار/.test(q),
        isGuide: /دليل|جايد|رابط/.test(q),
        isTechnical: /ملاحظات|فنيه|معاينه/.test(q),
        isDecision104: /قرار.*104|حوافز|قطاع\s*(أ|ا|ب)/.test(q),
        isDependency: /تابع|تبعيه|ولايه/.test(q),
        isIndustrial: /منطقه|منطقة|صناعيه|صناعية/.test(q),
        isActivity: /نشاط|مشروع|عمل/.test(q)
    };
};

// ==================== معالجة الاستعلام باستخدام المحرك الدلالي ====================
async function processUserQuery(query) {
    console.log("🔍 معالجة السؤال:", query);

    // انتظار المحرك إذا لم يكن جاهزاً بعد
    if (!window.hybridEngineReady) {
        return "⏳ جاري تحميل المحرك الدلالي، يرجى الانتظار قليلاً ثم أعد المحاولة.";
    }

    try {
        // استخدام المحرك الدلالي للبحث
        const searchResult = await window.hybridEngine.search(query, { topK: 3 });

        if (!searchResult.topMatch || searchResult.confidence < 0.2) {
            // لا توجد نتائج كافية
            return generateFallbackResponse(query);
        }

        const top = searchResult.topMatch;
        const dbName = top.dbName; // 'activities', 'areas', 'decision104'
        const data = top.data.original_data;
        const fullResults = searchResult.results;

        // تخزين السياق (باستخدام الذاكرة من agent_memory.js)
        if (dbName === 'activities') {
            await window.AgentMemory.setActivity({ text: data['النشاط_المحدد'] || data['النشاط_الرئيسي'] || data['النشاط'], value: top.id, details: data }, query);
        } else if (dbName === 'areas') {
            await window.AgentMemory.setIndustrial({ name: data['اسم_المنطقة'] || 'منطقة صناعية', ...data }, query);
        } else if (dbName === 'decision104') {
            // لا نحتاج لتخزين سياق خاص للقرار 104 حالياً
        }

        // تنسيق الرد حسب نوع قاعدة البيانات
        if (dbName === 'activities') {
            return formatActivityResponse(data, query);
        } else if (dbName === 'areas') {
            return formatIndustrialResponse(data);
        } else if (dbName === 'decision104') {
            return formatDecision104Response(data, query);
        } else {
            return generateFallbackResponse(query);
        }
    } catch (error) {
        console.error("❌ خطأ في processUserQuery:", error);
        return "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.";
    }
}

// ==================== دوال التنسيق ====================
function formatActivityResponse(data, query) {
    const activityName = data['النشاط_المحدد'] || data['النشاط_الرئيسي'] || data['النشاط'] || 'النشاط';
    const details = data;

    let html = `<div class="activity-card">`;
    html += `<div class="activity-header"><i class="fas fa-clipboard-list"></i> ${activityName}</div>`;

    // التراخيص
    if (details['التراخيص_المطلوبة'] || details['التراخيص']) {
        html += `<div class="info-section"><div class="section-title"><i class="fas fa-file-signature"></i> التراخيص المطلوبة</div>`;
        html += `<div class="section-content">${details['التراخيص_المطلوبة'] || details['التراخيص']}</div></div>`;
    }

    // الجهات المصدرة
    if (details['الجهة_المصدرة'] || details['جهة_الترخيص']) {
        html += `<div class="info-section"><div class="section-title"><i class="fas fa-building"></i> الجهة المصدرة</div>`;
        html += `<div class="section-content">${details['الجهة_المصدرة'] || details['جهة_الترخيص']}</div></div>`;
    }

    // السند التشريعي
    if (details['السند_التشريعي'] || details['القانون']) {
        html += `<div class="info-section"><div class="section-title"><i class="fas fa-gavel"></i> السند التشريعي</div>`;
        html += `<div class="section-content">${details['السند_التشريعي'] || details['القانون']}</div></div>`;
    }

    // ملاحظات فنية
    if (details['ملاحظات_فنية'] || details['ملاحظات']) {
        html += `<div class="info-section"><div class="section-title"><i class="fas fa-tools"></i> ملاحظات فنية</div>`;
        html += `<div class="section-content">${details['ملاحظات_فنية'] || details['ملاحظات']}</div></div>`;
    }

    // القرار 104
    if (details['قرار_104'] !== undefined) {
        const status = details['قرار_104'] ? '✅ وارد بالقرار 104' : '❌ غير وارد بالقرار 104';
        html += `<div class="info-section"><div class="section-title"><i class="fas fa-check-circle"></i> القرار 104</div>`;
        html += `<div class="section-content">${status}</div></div>`;
    }

    html += `</div>`;
    return html;
}

function formatIndustrialResponse(data) {
    const areaName = data['اسم_المنطقة'] || 'منطقة صناعية';
    let html = `<div class="area-card">`;
    html += `<div class="area-header"><i class="fas fa-industry"></i> ${areaName}</div>`;

    if (data['المحافظة']) {
        html += `<div class="info-section"><span class="info-label">المحافظة:</span> ${data['المحافظة']}</div>`;
    }
    if (data['التبعية'] || data['جهة_الولاية']) {
        html += `<div class="info-section"><span class="info-label">جهة الولاية:</span> ${data['التبعية'] || data['جهة_الولاية']}</div>`;
    }
    if (data['المساحة'] || data['area']) {
        html += `<div class="info-section"><span class="info-label">المساحة:</span> ${data['المساحة'] || data['area']} فدان</div>`;
    }
    if (data['قرار_الإنشاء'] || data['decision']) {
        html += `<div class="info-section"><span class="info-label">قرار الإنشاء:</span> ${data['قرار_الإنشاء'] || data['decision']}</div>`;
    }
    if (data['الموقع'] || data['location']) {
        html += `<div class="info-section"><span class="info-label">الموقع:</span> ${data['الموقع'] || data['location']}</div>`;
    }
    if (data['إحداثيات'] || data['coordinates']) {
        html += `<div class="info-section"><span class="info-label">الإحداثيات:</span> ${data['إحداثيات'] || data['coordinates']}</div>`;
    }

    html += `</div>`;
    return html;
}

function formatDecision104Response(data, query) {
    // إذا كان السؤال استفساراً عن نشاط معين في القرار 104
    if (query.includes('104') && (query.includes('هل') || query.includes('وارد'))) {
        const activityName = data['النشاط_المحدد'] || data['النشاط_الرئيسي'] || '';
        const isIncluded = data['قرار_104'] ? '✅ نعم' : '❌ لا';
        return `<div class="decision-card">
            <div class="decision-header"><i class="fas fa-file-contract"></i> القرار 104</div>
            <div class="info-section"><span class="info-label">النشاط:</span> ${activityName}</div>
            <div class="info-section"><span class="info-label">الحالة:</span> ${isIncluded}</div>
        </div>`;
    }

    // عرض عام عن القرار 104
    let html = `<div class="decision-card"><div class="decision-header"><i class="fas fa-file-contract"></i> القرار 104</div>`;
    if (data['الوصف']) html += `<div class="info-section">${data['الوصف']}</div>`;
    if (data['الحوافز']) html += `<div class="info-section"><span class="info-label">الحوافز:</span> ${data['الحوافز']}</div>`;
    html += `</div>`;
    return html;
}

function generateFallbackResponse(query) {
    const q = normalizeArabic(query);
    if (q.length < 3) {
        return `😕 <strong>السؤال قصير جداً</strong><br><br>💡 جرب أن تسأل:<br>• "كم عدد المناطق الصناعية؟"<br>• "ما التراخيص المطلوبة لفندق؟"<br>• "هل نشاط المخابز وارد بالقرار 104؟"`;
    }
    return `😕 <strong>عذراً، لم أجد معلومات عن: "${query}"</strong><br><br>💡 يمكنك إعادة صياغة السؤال أو تجربة كلمات مفتاحية مختلفة.`;
}

// ==================== دوال الواجهة (محافظة على جميع الميزات السابقة) ====================

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
        showGPTNotification('ℹ️ لا يوجد سياق محفوظ حالياً', 'info');
        return;
    }
    const contextName = context.type === 'industrial' ? context.data.name : context.data.text;
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
    document.getElementById('gptMessages').appendChild(confirmBox);
};

window.confirmClearMemory = async function() {
    await window.AgentMemory.clear();
    document.getElementById('memory-confirm-box')?.remove();
    showGPTNotification('✅ تم مسح الذاكرة بنجاح', 'success');
};

window.cancelClearMemory = function() {
    document.getElementById('memory-confirm-box')?.remove();
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

function showGPTNotification(msg, type = 'success') {
    const container = document.getElementById('gptMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.style.cssText = `
        align-self: center;
        background: ${type === 'success' ? '#e8f5e9' : type === 'info' ? '#e3f2fd' : '#fff3e0'};
        color: ${type === 'success' ? '#2e7d32' : type === 'info' ? '#1565c0' : '#e65100'};
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 0.8rem;
        margin: 10px 0;
        border: 1px solid ${type === 'success' ? '#a5d6a7' : type === 'info' ? '#90caf9' : '#ffcc80'};
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
}

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

// ==================== كلمات الإغلاق ====================
window.GPT_AGENT = window.GPT_AGENT || {};
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

// ==================== دوال احتياطية (للتوافق مع الكود القديم) ====================
window.selectIndustrialArea = async function(areaName) {
    // إذا لم يتم العثور على المنطقة عبر المحرك، يمكن استخدام هذه الدالة كاحتياطي
    // لكننا الآن نعتمد على المحرك، لذا يمكن تركها بسيطة
    document.getElementById('gptInput').value = areaName;
    sendMessage();
};

// بدء تشغيل الواجهة
window.addEventListener('load', function() {
    setTimeout(checkInputState, 100);
});

console.log('✅ GPT Agent v10.0 - Hybrid Semantic Edition initialized successfully!');

} // النهاية الشرطية
