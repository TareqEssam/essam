// gpt_hybrid_addon.js
/****************************************************************************
 * 🚀 النظام الهجين - إضافة للنظام الأصلي
 * 
 * يُحمّل هذا الملف بعد gpt_agent.js الأصلي
 * يضيف:
 * ✓ المحرك الدلالي (E5)
 * ✓ نافذة التحميل
 * ✓ كشف الأسئلة المتتابعة المحسّن
 * ✓ دمج ذكي للنتائج
 * 
 * ⚠️ لا يستبدل النظام الأصلي - فقط يضيف ميزات
 ****************************************************************************/

console.log('🔄 تحميل الإضافة الهجينة...');

// ==================== نافذة التحميل ====================
const loadingHTML = `
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
`;

if (!document.getElementById('modelLoadingOverlay')) {
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

// ==================== CSS للنافذة ====================
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    .model-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
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
    }

    .loading-status {
        font-size: 0.9rem;
        opacity: 0.8;
        font-weight: 500;
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
`;
document.head.appendChild(loadingStyle);

// ==================== مدير المحرك الهجين ====================
window.HybridEngineManager = {
    isSemanticReady: false,
    semanticEngine: null,
    firstLoadComplete: false,
    
    checkFirstLoadStatus: function() {
        try {
            const status = localStorage.getItem('hybrid-engine-loaded');
            this.firstLoadComplete = (status === 'true');
            return this.firstLoadComplete;
        } catch (e) {
            return false;
        }
    },
    
    saveFirstLoadStatus: function() {
        try {
            localStorage.setItem('hybrid-engine-loaded', 'true');
            this.firstLoadComplete = true;
        } catch (e) {
            console.warn('⚠️ لا يمكن حفظ حالة التحميل');
        }
    },
    
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
            
            if (typeof hybridEngine === 'undefined' && typeof window.hybridEngine === 'undefined') {
                const module = await import('./HybridSearchV1.js');
                this.semanticEngine = module.hybridEngine;
                window.hybridEngine = module.hybridEngine;
            } else {
                this.semanticEngine = window.hybridEngine || hybridEngine;
            }
            
            this.updateLoadingStatus('تهيئة النموذج الدلالي...', 30);
            await this.semanticEngine.initialize();
            
            this.updateLoadingStatus('اكتمل التحميل! ✅', 100);
            this.isSemanticReady = true;
            
            if (isFirstTime) {
                this.saveFirstLoadStatus();
            }
            
            setTimeout(() => {
                this.hideLoadingOverlay();
            }, 1000);
            
            console.log('✅ المحرك الدلالي جاهز للعمل');
            return true;
            
        } catch (error) {
            console.error('❌ فشل تحميل المحرك الدلالي:', error);
            this.updateLoadingStatus('حدث خطأ - سيعمل النظام بالوضع النصي', 0);
            setTimeout(() => this.hideLoadingOverlay(), 2000);
            return false;
        }
    },
    
    hybridSearch: async function(query, options = {}) {
        const results = {
            semantic: null,
            text: null,
            merged: null,
            mode: 'unknown'
        };
        
        // 1. البحث الدلالي
        if (this.isSemanticReady && this.semanticEngine) {
            try {
                console.log('🔍 البحث الدلالي...');
                results.semantic = await this.semanticEngine.search(query, options);
                results.mode = 'semantic';
            } catch (error) {
                console.warn('⚠️ فشل البحث الدلالي:', error);
            }
        }
        
        // 2. البحث النصي
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
        results.merged = this.mergeResults(results.semantic, results.text, query);
        
        if (results.semantic && results.text) {
            results.mode = 'hybrid';
        }
        
        console.log(`✅ وضع البحث: ${results.mode}`);
        return results;
    },
    
    mergeResults: function(semanticResults, textResults, originalQuery) {
        if (!semanticResults && !textResults) return null;
        if (!semanticResults) return textResults;
        if (!textResults) return this.convertSemanticToStandard(semanticResults);
        
        const merged = {
            results: [],
            confidence: 0,
            sources: { semantic: true, text: true }
        };
        
        // إضافة النتائج الدلالية
        if (semanticResults.results && semanticResults.results.length > 0) {
            semanticResults.results.forEach((item, index) => {
                if (index < 3) { // أول 3 نتائج فقط
                    merged.results.push({
                        ...this.convertSemanticItem(item),
                        source: 'semantic',
                        semanticScore: item.cosineScore || 0,
                        semanticRank: index + 1
                    });
                }
            });
            merged.confidence = Math.max(merged.confidence, semanticResults.confidence || 0);
        }
        
        // إضافة النتائج النصية
        if (textResults.results && textResults.results.length > 0) {
            textResults.results.forEach((item, index) => {
                if (index < 3) { // أول 3 نتائج فقط
                    const isDuplicate = merged.results.some(r => 
                        this.isSameItem(r, item)
                    );
                    
                    if (!isDuplicate) {
                        merged.results.push({
                            ...item,
                            source: 'text',
                            textScore: item.finalScore || 0,
                            textRank: index + 1
                        });
                    } else {
                        // تحديث النتيجة الموجودة
                        const existingIndex = merged.results.findIndex(r => 
                            this.isSameItem(r, item)
                        );
                        if (existingIndex !== -1) {
                            merged.results[existingIndex].source = 'hybrid';
                            merged.results[existingIndex].textScore = item.finalScore || 0;
                            merged.results[existingIndex].textRank = index + 1;
                        }
                    }
                }
            });
        }
        
        // ترتيب حسب الثقة المجمعة
        merged.results.sort((a, b) => {
            const scoreA = (a.semanticScore || 0) * 0.6 + ((a.textScore || 0) / 1000) * 0.4;
            const scoreB = (b.semanticScore || 0) * 0.6 + ((b.textScore || 0) / 1000) * 0.4;
            return scoreB - scoreA;
        });
        
        // الاحتفاظ بأفضل 5 نتائج فقط
        merged.results = merged.results.slice(0, 5);
        
        return merged;
    },
    
    convertSemanticItem: function(item) {
        const data = item.data?.original_data || {};
        return {
            text: item.data?.text || data["الاسم"] || data["اسم_المنطقة"] || "غير محدد",
            value: item.id,
            finalScore: (item.cosineScore || 0) * 1000,
            originalData: data,
            ...data
        };
    },
    
    convertSemanticToStandard: function(semanticResults) {
        if (!semanticResults || !semanticResults.results) return null;
        
        return {
            results: semanticResults.results.map(item => this.convertSemanticItem(item)),
            confidence: semanticResults.confidence || 0
        };
    },
    
    isSameItem: function(item1, item2) {
        // مقارنة بالـ ID
        if (item1.value && item2.value && item1.value === item2.value) return true;
        
        // مقارنة بالنص
        const text1 = normalizeArabic(item1.text || item1["الاسم"] || item1["اسم_المنطقة"] || "");
        const text2 = normalizeArabic(item2.text || item2["الاسم"] || item2["اسم_المنطقة"] || "");
        
        if (text1 && text2 && text1 === text2) return true;
        
        // مقارنة تقريبية
        if (text1 && text2) {
            const words1 = text1.split(/\s+/).filter(w => w.length > 3);
            const words2 = text2.split(/\s+/).filter(w => w.length > 3);
            
            if (words1.length > 0 && words2.length > 0) {
                const commonWords = words1.filter(w => words2.includes(w));
                const similarity = commonWords.length / Math.max(words1.length, words2.length);
                if (similarity > 0.6) return true;
            }
        }
        
        return false;
    },
    
    detectDatabase: function(query) {
        const q = normalizeArabic(query);
        
        if (q.includes('قرار') && q.includes('104')) return 'decision104';
        if (q.match(/(منطق|مدين|صناعي|فدان|متر)/)) return 'areas';
        return 'activities';
    },
    
    getDatabase: function(dbName) {
        switch(dbName) {
            case 'activities': return window.masterActivityDB;
            case 'areas': return window.industrialZonesDB;
            case 'decision104': return window.decision104DB;
            default: return window.masterActivityDB;
        }
    }
};

// ==================== تحسين sendMessage الأصلي ====================
const originalSendMessage = window.sendMessage;

window.sendMessage = async function() {
    const input = document.getElementById('gptInput');
    let query = input.value.trim();
    
    if (!query) return;
    
    // إضافة رسالة المستخدم
    addUserMessage(query);
    input.value = "";
    if (window.autoResize) window.autoResize(input);
    if (window.checkInputState) window.checkInputState();
    
    // تحميل المحرك الدلالي إذا لم يكن محمّلاً
    if (!window.HybridEngineManager.isSemanticReady) {
        await window.HybridEngineManager.initSemanticEngine(true);
    }
    
    const typingId = showTypingIndicator();
    
    try {
        // استخدام المعالج الأصلي
        const response = await processUserQuery(query);
        
        removeTypingIndicator(typingId);
        
        if (response) {
            typeWriterResponse(response, true);
        } else {
            typeWriterResponse(window.generateDefaultResponse(query), true);
        }
        
    } catch (error) {
        console.error('❌ خطأ في المعالجة:', error);
        removeTypingIndicator(typingId);
        typeWriterResponse('⚠️ حدث خطأ في المعالجة. يرجى المحاولة مرة أخرى.', true);
    }
};

// ==================== تحسين processUserQuery ====================
const originalProcessUserQuery = window.processUserQuery;

window.processUserQuery = async function(query) {
    // محاولة البحث الهجين أولاً
    try {
        const hybridResults = await window.HybridEngineManager.hybridSearch(query, {
            topK: 5
        });
        
        // إذا كانت النتائج الهجينة جيدة، استخدمها كمساعد
        if (hybridResults.merged && hybridResults.merged.results.length > 0) {
            const topResult = hybridResults.merged.results[0];
            
            // حفظ النتيجة في الذاكرة لاستخدامها لاحقاً
            window._lastHybridResult = {
                result: topResult,
                mode: hybridResults.mode,
                allResults: hybridResults.merged.results
            };
        }
    } catch (error) {
        console.warn('⚠️ فشل البحث الهجين، استخدام النظام الأصلي:', error);
    }
    
    // استدعاء المعالج الأصلي
    if (originalProcessUserQuery) {
        return await originalProcessUserQuery(query);
    }
    
    // إذا لم يكن هناك معالج أصلي، استخدم النتيجة الهجينة
    if (window._lastHybridResult) {
        const { result, mode } = window._lastHybridResult;
        return formatGenericResponse(result, mode);
    }
    
    return null;
};

// ==================== دالة تنسيق عامة ====================
function formatGenericResponse(result, mode) {
    const modeIcon = mode === 'hybrid' ? '🔄' : 
                    mode === 'semantic' ? '🧠' : '📝';
    const modeName = mode === 'hybrid' ? 'هجين (دلالي + نصي)' :
                    mode === 'semantic' ? 'بحث دلالي' : 'بحث نصي';
    
    let html = `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; font-size: 0.85rem;">
        ${modeIcon} <strong>المصدر:</strong> ${modeName}
    </div>`;
    
    // عرض اسم العنصر
    const mainName = result["الاسم"] || result["اسم_المنطقة"] || result.text || "غير محدد";
    html += `<strong>📋 ${mainName}</strong><br><br>`;
    
    // عرض المعلومات الإضافية
    const fields = [
        { key: "القطاع_العام", label: "🏢 القطاع" },
        { key: "النشاط_الرئيسي", label: "📊 النشاط الرئيسي" },
        { key: "جهة_الولاية", label: "🏛️ جهة الولاية" },
        { key: "المحافظة", label: "📍 المحافظة" },
        { key: "التبعية", label: "🔗 التبعية" },
        { key: "المساحة_الكلية", label: "📏 المساحة" },
        { key: "الجهة_المانحة", label: "🎯 الجهة المانحة" }
    ];
    
    fields.forEach(field => {
        if (result[field.key]) {
            html += `<strong>${field.label}:</strong> ${result[field.key]}<br>`;
        }
    });
    
    return html;
}

// ==================== تحميل المحرك عند أول فتح للمساعد ====================
const originalToggleGPTChat = window.toggleGPTChat;

window.toggleGPTChat = function() {
    if (originalToggleGPTChat) {
        originalToggleGPTChat();
    }
    
    const container = document.getElementById('gptChatContainer');
    if (container && container.style.display !== 'none') {
        // المساعد مفتوح - حمّل المحرك إذا لم يكن محمّلاً
        if (!window.HybridEngineManager.isSemanticReady && !window.HybridEngineManager.checkFirstLoadStatus()) {
            setTimeout(() => {
                window.HybridEngineManager.initSemanticEngine(true);
            }, 500);
        }
    }
};

// ==================== رسالة ترحيبية محسّنة ====================
window.addEventListener('load', function() {
    setTimeout(() => {
        if (window.HybridEngineManager.checkFirstLoadStatus()) {
            console.log('✅ النظام الهجين جاهز (محمّل مسبقاً)');
        } else {
            console.log('⏳ النظام الهجين سيُحمّل عند أول استخدام');
        }
    }, 1000);
});

console.log('✅ الإضافة الهجينة جاهزة!');
console.log('🎯 الميزات: محرك دلالي + نافذة تحميل + دمج ذكي');
console.log('📝 النظام الأصلي محفوظ بالكامل');
