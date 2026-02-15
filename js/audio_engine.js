/****************************************************************************
 * 🎙️ VOICE AGENT MODULE - v1.0
 ****************************************************************************/

// تهيئة كائن الصوت العالمي لربط الملفات
window.GPT_VOICE = window.GPT_VOICE || {};

// المتغيرات التي تم استخراجها من الملف الأصلي
window.GPT_VOICE.isListening = false;
window.GPT_VOICE.speechEnabled = true;
window.GPT_VOICE.speechRecognition = null;

// دالة تنظيف النص - منقولة من gpt_agent.js
window.GPT_VOICE.cleanTextForSpeech = function(text) {
    if (!text) return '';
    let cleaned = text.replace(/<[^>]*>/g, ' ');
    cleaned = cleaned.replace(/[*•·→←↑↓↔↕↨©®™¶§∞≈≠≤≥±√∆∂∑∏∫Ωωαβγδεζηθικλμνξοπρστυφχψως]/g, ' ');
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, 'رابط ');
    cleaned = cleaned.replace(/www\.[^\s]+/g, 'موقع ');
    cleaned = cleaned.replace(/[^\s]+@[^\s]+\.[^\s]+/g, 'بريد إلكتروني ');
    cleaned = cleaned.replace(/\d{10,}/g, 'رقم ');
    cleaned = cleaned.replace(/✅/g, 'نعم ');
    cleaned = cleaned.replace(/❌/g, 'لا ');
    cleaned = cleaned.replace(/⚠️/g, 'انتباه ');
    cleaned = cleaned.replace(/🎯/g, 'هدف ');
    cleaned = cleaned.replace(/🔍/g, 'بحث ');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
};


// 1. دالة تهيئة نظام التعرف على الكلام - منقولة لملف الصوت
window.GPT_VOICE.initSpeechRecognition = function() {
    if ('webkitSpeechRecognition' in window) {
        window.GPT_VOICE.speechRecognition = new webkitSpeechRecognition();
        const recognition = window.GPT_VOICE.speechRecognition;
        
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'ar-SA';
        
        recognition.onstart = function() {
            window.GPT_VOICE.isListening = true;
            document.getElementById('gptMicBtn').classList.add('listening');
            document.getElementById('voiceWave').style.display = 'flex';
            document.getElementById('voiceText').style.display = 'block';
            document.getElementById('voiceText').textContent = '🎤 أتكلم الآن...';
        };
        
        recognition.onresult = function(event) {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript;
            
            document.getElementById('voiceText').textContent = `🎤: ${transcript}`;
            document.getElementById('voiceText').style.display = 'block';

            // سيتم نقل هذه الدوال (الإغلاق الذكي) في الخطوات القادمة
            if (window.checkForGPTCloseIntent && window.checkForGPTCloseIntent(transcript)) {
                if (window.gptGracefulClose) window.gptGracefulClose();
                return;
            }
            
            if (result.isFinal) {
                window.GPT_VOICE.autoSendAfterSpeech(transcript);
            }
        };
        
        recognition.onerror = function(event) {
            console.log('خطأ في التعرف:', event.error);
            if (window.GPT_VOICE.stopListening) window.GPT_VOICE.stopListening();
        };
        
        recognition.onend = function() {
            if (window.GPT_VOICE.stopListening) window.GPT_VOICE.stopListening();
        };
    } else {
        console.log('المتصفح لا يدعم التعرف على الكلام');
        const micBtn = document.getElementById('gptMicBtn');
        if (micBtn) micBtn.disabled = true;
    }
};

// 2. دالة إرسال الرسالة تلقائياً بعد التحدث - منقولة لملف الصوت
window.GPT_VOICE.autoSendAfterSpeech = function(transcript) {
    const input = document.getElementById('gptInput');
    if (!input) return;

    input.value = transcript;
    
    // استدعاء دالة التوسع التي تركناها في الملف الأصلي
    if (window.autoResize) window.autoResize(input);
    // استدعاء دالة تحديث الزر التي تركناها في الملف الأصلي
    if (window.updateSendButton) window.updateSendButton();
    
    document.getElementById('voiceText').textContent = `📝: ${transcript}`;
    document.getElementById('voiceText').style.display = 'block';
    
    setTimeout(() => {
        const wave = document.getElementById('voiceWave');
        const vText = document.getElementById('voiceText');
        if (wave) wave.style.display = 'none';
        if (vText) vText.style.display = 'none';
        
        if (transcript.trim().length > 0 && window.sendMessage) {
            window.sendMessage();
        }
    }, 2000);
};


// 3. دالة تشغيل/إيقاف المايكروفون - منقولة لملف الصوت
window.GPT_VOICE.toggleMicrophone = function() {
    // إيقاف أي نطق جاري قبل البدء بالاستماع
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    // التأكد من تهيئة المحرك
    if (!window.GPT_VOICE.speechRecognition) {
        window.GPT_VOICE.initSpeechRecognition();
    }
    
    if (window.GPT_VOICE.isListening) {
        window.GPT_VOICE.stopListening();
    } else {
        try {
            window.GPT_VOICE.speechRecognition.start();
        } catch (e) {
            console.error("Error starting speech recognition:", e);
        }
    }
};

// 4. دالة إيقاف الاستماع وتنظيف الواجهة - منقولة لملف الصوت
window.GPT_VOICE.stopListening = function() {
    if (window.GPT_VOICE.speechRecognition && window.GPT_VOICE.isListening) {
        window.GPT_VOICE.speechRecognition.stop();
        window.GPT_VOICE.isListening = false;
        
        const micBtn = document.getElementById('gptMicBtn');
        const wave = document.getElementById('voiceWave');
        const vText = document.getElementById('voiceText');
        
        if (micBtn) micBtn.classList.remove('listening');
        if (wave) wave.style.display = 'none';
        
        setTimeout(() => {
            if (vText) vText.style.display = 'none';
        }, 2000);
    }
};

// 5. دالة تحويل الأرقام إلى كلمات عربية - منقولة لملف الصوت
window.GPT_VOICE.convertNumbersToArabicWords = function(text) {
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    
    const convert = (num) => {
        if (num === 0) return 'صفر';
        if (num < 0) return 'سالب ' + convert(-num);
        let result = '';
        if (num >= 1000) {
            const thousands = Math.floor(num / 1000);
            if (thousands === 1) result += 'ألف';
            else if (thousands === 2) result += 'ألفان';
            else if (thousands <= 10) result += convert(thousands) + ' آلاف';
            else result += convert(thousands) + ' ألف';
            num %= 1000;
            if (num > 0) result += ' و';
        }
        if (num >= 100) {
            result += hundreds[Math.floor(num / 100)];
            num %= 100;
            if (num > 0) result += ' و';
        }
        if (num >= 20) {
            result += tens[Math.floor(num / 10)];
            num %= 10;
            if (num > 0) result += ' و';
        } else if (num >= 10) {
            result += teens[num - 10];
            return result;
        }
        if (num > 0) result += ones[num];
        return result;
    };
    
    return text.replace(/\d+/g, (match) => {
        const num = parseInt(match);
        return num <= 999999 ? convert(num) : match;
    });
};

// 6. دالة تحسين النص للنطق المصري - (نسخة محسنة لمنع نطق كلمة نقطة)
window.GPT_VOICE.improveTextForEgyptianSpeech = function(text) {
    let improved = window.GPT_VOICE.convertNumbersToArabicWords(text);
    
    const replacements = {
        'القرار رقم': 'القرار',
        'القانون رقم': 'القانون',
        'المادة رقم': 'المادة',
        // بدلاً من إضافة مسافة بعد النقطة، سنقوم باستبدالها بوقفة قصيرة جداً لا تُنطق
        '\\.': ' ، ', 
        '،': ' ، ',
        ':': ' : ',
        'ش.م.م': 'شركة ذات مسؤولية محدودة',
        'م.م': 'مسؤولية محدودة',
        'متر2': 'متر مربع',
        'م2': 'متر مربع',
        'كم': 'كيلومتر'
    };

    for (const [old, replacement] of Object.entries(replacements)) {
        improved = improved.replace(new RegExp(old, 'g'), replacement);
    }
    
    // إزالة أي نقاط متكررة قد تسبب نطق كلمة "نقطة"
    improved = improved.replace(/\.{2,}/g, ' '); 
    
    return improved;
};


// 7. جلب الأصوات العربية
window.getAvailableArabicVoicesGPT = function() {
    return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('ar'));
};

// 8. اختيار أفضل صوت متاح تلقائياً
window.getBestArabicVoice = function() {
    const voices = window.speechSynthesis.getVoices();
    const savedVoice = localStorage.getItem('preferred_arabic_voice_gpt');
    let arVoice = savedVoice ? voices.find(v => v.name === savedVoice) : null;
    
    if (!arVoice) {
        arVoice = voices.find(v => v.lang === 'ar-EG') || 
                 voices.find(v => v.lang === 'ar-SA' && v.name.includes('Google')) ||
                 voices.find(v => v.lang.startsWith('ar'));
    }
    return arVoice;
};

// 9. فتح نافذة اختيار الأصوات
window.showGPTVoiceSelector = function() {
    const voices = window.getAvailableArabicVoicesGPT();
    if (voices.length === 0) { alert('لا توجد أصوات عربية.'); return; }
    
    const currentVoice = localStorage.getItem('preferred_arabic_voice_gpt') || 'تلقائي';
    const overlay = document.createElement('div');
    overlay.id = 'gpt-voice-overlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); z-index:9999999; display:flex; align-items:center; justify-content:center; padding:20px;';
    
    overlay.innerHTML = `
        <div style="background:white; border-radius:20px; max-width:600px; width:100%; overflow:hidden;">
            <div style="background:linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); color:white; padding:20px; display:flex; justify-content:space-between;">
                <h5 style="margin:0;">اختر الصوت المفضل</h5>
                <button onclick="closeGPTVoiceSelector()" style="background:none; border:none; color:white; cursor:pointer;">&times;</button>
            </div>
            <div style="padding:20px; max-height:60vh; overflow-y:auto;">
                ${voices.map(voice => `
                    <div class="gpt-voice-option" onclick="selectGPTVoice('${voice.name}', this)" 
                         style="margin-bottom:10px; padding:15px; border:2px solid ${voice.name === currentVoice ? '#0d6efd' : '#ddd'}; border-radius:10px; cursor:pointer; display:flex; justify-content:space-between;">
                        <span>${voice.name} (${voice.lang})</span>
                        <button onclick="event.stopPropagation(); testGPTVoice('${voice.name}')">تجربة</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
};

// 10. حفظ الصوت المختار
window.selectGPTVoice = function(voiceName, element) {
    localStorage.setItem('preferred_arabic_voice_gpt', voiceName);
    document.querySelectorAll('.gpt-voice-option').forEach(opt => {
        opt.style.borderColor = '#ddd'; opt.style.background = 'white';
    });
    element.style.borderColor = '#0d6efd'; element.style.background = '#e7f3ff';
    window.showGPTNotification('✓ تم الحفظ');
};

// 11. تجربة الصوت
window.testGPTVoice = function(voiceName) {
    const voice = window.speechSynthesis.getVoices().find(v => v.name === voiceName);
    if (!voice) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('مرحباً، أنا المساعد الذكي');
    utterance.voice = voice;
    utterance.lang = voice.lang;
    window.speechSynthesis.speak(utterance);
};

// 12. إغلاق النافذة
window.closeGPTVoiceSelector = function() {
    const overlay = document.getElementById('gpt-voice-overlay');
    if (overlay) overlay.remove();
};

// 13. إشعار بسيط
window.showGPTNotification = function(msg) {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#28a745; color:white; padding:12px; border-radius:8px; z-index:10000000;';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
};


// 14. تشغيل/إيقاف نطق الردود
window.toggleSpeech = function() {
    window.GPT_VOICE.speechEnabled = !window.GPT_VOICE.speechEnabled;
    const speakerBtn = document.getElementById('gptSpeakerBtn');
    
    if (window.GPT_VOICE.speechEnabled) {
        if (speakerBtn) {
            speakerBtn.classList.remove('muted');
            speakerBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        const lastMsg = document.querySelector('.message-row.ai:last-child .message-bubble');
        if (lastMsg) window.speakText(lastMsg.textContent);
    } else {
        if (speakerBtn) {
            speakerBtn.classList.add('muted');
            speakerBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
        window.speechSynthesis.cancel();
    }
};

// 15. كلمات الإغلاق
window.GPT_VOICE.closeKeywords = ['شكرا', 'شكراً', 'باي', 'مع السلامة', 'إغلاق', 'كفاية', 'خلاص', 'انتهيت'];

window.checkForGPTCloseIntent = function(text) {
    const q = text.toLowerCase().trim();
    return window.GPT_VOICE.closeKeywords.some(k => q.includes(k));
};

// 16. الإغلاق التدريجي
window.gptGracefulClose = async function() {
    const msgs = ['تشرفنا بخدمتك.', 'في أمان الله.', 'سعدنا بمساعدتك.'];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    
    if (window.GPT_VOICE.speechEnabled) {
        setTimeout(() => window.speakText(msg), 150);
    }
    
    setTimeout(() => {
        const chat = document.getElementById('gptChatContainer');
        if (chat) chat.style.display = 'none';
    }, 3000);
};

// 17. المحرك الرئيسي للنطق - (نسخة الحماية من نطق الرموز)
window.speakText = function(text) {
    if (!window.GPT_VOICE.speechEnabled || !text || text.length < 2) return;
    
    // تنظيف شامل: إزالة أي رموز غير عربية وأي نقاط متبقية قبل النطق
    // نترك الفواصل فقط لأن المحرك يفهمها كوقفات صمت
    let clean = text.replace(/<[^>]*>/g, ' '); // إزالة الـ HTML
    clean = clean.replace(/[^\u0600-\u06FF\s\d،؟]/g, ' '); // حذف النقاط والرموز والابقاء على العربي والأرقام والفواصل
    clean = clean.replace(/\s+/g, ' ').trim(); // تنظيف المسافات
    
    if (clean.length < 2) return;

    window.speechSynthesis.cancel();
    
    // تحسين النص نهائياً قبل النطق
    const finalText = window.GPT_VOICE.improveTextForEgyptianSpeech(clean);
    
    const utterance = new SpeechSynthesisUtterance(finalText);
    const voice = window.getBestArabicVoice();
    
    if (voice) {
        utterance.voice = voice;
    }
    
    utterance.lang = 'ar-EG';
    utterance.rate = 0.95; // سرعة هادئة
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
        const btn = document.getElementById('gptSpeakerBtn');
        if (btn) btn.classList.add('muted');
    };
    
    utterance.onend = () => {
        const btn = document.getElementById('gptSpeakerBtn');
        if (btn) btn.classList.remove('muted');
    };

    window.speechSynthesis.speak(utterance);
};

// 18. ربط أزرار الواجهة بالدوال الجديدة في ملف الصوت
document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('gptMicBtn');
    const speakerBtn = document.getElementById('gptSpeakerBtn');
    
    if (micBtn) micBtn.onclick = () => window.GPT_VOICE.toggleMicrophone();
    if (speakerBtn) speakerBtn.onclick = () => window.toggleSpeech();
});

// 19. قراءة الردود تلقائياً
window.autoSpeakResponse = function() {
    setTimeout(() => {
        if (window.GPT_VOICE.speechEnabled) {
            const lastResponse = document.querySelector('.message-row.ai:last-child .message-bubble');
            if (lastResponse) window.speakText(lastResponse.textContent);
        }
    }, 500);
};

// إيقاف الصوت عند إرسال رسالة جديدة (Override)
const originalSendMessage = window.sendMessage;
window.sendMessage = function() {
    window.speechSynthesis.cancel();
    if (originalSendMessage) return originalSendMessage.apply(this, arguments);
};
