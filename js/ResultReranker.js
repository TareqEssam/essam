/****************************************************************************
 * 🏆 ResultReranker.js - خــــوارزمية إعادة الترتيب الذكية
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
 *   - إضافة extractText() دالة مساعدة لاستخراج النص من أي هيكل
 *
 * 🔧 تعديلات v1.2:
 *   - إضافة normalizeArabic(): تطبيع النص العربي قبل المقارنة
 *   - إضافة getQueryTokens(): تقطيع الاستعلام إلى رموز مُطبَّعة
 *   - إضافة applyQueryOverlapPenalty(): 
 *       المشكلة: "تربية الدواجن" كانت تتصدر على "تربية أسماك" لأن BM25 يُكافئ
 *                كلمة "تربية" المشتركة ويتجاهل كلمة "أسماك" الغائبة عن النتيجة.
 *       الحل:   نحسب نسبة كلمات الاستعلام الموجودة في نص النتيجة، فإذا كانت
 *               نسبة التغطية منخفضة نطبق عقوبة على الدرجة النهائية.
 *   - تعديل calculateFinalScore(): استدعاء العقوبة بعد حساب الدرجة الخام
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

    // =========================================================================
    // 🆕 v1.2 — تطبيع النص العربي (نفس منطق x.py و test_engine.py)
    // =========================================================================

    /**
     * تطبيع النص العربي: توحيد الألف والياء والتاء المربوطة
     * نفس الخوارزمية المستخدمة في Python حتى تتطابق المقارنات
     *
     * @param {string} text
     * @returns {string}
     */
    normalizeArabic(text) {
        if (!text || typeof text !== 'string') return '';
        return text
            .replace(/[إأآ]/g, 'ا')
            .replace(/ى/g,  'ي')
            .replace(/ة/g,  'ه')
            .replace(/ؤ/g,  'و')
            .replace(/ئ/g,  'ي')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    /**
     * تقطيع الاستعلام إلى مجموعة رموز مُطبَّعة
     * نُزيل الكلمات الوقفية القصيرة (أقل من 3 حروف) لتجنب التطابق الزائف
     * مثال: "تربية أسماك" → Set{'تربيه', 'اسماك'}
     *
     * @param {string} query
     * @returns {Set<string>}
     */
    getQueryTokens(query) {
        const STOP_WORDS = new Set(['من', 'في', 'على', 'إلى', 'الى', 'عن', 'مع',
                                     'هل', 'ما', 'هو', 'هي', 'ان', 'أن', 'و',
                                     'ال', 'لا', 'لم', 'لن', 'قد', 'كل']);
        const normalized = this.normalizeArabic(query);
        const tokens = normalized.split(' ').filter(t => t.length >= 3 && !STOP_WORDS.has(t));
        return new Set(tokens);
    }

    /**
     * 🗂️ قاموس المرادفات الدلالية لمجال الاستثمار المصري
     *
     * المشكلة التي يحلها:
     *   الباحث يكتب "أسماك" لكن قاعدة البيانات تستخدم "سمكي / سمكية / استزراع سمكي"
     *   الـ stemming البسيط (أول 4 حروف) يفشل لأن:
     *     "اسماك" → stem "اسما" ≠ "سمك" (جذر الكلمة الحقيقي)
     *
     * الحل: كل مدخل في القاموس = كلمة المستخدم → Set من الكلمات المقبولة في قاعدة البيانات
     *   عند البحث عن "اسماك"، نبحث فعلياً عن أي من: اسماك، سمك، سمكي، سمكيه، مزارع
     *
     * قواعد إضافة مدخلات جديدة:
     *   - المفتاح: الكلمة كما يكتبها المستخدم (بعد التطبيع)
     *   - القيمة: Set يضم المفتاح نفسه + كل مشتقاته في قاعدة البيانات (بعد التطبيع)
     */
    getSynonymMap() {
        return {
            // ── أسماك وثروة مائية ──────────────────────────────
            'اسماك':    new Set(['اسماك',  'سمك',  'سمكي',  'سمكيه',  'مزارع',  'استزراع', 'بحريه', 'اقفاص']),
            'سمك':      new Set(['سمك',    'سمكي', 'سمكيه', 'اسماك',  'استزراع','مزارع']),
            'سمكي':     new Set(['سمكي',   'سمك',  'اسماك', 'سمكيه',  'استزراع','مزارع']),
            'استزراع':  new Set(['استزراع','زراعه','زراعي', 'سمك',    'سمكي',   'مزارع']),
            'مزارع':    new Set(['مزارع',  'مزرعه','استزراع','سمك',   'سمكي',   'زراعه']),

            // ── دواجن وطيور ────────────────────────────────────
            'دجاج':     new Set(['دجاج', 'دواجن', 'طيور', 'فراخ', 'تربيه']),
            'دواجن':    new Set(['دواجن','دجاج',  'طيور', 'فراخ', 'تربيه']),
            'طيور':     new Set(['طيور', 'دواجن', 'دجاج', 'تربيه']),

            // ── ثروة حيوانية ────────────────────────────────────
            'حيوانات':  new Set(['حيوانات','حيوان','ماشيه','مواشي','البان','سلالات']),
            'مواشي':    new Set(['مواشي',  'ماشيه','حيوانات','حيوان','الالبان']),
            'الالبان':  new Set(['الالبان','لبن',  'ماشيه', 'حيوانات']),

            // ── زراعة ───────────────────────────────────────────
            'زراعه':    new Set(['زراعه', 'زراعي','محاصيل','استزراع','استصلاح','اراضي']),
            'زراعي':    new Set(['زراعي', 'زراعه','محاصيل','استصلاح']),
            'محاصيل':   new Set(['محاصيل','زراعه','زراعي','نباتات','خضروات','فاكهه']),

            // ── تصنيع ───────────────────────────────────────────
            'مصنع':     new Set(['مصنع', 'مصانع','تصنيع','انتاج','صناعه']),
            'مصانع':    new Set(['مصانع','مصنع', 'تصنيع','صناعه']),
            'تصنيع':    new Set(['تصنيع','مصنع', 'مصانع','انتاج','تحويل']),

            // ── مناطق صناعية ────────────────────────────────────
            'مناطق':    new Set(['مناطق','منطقه','صناعيه','مجمع']),
            'صناعيه':   new Set(['صناعيه','صناعي','مصانع','انتاج']),

            // ── مشتقات شائعة ────────────────────────────────────
            'انتاج':    new Set(['انتاج', 'تصنيع','مصنع', 'توليد']),
            'تربيه':    new Set(['تربيه', 'اسماك','سمك',  'دواجن','حيوانات','طيور']),
            'اقفاص':    new Set(['اقفاص', 'سمك',  'سمكي', 'بحريه','استزراع']),
            'بحريه':    new Set(['بحريه', 'بحري', 'سمك',  'اقفاص','مياه']),
        };
    }

    /**
     * 🎯 حساب نسبة تغطية كلمات الاستعلام في نص النتيجة
     *
     * المنطق المُحسَّن (v1.3):
     *   بدلاً من البحث الحرفي أو الـ stem البسيط، نستخدم قاموس المرادفات:
     *   - "اسماك" → يبحث عن: اسماك أو سمك أو سمكي أو مزارع أو استزراع ...
     *   - "تربيه" → يبحث عن: تربيه أو اسماك أو دواجن أو حيوانات ...
     *
     * مثال بعد الإصلاح:
     *   query = "تربية أسماك"
     *   queryTokens = {'تربيه', 'اسماك'}
     *   نتيجة A "تربية الدواجن":      تربيه ✅ | اسماك ❌ → overlap = 0.5
     *   نتيجة B "الإنتاج السمكي":     تربيه ❌ | اسماك→سمكي ✅ → overlap = 0.5
     *   نتيجة C "المزارع السمكية":    تربيه ❌ | اسماك→مزارع ✅ → overlap = 0.5
     *   نتيجة D "استزراع سمكي تكاملي": تربيه ❌ | اسماك→سمكي ✅ → overlap = 0.5
     *   نتيجة E "توريدات عمومية":     تربيه ❌ | اسماك ❌ → overlap = 0.0 ← عقوبة ✅
     *
     * @param {Set<string>} queryTokens - كلمات الاستعلام المُطبَّعة
     * @param {string} resultText       - نص النتيجة الكامل
     * @returns {number} نسبة التغطية [0.0 - 1.0]
     */
    calculateQueryOverlap(queryTokens, resultText) {
        if (!queryTokens || queryTokens.size === 0) return 1.0;
        if (!resultText) return 0.0;

        const normalizedResult = this.normalizeArabic(resultText);
        const synonymMap = this.getSynonymMap();
        let matchCount = 0;

        for (const token of queryTokens) {
            // 1. بحث مباشر عن الكلمة
            if (normalizedResult.includes(token)) {
                matchCount++;
                continue;
            }

            // 2. بحث عبر قاموس المرادفات
            const synonyms = synonymMap[token];
            if (synonyms) {
                let foundViaSynonym = false;
                for (const syn of synonyms) {
                    if (normalizedResult.includes(syn)) {
                        foundViaSynonym = true;
                        break;
                    }
                }
                if (foundViaSynonym) {
                    matchCount++;
                    continue;
                }
            }

            // 3. بحث بالجذر: أول 3 حروف (أكثر موثوقية من 4 للعربية)
            //    مثال: "سمكي" و"سمك" و"اسماك" يشتركون في "سمك" لكن ليس في أول 4 حروف
            const shortStem = token.length >= 4 ? token.substring(1, 4) : token; // نتجاوز همزة الوصل
            if (shortStem.length >= 3 && normalizedResult.includes(shortStem)) {
                matchCount++;
            }
        }

        return matchCount / queryTokens.size;
    }

    /**
     * ⚖️ تطبيق عقوبة/مكافأة على النتيجة بناءً على تغطية الاستعلام
     *
     * جدول العقوبات والمكافآت:
     *   overlap = 1.0  (كل الكلمات موجودة) → مكافأة  +0.15
     *   overlap = 0.75                       → مكافأة  +0.05
     *   overlap = 0.5  (نصف الكلمات)        → بدون تغيير (0)
     *   overlap = 0.25                       → عقوبة   -0.10
     *   overlap = 0.0  (لا توجد كلمة واحدة) → عقوبة   -0.20
     *
     * لماذا هذه القيم؟
     *   - المكافأة عند التغطية الكاملة تدفع النتيجة المثالية للصدارة حتى لو
     *     كانت درجتها الدلالية قريبة من المنافسين
     *   - العقوبة عند التغطية الصفرية تُزيح النتائج التي نجحت بسبب كلمة مشتركة
     *     واحدة فقط (مثل "تربية الدواجن" عند البحث عن "تربية أسماك")
     *
     * @param {number} baseScore  - الدرجة الخام قبل العقوبة
     * @param {number} overlap    - نسبة التغطية [0.0 - 1.0]
     * @returns {number}          - الدرجة بعد التعديل
     */
    applyQueryOverlapPenalty(baseScore, overlap) {
        let adjustment = 0;

        if (overlap >= 1.0) {
            adjustment = +0.15;  // كل الكلمات موجودة → مكافأة كبيرة
        } else if (overlap >= 0.75) {
            adjustment = +0.05;  // معظم الكلمات → مكافأة بسيطة
        } else if (overlap >= 0.5) {
            adjustment = 0;      // نصف الكلمات → لا تغيير
        } else if (overlap >= 0.25) {
            adjustment = -0.10;  // قليل من الكلمات → عقوبة متوسطة
        } else {
            adjustment = -0.20;  // لا يوجد تطابق → عقوبة كبيرة
        }

        // نتأكد أن الدرجة لا تنزل تحت الصفر
        return Math.max(0, baseScore + adjustment);
    }

    // =========================================================================
    // الدوال الأصلية (محدّثة فقط في calculateFinalScore)
    // =========================================================================

    /**
     * 🔤 استخراج النص/الاسم من أي هيكل بيانات
     */
    extractText(result) {
        if (!result) return '';

        if (result.text && typeof result.text === 'string' && result.text !== 'undefined') {
            return result.text;
        }

        if (result.data?.text && typeof result.data.text === 'string') {
            return result.data.text;
        }

        const od = result.data?.original_data;
        if (od) {
            if (od.text)            return od.text;
            if (od.النشاط_المحدد)  return od.النشاط_المحدد;
            if (od.النشاط)         return od.النشاط;
            if (od.activity)       return od.activity;
            if (od.name)           return od.name;
            if (od.اسم_المنطقة)   return od.اسم_المنطقة;
        }

        if (result.originalData?.text)   return result.originalData.text;
        if (result.originalData?.name)   return result.originalData.name;

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
        
        // 🆕 v1.2: نحسب رموز الاستعلام مرة واحدة ونُمررها لكل النتائج
        const queryTokens = this.getQueryTokens(query || '');
        console.log("  🔤 رموز الاستعلام:", [...queryTokens]);

        const mergedResults = this.mergeResults(semanticResults, keywordResults);
        
        const scoredResults = mergedResults.map(result => {
            const finalScore = this.calculateFinalScore(result, query, context, queryTokens);
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
            text: sorted[0]?.text,
            score: sorted[0]?.finalScore?.toFixed(3),
            source: sorted[0]?.source,
            breakdown: sorted[0]?.scoreBreakdown
        });
        
        return sorted;
    }
    
    /**
     * 🔀 دمج النتائج من المصدرين
     */
    mergeResults(semanticResults = [], keywordResults = []) {
        const resultsMap = new Map();
        
        semanticResults.forEach((result, index) => {
            const key = result.id ?? result.value ?? `sem_${index}`;
            const resolvedText = this.extractText(result);

            resultsMap.set(key, {
                ...result,
                id: key,
                text: resolvedText,
                semanticScore: result.score || result.cosineScore || 0,
                semanticRank: index + 1,
                keywordScore: 0,
                keywordRank: null,
                source: 'semantic'
            });
        });
        
        keywordResults.forEach((result, index) => {
            const key = result.id ?? result.value ?? `kw_${index}`;
            const existing = resultsMap.get(key);
            
            if (existing) {
                existing.keywordScore = result.score || result.finalScore || 0;
                existing.keywordRank = index + 1;
                existing.source = 'hybrid';
                if (!existing.text || existing.text === existing.id) {
                    const kwText = this.extractText(result);
                    if (kwText) existing.text = kwText;
                }
            } else {
                const resolvedText = this.extractText(result);
                resultsMap.set(key, {
                    ...result,
                    id: key,
                    text: resolvedText,
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
     *
     * 🔧 v1.2: إضافة queryTokens كمعامل رابع
     *          بعد حساب الدرجة الخام نُطبق عقوبة/مكافأة التغطية
     *
     * @param {Object}   result
     * @param {string}   query
     * @param {Object}   context
     * @param {Set}      queryTokens - 🆕 رموز الاستعلام المُطبَّعة
     */
    calculateFinalScore(result, query, context, queryTokens = null) {
        const breakdown = {
            semantic: 0,
            keyword: 0,
            contextBoost: 0,
            overlapAdjustment: 0,   // 🆕 حقل جديد في التقرير
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
        
        // الدرجة الخام قبل تعديل التغطية
        const baseScore = breakdown.semantic + breakdown.keyword + breakdown.contextBoost + hybridBonus;

        // 🆕 v1.2: تطبيق عقوبة/مكافأة التغطية
        let finalScore = baseScore;
        if (queryTokens && queryTokens.size > 0) {
            const resultText = result.text || '';
            const overlap = this.calculateQueryOverlap(queryTokens, resultText);
            finalScore = this.applyQueryOverlapPenalty(baseScore, overlap);
            breakdown.overlapAdjustment = +(finalScore - baseScore).toFixed(3);
            breakdown.overlap = +overlap.toFixed(2);

            // سجّل في الكونسول فقط عند العقوبة للحد من الضجيج
            if (overlap < 0.5) {
                console.log(`  ⚠️ عقوبة تغطية: ${result.id} | overlap=${overlap.toFixed(2)} | ${baseScore.toFixed(3)} → ${finalScore.toFixed(3)}`);
            }
        }

        breakdown.totalRaw = +finalScore.toFixed(4);
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
    console.log("✅ ResultReranker v1.3 جاهز — قاموس مرادفات دلالي + جذر عربي محسّن");
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResultReranker };
}
