/****************************************************************************
 * 🏆 ResultReranker.js - خوارزمية إعادة الترتيب الذكية
 * 
 * المــهام:
 * ✅ دمج نتائج المحرك الدلالي والنصي
 * ✅ إعادة ترتيب بناءً على معايير متعددة
 * ✅ تعزيز النتائج بناءً على السياق
 * ✅ الاختيار الأمثل للنتيجة النهائية
 ****************************************************************************/

class ResultReranker {
    constructor() {
        // ⚙️ أوزان معايير إعادة الترتيب
        this.weights = {
            semanticScore: 0.40,      // 40% للتشابه الدلالي
            keywordScore: 0.30,        // 30% للمطابقة الكلماتية
            contextRelevance: 0.20,    // 20% للصلة بالسياق
            freshness: 0.05,           // 5% للحداثة
            userBehavior: 0.05         // 5% لسلوك المستخدم
        };
        
        // 📊 إحصائيات
        this.stats = {
            totalRerankings: 0,
            semanticWins: 0,
            keywordWins: 0,
            hybridWins: 0
        };
    }
    
    /**
     * 🏆 إعادة الترتيب الرئيسية
     * @param {Array} semanticResults - نتائج المحرك الدلالي
     * @param {Array} keywordResults - نتائج المحرك النصي
     * @param {String} query - الاستعلام الأصلي
     * @param {Object} context - السياق من الذاكرة
     * @returns {Array} النتائج مرتبة
     */
    rerank(semanticResults, keywordResults, query, context = null) {
        console.log("🏆 بدء إعادة الترتيب...");
        console.log("  📊 نتائج دلالية:", semanticResults?.length || 0);
        console.log("  📊 نتائج نصية:", keywordResults?.length || 0);
        
        this.stats.totalRerankings++;
        
        // 1️⃣ دمج النتائج من المصدرين
        const mergedResults = this.mergeResults(semanticResults, keywordResults);
        
        // 2️⃣ حساب النقاط المركبة لكل نتيجة
        const scoredResults = mergedResults.map(result => {
            const finalScore = this.calculateFinalScore(result, query, context);
            return {
                ...result,
                finalScore,
                scoreBreakdown: result.scoreBreakdown // للشفافية
            };
        });
        
        // 3️⃣ الترتيب النهائي
        const sorted = scoredResults.sort((a, b) => b.finalScore - a.finalScore);
        
        // 4️⃣ تحليل الفائز
        this.analyzeWinner(sorted[0]);
        
        console.log("✅ إعادة الترتيب اكتملت - النتيجة الأولى:", {
            id: sorted[0]?.id,
            score: sorted[0]?.finalScore?.toFixed(3),
            source: sorted[0]?.source
        });
        
        return sorted;
    }
    
    /**
     * 🔀 دمج النتائج من المصدرين
     */
    mergeResults(semanticResults = [], keywordResults = []) {
        const resultsMap = new Map();
        
        // إضافة النتائج الدلالية
        semanticResults.forEach((result, index) => {
            // ✅ توحيد المفتاح: NeuralSearch تستخدم value، HybridSearch تستخدم id
            const key = result.id ?? result.value ?? `sem_${index}`;
            resultsMap.set(key, {
                ...result,
                id: key,
                semanticScore: result.score || result.cosineScore || 0,
                semanticRank: index + 1,
                keywordScore: 0,
                keywordRank: null,
                source: 'semantic'
            });
        });
        
        // دمج النتائج النصية
        keywordResults.forEach((result, index) => {
            // ✅ توحيد المفتاح
            const key = result.id ?? result.value ?? `kw_${index}`;
            const existing = resultsMap.get(key);
            
            if (existing) {
                // النتيجة موجودة في كلا المصدرين (hybrid)
                existing.keywordScore = result.score || result.finalScore || 0;
                existing.keywordRank = index + 1;
                existing.source = 'hybrid';
            } else {
                // نتيجة فقط من المحرك النصي
                resultsMap.set(key, {
                    ...result,
                    id: key,
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
        
        // 1️⃣ النقاط الدلالية (معكوس الترتيب للأهمية)
        if (result.semanticScore > 0) {
            breakdown.semantic = result.semanticScore * this.weights.semanticScore;
        }
        
        // 2️⃣ النقاط الكلماتية
        if (result.keywordScore > 0) {
            breakdown.keyword = result.keywordScore * this.weights.keywordScore;
        }
        
        // 3️⃣ تعزيز السياق
        if (context && this.isContextRelevant(result, context)) {
            breakdown.contextBoost = 0.15; // تعزيز قوي
            console.log(`  🧠 تعزيز السياق للنتيجة ${result.id}`);
        }
        
        // 4️⃣ تعزيز المصادر المختلطة (hybrid)
        let hybridBonus = 0;
        if (result.source === 'hybrid') {
            hybridBonus = 0.1; // مكافأة 10% للنتائج الموجودة في كلا المحركين
            console.log(`  🔀 مكافأة هجينة للنتيجة ${result.id}`);
        }
        
        // الحساب النهائي
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
        
        // فحص التطابق بناءً على نوع السياق
        switch(context.type) {
            case 'activity':
                return resultData['النشاط_المحدد'] === contextData.text ||
                       resultData['الاسم'] === contextData.text;
                       
            case 'industrial':
                return resultData['اسم_المنطقة'] === contextData.name ||
                       resultData['name'] === contextData.name;
                       
            case 'decision104':
                return resultData['النشاط'] === contextData.activity;
                       
            default:
                return false;
        }
    }
    
    /**
     * 📈 تحليل الفائز
     */
    analyzeWinner(winner) {
        if (!winner) return;
        
        if (winner.source === 'semantic') {
            this.stats.semanticWins++;
        } else if (winner.source === 'keyword') {
            this.stats.keywordWins++;
        } else if (winner.source === 'hybrid') {
            this.stats.hybridWins++;
        }
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
    console.log("✅ ResultReranker جاهز للخدمة");
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResultReranker };
}
