/****************************************************************************
 * 🎯 IntentClassifier.js - المصنف الذكي متعدد الطبقات
 * 
 * المهام:
 * ✅ تصنيف النية قبل البحث (Pre-Search Intent Classification)
 * ✅ نظام أوزان ديناميكي قابل للتعديل
 * ✅ التكامل مع ذاكرة السياق (agent_memory.js)
 * ✅ الاستفادة من الكلمات والنوايا في neural_search_v6.js
 * ✅ دعم إضافة قواعد بيانات مستقبلية
 ****************************************************************************/

class IntentClassifier {
    constructor() {
        // ⚙️ نظام الأوزان القابل للتعديل - يمكن تعديل هذه القيم لزيادة الدقة
        this.weights = {
            // 🔹 أوزان الكلمات المفتاحية لكل قاعدة بيانات
            activities: {
                keywords: {
                    'نشاط': 2.5,
                    'مشروع': 2.3,
                    'ترخيص': 2.8,
                    'رخصه': 2.8,
                    'تراخيص': 2.8,
                    'اجراءات': 2.0,
                    'متطلبات': 2.2,
                    'شروط': 2.1,
                    'جهه': 1.8,
                    'جهة': 1.8,
                    'موافقه': 2.0,
                    'موافقة': 2.0,
                    'اذن': 1.9,
                    'كود': 2.5,
                    'رمز': 2.0,
                    'ايسيك': 3.0,
                    'isic': 3.0,
                    'activity': 2.2,
                    'business': 1.8
                },
                minScore: 3.0 // الحد الأدنى لاعتبار النية كـ activity
            },
            
            industrial_zones: {
                keywords: {
                    'منطقه': 3.0,
                    'منطقة': 3.0,
                    'مناطق': 3.0,
                    'صناعيه': 2.8,
                    'صناعية': 2.8,
                    'منطقه صناعيه': 5.0,
                    'منطقة صناعية': 5.0,
                    'مساحه': 2.5,
                    'مساحة': 2.5,
                    'فدان': 3.0,
                    'متر': 2.0,
                    'موقع': 2.5,
                    'احداثيات': 3.0,
                    'تبعيه': 2.3,
                    'تبعية': 2.3,
                    'ولايه': 2.3,
                    'ولاية': 2.3,
                    'محافظه': 2.0,
                    'محافظة': 2.0,
                    'التابعه': 2.5,
                    'التابعة': 2.5,
                    'تابعه': 2.5,
                    'تابعة': 2.5,
                    'هيئه': 2.0,
                    'هيئة': 2.0,
                    'الهيئه': 2.0,
                    'الهيئة': 2.0,
                    'حره': 2.5,
                    'حرة': 2.5,
                    'zone': 2.5,
                    'area': 2.2,
                    'industrial': 2.5
                },
                minScore: 3.0  // ✅ خفض العتبة: كلمة "مناطق" وحدها تكفي للتوجيه الصحيح
            },
            
            decision104: {
                keywords: {
                    'قرار': 2.5,
                    '104': 5.0,
                    'قرار 104': 10.0, // وزن عالي جداً للمطابقة المباشرة
                    'حافز': 3.5,
                    'حوافز': 3.5,
                    'اعفاء': 3.0,
                    'اعفاءات': 3.0,
                    'تخفيض': 2.5,
                    'ضريبه': 2.0,
                    'ضريبة': 2.0,
                    'قطاع': 2.8,
                    'قطاع أ': 4.0,
                    'قطاع ا': 4.0,
                    'قطاع ب': 4.0,
                    'استثمار': 2.5,
                    'استثماري': 2.5,
                    'مزايا': 2.3,
                    'مزايا ضريبيه': 4.0,
                    'مزايا ضريبية': 4.0,
                    'ضريبيه': 2.8,
                    'ضريبية': 2.8,
                    'استفاده': 2.5,
                    'استفادة': 2.5,
                    'مميزات': 2.5,
                    'اعفاء ضريبي': 4.0,
                    'تخفيضات': 2.5,
                    'تمتع': 2.0,
                    'incentive': 3.0,
                    'incentives': 3.0,
                    'tax': 2.0
                },
                minScore: 5.0  // ✅ رفع العتبة: يحتاج كلمات قوية مثل "104" أو "حوافز" أو "قطاع"
            }
        };
        
        // 🧠 تحميل الخريطة الدلالية من neural_search_v6.js
        this.semanticMap = this.loadSemanticBrain();
        
        // 🎯 تحميل أنماط النية من neural_search_v6.js
        this.intentPatterns = this.loadIntentPatterns();
        
        // 📊 إحصائيات للتحسين المستمر
        this.stats = {
            totalClassifications: 0,
            correctPredictions: 0,
            ambiguousCases: 0
        };
    }
    
    /**
     * 🧠 تحميل الخريطة الدلالية من neural_search_v6.js
     */
    loadSemanticBrain() {
        // إذا كان window.SemanticBrain موجوداً، نستخدمه مباشرة
        if (typeof window !== 'undefined' && window.SemanticBrain) {
            return window.SemanticBrain;
        }
        
        // بديل: خريطة دلالية مدمجة (يتم تحديثها من neural_search)
        return {
            "تخزين": ["مخزن", "مستودع", "ثلاجة"],
            "علاج": ["طبيب", "دكتور", "عيادة"],
            "تصنيع": ["مصنع", "انتاج", "ورشة"],
            "منطقة": ["صناعية", "قطعة", "ارض"]
        };
    }
    
    /**
     * 🎯 تحميل أنماط النية من neural_search_v6.js
     */
    loadIntentPatterns() {
        if (typeof window !== 'undefined' && window.IntentPatterns) {
            return window.IntentPatterns;
        }
        
        // بديل مدمج
        return {
            storage: { patterns: ["تخزين", "مخزن"], boost: 1.5 },
            medical: { patterns: ["علاج", "طبيب"], boost: 1.4 },
            industrial_zone: { patterns: ["منطقة", "صناعية"], boost: 1.6 },
            decision: { patterns: ["قرار", "104"], boost: 1.5 }
        };
    }
    
    /**
     * 🔧 تطبيع النص العربي (متوافق مع باقي المشروع)
     */
    normalizeArabic(text) {
        if (!text) return '';
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
    
    /**
     * 🎯 التصنيف الرئيسي - القلب النابض للمصنف
     */
    classify(query, contextData = null) {
        console.log("🎯 بدء التصنيف للاستعلام:", query);
        
        this.stats.totalClassifications++;
        
        const normalizedQuery = this.normalizeArabic(query);
        
        // 📊 حساب النقاط لكل قاعدة بيانات
        const scores = {
            activities: this.calculateScore(normalizedQuery, 'activities'),
            industrial_zones: this.calculateScore(normalizedQuery, 'industrial_zones'),
            decision104: this.calculateScore(normalizedQuery, 'decision104')
        };
        
        // 🧠 تطبيق تعزيز السياق من الذاكرة
        if (contextData || (typeof window !== 'undefined' && window.AgentMemory)) {
            const context = contextData || window.AgentMemory.getContext();
            this.applyContextBoost(scores, context, normalizedQuery);
        }
        
        // 🎯 تطبيق تعزيز الأنماط الدلالية
        this.applySemanticBoost(scores, normalizedQuery);
        
        console.log("📊 النقاط النهائية:", scores);
        
        // 🏆 تحديد القاعدة الفائزة
        const classification = this.determineWinner(scores, normalizedQuery);
        
        console.log("✅ النتيجة:", classification);
        
        return classification;
    }
    
    /**
     * 📊 حساب النقاط بناءً على الكلمات المفتاحية
     */
    calculateScore(query, database) {
    let score = 0;
    const keywords = this.weights[database].keywords;
    
    // 🔍 فحص الكلمات المركبة أولاً (مثل "منطقة صناعية")
    for (const [keyword, weight] of Object.entries(keywords)) {
        if (keyword.includes(' ')) {
            if (query.includes(keyword)) {
                score += weight;
                console.log(`  ✓ "${keyword}" → +${weight}`);
            }
            // ✅ [جديد] فحص بالجذر أيضاً للكلمات المركبة
            else if (window.ArabicNLP) {
                const stemmedQuery = window.ArabicNLP.stemQuery(query);
                const stemmedKeyword = window.ArabicNLP.stemQuery(keyword);
                if (stemmedQuery.includes(stemmedKeyword)) {
                    score += weight * 0.85; // وزن أقل قليلاً للتطابق بالجذر
                    console.log(`  ✓ [جذر] "${keyword}" → +${weight * 0.85}`);
                }
            }
        }
    }
    
    // 🔍 فحص الكلمات المفردة
    const queryTokens = query.split(/\s+/);
    for (const token of queryTokens) {
        if (keywords[token]) {
            score += keywords[token];
            console.log(`  ✓ "${token}" → +${keywords[token]}`);
        }
        // ✅ [جديد] فحص بالجذر للكلمات المفردة
        else if (window.ArabicNLP) {
            const stemmedToken = window.ArabicNLP.stem(token);
            // نبحث عن مفتاح في قاموس الأوزان يشارك نفس الجذر
            for (const [keyword, weight] of Object.entries(keywords)) {
                if (!keyword.includes(' ')) { // مفردة فقط
                    const stemmedKeyword = window.ArabicNLP.stem(keyword);
                    if (stemmedToken === stemmedKeyword && stemmedToken.length > 2) {
                        score += weight * 0.80; // وزن أقل للتطابق بالجذر
                        console.log(`  ✓ [جذر] "${token}"≈"${keyword}" → +${weight * 0.80}`);
                        break;
                    }
                }
            }
        }
    }
    
    return score;
}
    
    /**
     * 🧠 تطبيق تعزيز السياق من الذاكرة
     */
    applyContextBoost(scores, context, query) {
        if (!context || !context.type) return;
        
        console.log("🧠 تطبيق تعزيز السياق:", context.type);
        
        // الكلمات الدلالية التي تشير إلى استمرار المحادثة
        // ✅ توسيع: تعرف على أسئلة المتابعة القصيرة (كلمة واحدة أو جملة قصيرة)
        const shortFollowUpWords = ['المساحه', 'المساحة', 'مساحه', 'مساحة',
            'الموقع', 'موقع', 'الاحداثيات', 'احداثيات',
            'التبعيه', 'التبعية', 'تبعيه', 'تبعية',
            'الولايه', 'الولاية', 'ولايه', 'ولاية',
            'المحافظه', 'المحافظة', 'محافظه', 'محافظة',
            'الترخيص', 'ترخيص', 'التراخيص', 'تراخيص',
            'الشروط', 'شروط', 'المتطلبات', 'متطلبات',
            'الجهه', 'الجهة', 'جهه', 'جهة',
            'الدليل', 'دليل', 'الرابط', 'رابط',
            'الحوافز', 'حوافز', 'الاعفاءات', 'اعفاءات',
            'القرار', 'قرار', 'الملاحظات', 'ملاحظات'];
        const normalizedQ = this.normalizeArabic ? this.normalizeArabic(query) : query;
        const isShortSingleWord = query.trim().split(/\s+/).length <= 2 &&
            shortFollowUpWords.some(w => normalizedQ.includes(w));
        const isFollowUp = isShortSingleWord ||
            /^(ما|هي|هو|كم|اين|فين|شروط|حوافز|تراخيص|ده|دي|موقع)/i.test(query);
        
        if (isFollowUp) {
            switch(context.type) {
                case 'activity':
                    scores.activities += 3.0;
                    console.log("  🎯 تعزيز الأنشطة: +3.0");
                    break;
                    
                case 'industrial':
                    scores.industrial_zones += 3.0;
                    console.log("  🎯 تعزيز المناطق: +3.0");
                    break;
                    
                case 'decision104':
                    scores.decision104 += 3.0;
                    console.log("  🎯 تعزيز القرار 104: +3.0");
                    break;
            }
        }
    }
    
    /**
     * 🎯 تطبيق تعزيز الأنماط الدلالية
     */
    applySemanticBoost(scores, query) {
        for (const [intentKey, intentData] of Object.entries(this.intentPatterns)) {
            for (const pattern of intentData.patterns) {
                if (query.includes(pattern)) {
                    // تعيين التعزيز حسب نوع النمط
                    if (intentKey === 'industrial_zone' || intentKey === 'location') {
                        scores.industrial_zones += intentData.boost;
                    } else if (intentKey === 'decision') {
                        scores.decision104 += intentData.boost;
                    } else {
                        scores.activities += intentData.boost * 0.5;
                    }
                }
            }
        }
    }
    
    /**
     * 🏆 تحديد القاعدة الفائزة
     */
    determineWinner(scores, query) {
        const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const winner = entries[0];
        const runnerUp = entries[1];
        
        // ✅ القاعدة الأساسية: إذا كانت النقطة الأعلى أكبر من الحد الأدنى
        if (winner[1] >= this.weights[winner[0]].minScore) {
            
            // 🔍 فحص الحالات الغامضة (الفرق أقل من 2.0)
            if (runnerUp && (winner[1] - runnerUp[1] < 2.0)) {
                this.stats.ambiguousCases++;
                console.log("⚠️ حالة غامضة - سيتم البحث في كلا القاعدتين");
                
                // ✅ ترجمة: industrial_zones → areas للتوافق مع this.databases
                const mapDB = db => db === 'industrial_zones' ? 'areas' : db;
                return {
                    primary: mapDB(winner[0]),
                    secondary: mapDB(runnerUp[0]),
                    confidence: winner[1],
                    isAmbiguous: true,
                    searchOrder: [winner[0], runnerUp[0]].map(mapDB)
                };
            }
            
            // ✅ ترجمة: industrial_zones → areas للتوافق مع this.databases
            const mapDB2 = db => db === 'industrial_zones' ? 'areas' : db;
            return {
                primary: mapDB2(winner[0]),
                secondary: null,
                confidence: winner[1],
                isAmbiguous: false,
                searchOrder: [winner[0]].map(mapDB2)
            };
        }
        
        // ❌ النقاط ضعيفة - البحث في كل القواعد
        console.log("⚠️ نقاط منخفضة - البحث الشامل");
        return {
            primary: 'all',
            secondary: null,
            confidence: 0,
            isAmbiguous: true,
            searchOrder: ['activities', 'areas', 'decision104'] // ✅ ترجمة industrial_zones→areas
        };
    }
    
    /**
     * ⚙️ تحديث الأوزان ديناميكياً (للتحسين المستمر)
     */
    updateWeight(database, keyword, newWeight) {
        if (this.weights[database] && this.weights[database].keywords[keyword] !== undefined) {
            const oldWeight = this.weights[database].keywords[keyword];
            this.weights[database].keywords[keyword] = newWeight;
            console.log(`⚙️ تحديث وزن "${keyword}" في ${database}: ${oldWeight} → ${newWeight}`);
            return true;
        }
        return false;
    }
    
    /**
     * ➕ إضافة قاعدة بيانات جديدة (للتوسع المستقبلي)
     */
    addDatabase(name, config) {
        this.weights[name] = {
            keywords: config.keywords || {},
            minScore: config.minScore || 3.0
        };
        console.log(`✅ تمت إضافة قاعدة بيانات جديدة: ${name}`);
    }
    
    /**
     * 📊 الحصول على الإحصائيات
     */
    getStats() {
        return {
            ...this.stats,
            accuracy: this.stats.totalClassifications > 0 
                ? (this.stats.correctPredictions / this.stats.totalClassifications * 100).toFixed(2) + '%'
                : 'N/A'
        };
    }
}

// ==================== 🌐 التصدير والإتاحة العالمية ====================
if (typeof window !== 'undefined') {
    window.IntentClassifier = IntentClassifier;
    window.intentClassifier = new IntentClassifier();
    console.log("✅ IntentClassifier جاهز للخدمة");
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IntentClassifier };
}

