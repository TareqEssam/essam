/****************************************************************************
 * 🏆 ResultReranker.js - خوارزمية إعادة الترتيب الذكية
 * 
 * المـــــــــهام:
 * ✅ دمج نتائج المحرك الدلالي والنصي
 * ✅ إعادة ترتيب بناءً على معايير متعددة
 * ✅ تعزيز النتائج بناءً على السياق
 * ✅ الاختيار الأمثل للنتيجة النهائية
 *
 * ⚠️ ملاحظة مقياس النقاط:
 *   - المحرك الدلالي (HybridSearch): يُعطي cosineScore بين [0.0 - 1.0]
 *   - المحرك النصي  (NeuralSearch):  يُعطي finalScore بين [30 - ~20000]
 *   - NEURAL_SCORE_MAX يُستخدم لتطبيع النصي إلى [0-1] قبل الدمج
 *
 * 🔧 تعديلات v1.1:
 *   - إصلاح mergeResults(): توحيد حقل `text` من مصادر مختلفة
 *     المشكلة: النتيجة الفائزة تظهر text=undefined في gpt_activities
 *     السبب:  HybridSearch يضع الاسم في data.text أو data.original_data.text
 *             بينما NeuralSearch يضعه في result.text مباشرة
 *   - إضافة extractText() دالة مساعدة لاستخراج النص من أي هيكل
 ****************************************************************************/

class ResultReranker {
    constructor() {
        // ⚙️ أوزان معايير إعادة الترتيب
        this.weights = {
            semanticScore: 0.40,
            keywordScore: 0.30,
            contextRelevance: 0.20,
            freshness: 0.05,
            userBehavior: 0.05
        };

        this.NEURAL_SCORE_MAX = 20000;
        
        this.stats = {
            totalRerankings: 0,
            semanticWins: 0,
            keywordWins: 0,
            hybridWins: 0
        };
    }

    /**
     * 🔤 [جديد] استخراج النص/الاسم من أي هيكل بيانات
     *
     * المشكلة الأصلية:
     *   - HybridSearch: result.data.text | result.data.original_data.text | result.id
     *   - NeuralSearch: result.text | result.originalData.text
     *   - بعد الدمج في mergeResults: حقل text يضيع لأن الـ spread (...result)
     *     يأخذ الحقول الموجودة مباشرة، لكن text في HybridSearch مدفون داخل data
     *
     * الحل: دالة واحدة تبحث في كل المواقع الممكنة بالترتيب
     *
     * @param {Object} result - كائن النتيجة من أي مصدر
     * @returns {string} النص المستخرج أو سلسلة فارغة
     */
    extractText(result) {
        if (!result) return '';

        // 1. text مباشرة على الكائن (NeuralSearch المعتاد)
        if (result.text && typeof result.text === 'string' && result.text !== 'undefined') {
            return result.text;
        }

        // 2. داخل data.text (HybridSearch بعض الحالات)
        if (result.data?.text && typeof result.data.text === 'string') {
            return result.data.text;
        }

        // 3. داخل data.original_data (HybridSearch - بيانات الأنشطة)
        const od = result.data?.original_data;
        if (od) {
            // أنشطة activity_database
            if (od.text)            return od.text;
            // قرار 104
            if (od.النشاط_المحدد)  return od.النشاط_المحدد;
            if (od.النشاط)         return od.النشاط;
            if (od.activity)       return od.activity;
            // مناطق صناعية
            if (od.name)           return od.name;
            if (od.اسم_المنطقة)   return od.اسم_المنطقة;
        }

        // 4. originalData (NeuralSearch عند إرجاع بيانات كاملة)
        if (result.originalData?.text)   return result.originalData.text;
        if (result.originalData?.name)   return result.originalData.name;

        // 5. الـ id كحل أخير (مقروء للإنسان في كثير من الحالات)
        if (result.id && typeof result.id === 'string') return result.id;

        return '';
    }

    /**
     * 🏆 إعادة الترتيب الرئيسية
     */
    rerank(semanticResults, keywordResults, query, context = null) {
        console.log("🏆 بدء إعادة الترتيب...");
        console.log("  📊 نتائج دلالية:", semanticResults?.length || 0);
        console.log("  📊 نتائج نصية:", keywordResults?.length || 0);
        
        this.stats.totalRerankings++;
        
        const mergedResults = this.mergeResults(semanticResults, keywordResults);
        
        const scoredResults = mergedResults.map(result => {
            const finalScore = this.calculateFinalScore(result, query, context);
            return {
                ...result,
                finalScore,
                scoreBreakdown: result.scoreBreakdown
            };
        });
        
        const sorted = scoredResults.sort((a, b) => b.finalScore - a.finalScore);
        
        this.analyzeWinner(sorted[0]);
        
        console.log("✅ إعادة الترتيب اكتملت - النتيجة الأولى:", {
            id: sorted[0]?.id,
            text: sorted[0]?.text,           // ← نعرض text للتحقق
            score: sorted[0]?.finalScore?.toFixed(3),
            source: sorted[0]?.source,
            breakdown: sorted[0]?.scoreBreakdown
        });
        
        return sorted;
    }
    
    /**
     * 🔀 دمج النتائج من المصدرين
     *
     * [تعديل v1.1]:
     *   - إضافة استخراج text عند إنشاء كل إدخال في الخريطة
     *   - النتيجة: كل كائن مدمج يحتوي على text مضمون وصحيح
     */
    mergeResults(semanticResults = [], keywordResults = []) {
        const resultsMap = new Map();
        
        // إضافة النتائج الدلالية
        semanticResults.forEach((result, index) => {
            const key = result.id ?? result.value ?? `sem_${index}`;
            // ✅ [جديد] استخراج text عند الإنشاء لا عند الاستخدام
            const resolvedText = this.extractText(result);

            resultsMap.set(key, {
                ...result,
                id: key,
                text: resolvedText,                           // ← مضمون دائماً
                semanticScore: result.score || result.cosineScore || 0,
                semanticRank: index + 1,
                keywordScore: 0,
                keywordRank: null,
                source: 'semantic'
            });
        });
        
        // دمج النتائج النصية
        keywordResults.forEach((result, index) => {
            const key = result.id ?? result.value ?? `kw_${index}`;
            const existing = resultsMap.get(key);
            
            if (existing) {
                // النتيجة موجودة في كلا المصدرين (hybrid)
                existing.keywordScore = result.score || result.finalScore || 0;
                existing.keywordRank = index + 1;
                existing.source = 'hybrid';
                // ✅ تحديث text إذا كانت النسخة النصية أوضح
                if (!existing.text || existing.text === existing.id) {
                    const kwText = this.extractText(result);
                    if (kwText) existing.text = kwText;
                }
            } else {
                // نتيجة فقط من المحرك النصي
                const resolvedText = this.extractText(result);
                resultsMap.set(key, {
                    ...result,
                    id: key,
                    text: resolvedText,                       // ← مضمون دائماً
                    semanticScore: 0,
                    semanticRank: null,
                    keywordScore: result.score || result.finalScore || 0,
                    keywordRank: index + 1,
                    source: 'keyword'
                });
            }
        });
        
        return Array.from(resultsMap.values());
    }
    
    /**
     * 📊 حساب النقاط النهائية المركبة
     */
    calculateFinalScore(result, query, context) {
        const breakdown = {
            semantic: 0,
            keyword: 0,
            contextBoost: 0,
            totalRaw: 0
        };
        
        if (result.semanticScore > 0) {
            breakdown.semantic = result.semanticScore * this.weights.semanticScore;
        }
        
        if (result.keywordScore > 0) {
            const isNeuralScore = result.keywordScore > 1;
            const normalizedKeyword = isNeuralScore
                ? Math.min(result.keywordScore / this.NEURAL_SCORE_MAX, 1.0)
                : result.keywordScore;
            breakdown.keyword = normalizedKeyword * this.weights.keywordScore;
        }
        
        if (context && this.isContextRelevant(result, context)) {
            breakdown.contextBoost = 0.15;
            console.log(`  🧠 تعزيز السياق للنتيجة ${result.id}`);
        }
        
        let hybridBonus = 0;
        if (result.source === 'hybrid') {
            hybridBonus = 0.1;
            console.log(`  🔀 مكافأة هجينة للنتيجة ${result.id}`);
        }
        
        breakdown.totalRaw = breakdown.semantic + breakdown.keyword + breakdown.contextBoost + hybridBonus;
        result.scoreBreakdown = breakdown;
        
        return breakdown.totalRaw;
    }
    
    /**
     * 🧠 فحص الصلة بالسياق
     */
    isContextRelevant(result, context) {
        if (!context || !context.data) return false;
        
        const contextData = context.data;
        const resultData = result.data || result.original_data || {};
        
        switch(context.type) {
            case 'activity':
                return resultData['النشاط_المحدد'] === contextData.text ||
                       resultData['الاسم'] === contextData.text ||
                       // ✅ [جديد] فحص text المُوحَّد أيضاً
                       result.text === contextData.text;
                       
            case 'industrial':
                return resultData['اسم_المنطقة'] === contextData.name ||
                       resultData['name'] === contextData.name ||
                       result.text === contextData.name;
                       
            case 'decision104':
                return resultData['النشاط'] === contextData.activity ||
                       result.text === contextData.activity;
                       
            default:
                return false;
        }
    }
    
    /**
     * 📈 تحليل الفائز
     */
    analyzeWinner(winner) {
        if (!winner) return;
        if (winner.source === 'semantic') this.stats.semanticWins++;
        else if (winner.source === 'keyword') this.stats.keywordWins++;
        else if (winner.source === 'hybrid') this.stats.hybridWins++;
    }
    
    /**
     * ⚙️ تحديث الأوزان
     */
    updateWeights(newWeights) {
        this.weights = { ...this.weights, ...newWeights };
        console.log("⚙️ تم تحديث أوزان Reranker:", this.weights);
    }
    
    /**
     * 📊 الحصول على الإحصائيات
     */
    getStats() {
        const total = this.stats.totalRerankings;
        return {
            ...this.stats,
            semanticWinRate: total > 0 ? (this.stats.semanticWins / total * 100).toFixed(1) + '%' : '0%',
            keywordWinRate: total > 0 ? (this.stats.keywordWins / total * 100).toFixed(1) + '%' : '0%',
            hybridWinRate: total > 0 ? (this.stats.hybridWins / total * 100).toFixed(1) + '%' : '0%'
        };
    }
    
    /**
     * 🎯 اختيار النتيجة الأفضل (للاستخدام المباشر)
     */
    selectBest(semanticResults, keywordResults, query, context = null) {
        const reranked = this.rerank(semanticResults, keywordResults, query, context);
        return reranked[0] || null;
    }
}

// ==================== 🌐 التصدير والإتاحة العالمية ====================
if (typeof window !== 'undefined') {
    window.ResultReranker = ResultReranker;
    window.resultReranker = new ResultReranker();
    console.log("✅ ResultReranker v1.1 جاهز — توحيد text + isContextRelevant مُحسَّن");
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResultReranker };
}
