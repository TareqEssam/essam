/****************************************************************************
 * 🧠 NeuralSearch v6.0 - محرك البحث الذكي الثوري
 * ذكاء اصطناعي محلي 100% - تجربة مستخدم خارقة
 * 
 * الميزات الثورية:
 * ✨ فهم دلالي عميق مع توسيع ذكي للاستعلام
 * 🎯 نظام تسجيل متطور مع 12 آلية مختلفة
 * 🧬 تعلم ذاتي من سلوك المستخدم
 * 💡 اقتراحات ذكية مع تصحيح تلقائي
 * 🎨 واجهة تفاعلية مذهلة
 * ⚡ أداء فائق السرعة مع تخزين مؤقت ذكي
 ****************************************************************************/

// ==================== 🌐 المصفوفة الدلالية الضخمة ====================
const SemanticBrain = {
    // قطاع التخزين واللوجستيات - موسع بشكل ثوري
    "تخزين": ["مخزن", "مستودع", "ثلاجة", "تبريد", "تجميد", "سيلو", "صومعة", "ستور", "حفظ", "امانات", "لوجستي", "نقل", "شحن", "توزيع", "depot", "warehouse", "storage", "cold", "fridge", "logistics", "سلسلة توريد", "مخازن", "عنبر", "قاعة تخزين"],
    "حفظ": ["تخزين", "مخزن", "ثلاجة", "تبريد", "تجميد", "امانات", "مستودع", "صيانة", "وقاية", "حماية", "ارشفة"],
    "تبريد": ["ثلاجة", "تجميد", "تخزين", "مخزن", "لحوم", "خضروات", "فاكهة", "البان", "مجمدات", "ice", "cooling", "chilling", "فريزر", "ديب فريزر"],
    "مستودع": ["تخزين", "مخزن", "warehouse", "عنبر", "حفظ", "لوجستي", "توزيع"],
    
    // قطاع الصحة والدواء - موسع بقوة
    "علاج": ["طبيب", "دكتور", "عيادة", "مستشفى", "مركز طبي", "صيدلية", "دواء", "ادوية", "مستلزمات طبية", "بيطري", "صحة", "وقاية", "اسعاف", "كشف", "فحص", "تحليل", "اشعة", "treatment", "medical", "health", "طب", "معالجة", "تشخيص", "جراحة", "عملية"],
    "دواء": ["صيدلية", "مخزن ادوية", "مكتب علمي", "مستحضرات", "تجميل", "كيماويات", "بيطري", "لقاح", "مصل", "pharmacy", "medicine", "drug", "عقار", "علاج", "دوائي"],
    "طبيب": ["دكتور", "عيادة", "علاج", "كشف", "فحص", "استشارة", "طبي", "صحي", "doctor", "physician"],
    "صيدلية": ["دواء", "ادوية", "pharmacy", "عقاقير", "مستحضرات", "تجميل", "صحة"],
    "بيطري": ["حيوان", "ماشية", "دواجن", "عيادة بيطرية", "مخزن بيطري", "ادوية بيطرية", "لقاحات", "تسمين", "veterinary", "animal", "حيواني", "مواشي"],
    "مستشفى": ["علاج", "مركز طبي", "طبيب", "عيادة", "hospital", "صحة", "رعاية"],
    
    // قطاع الصناعة - توسع هائل
    "تصنيع": ["مصنع", "انتاج", "ورشة", "معمل", "خط انتاج", "تجهيز", "خامات", "صناعة", "تعدين", "سبك", "نسيج", "بلاستيك", "حديد", "صلب", "factory", "manufacturing", "production", "industrial", "صناعي", "منتج", "تجميع"],
    "مصنع": ["تصنيع", "انتاج", "factory", "ورشة", "معمل", "خط", "صناعة", "صناعي"],
    "انتاج": ["تصنيع", "مصنع", "خط", "تجهيز", "تعبئة", "تغليف", "خامات", "منتج", "سلعة", "production"],
    "ورشة": ["تصنيع", "مصنع", "صيانة", "اصلاح", "workshop", "معمل صغير"],
    
    // قطاع الغذاء - شامل ومفصل
    "طعام": ["اكل", "وجبات", "مطعم", "كافيه", "كافتيريا", "حلويات", "مخبز", "اغذية", "تغذية", "سوبر ماركت", "بقالة", "تعبئة", "لحوم", "خضروات", "فاكهة", "البان", "food", "restaurant", "catering", "فود", "غذائي"],
    "مطعم": ["اكل", "طعام", "وجبات", "كافيه", "سياحي", "فندق", "مطبخ", "شيف", "طهي", "سندوتش", "بيتزا", "برجر", "restaurant", "fast food"],
    "اغذية": ["طعام", "اكل", "food", "تعبئة", "تغليف", "منتجات غذائية", "مواد غذائية"],
    "مخبز": ["خبز", "حلويات", "معجنات", "كعك", "bakery", "عجائن", "فطائر"],
    
    // قطاع السياحة - غني جداً
    "سياحة": ["فندق", "منتجع", "قرية سياحية", "نزل", "ضيافة", "سفر", "رحلات", "ترفيه", "مخيم", "بازار", "غوص", "يخت", "عائم", "مرشد", "tourism", "hotel", "resort", "travel", "سياحي"],
    "فندق": ["اقامة", "سكن", "سياحة", "ضيافة", "غرف", "اجنحة", "سياحي", "منتجع", "hotel", "accommodation", "حجز"],
    "منتجع": ["سياحة", "فندق", "resort", "استجمام", "ترفيه", "سياحي"],
    
    // قطاع الزراعة - متعمق
    "زراعة": ["ارض", "محصول", "ري", "استصلاح", "صوبة", "نبات", "بذور", "سماد", "مزرعة", "شجر", "فاكهة", "خضار", "نخيل", "agriculture", "farm", "زراعي", "فلاحة"],
    "مزرعة": ["زراعة", "ارض", "محصول", "farm", "حيوان", "ماشية", "فلاحة"],
    "حيوان": ["ماشية", "دواجن", "تسمين", "بيض", "البان", "نحل", "سمك", "استزراع", "منحل", "عنبر", "مزرعة حيوانية", "animal", "livestock", "حيواني", "ثروة حيوانية"],
    
    // قطاعات إضافية
    "طاقة": ["كهرباء", "بترول", "غاز", "وقود", "بنزين", "شحن", "تعدين", "محطة", "مولد", "شمسية", "energy", "power", "fuel", "كهربائي"],
    "تقنية": ["تكنولوجيا", "برمجة", "اتصالات", "انترنت", "كمبيوتر", "برمجيات", "تطوير", "موقع", "تطبيق", "tech", "software", "it", "تقني"],
    "تعليم": ["مدرسة", "جامعة", "كلية", "معهد", "دورات", "تدريب", "education", "تعليمي", "دراسة"],
    "تجارة": ["بيع", "شراء", "سوق", "محل", "متجر", "تجاري", "trade", "business", "تسويق"],
    
    // قطاع المناطق الجغرافية - للمناطق الصناعية
    "منطقة": ["منطقه", "صناعية", "صناعيه", "قطعة", "ارض", "موقع", "مكان", "zone", "area", "industrial"],
    "محافظة": ["محافظه", "مدينة", "قرية", "مركز", "governorate", "city"],
    "تابع": ["تبعية", "ولاية", "اشراف", "ادارة", "إدارة", "جهة", "dependency", "authority"],
    "قرار": ["قانون", "لائحة", "تشريع", "decision", "law", "legislation"],
    
    // مناطق جغرافية محددة (أمثلة شائعة)
    "قاهرة": ["العاصمة", "cairo"],
    "اسكندرية": ["اسكندريه", "الاسكندرية", "alexandria", "alex"],
    "جيزة": ["الجيزه", "giza"],
    "اسماعيلية": ["اسماعيليه", "الاسماعيلية", "ismailia"],
    "سويس": ["السويس", "suez"],
    "بورسعيد": ["بور سعيد", "port said"],
    "دمياط": ["dumyat", "damietta"],
    "شرقية": ["الشرقية", "sharqia"],
    "بحيرة": ["البحيرة", "beheira"],
    "غربية": ["الغربية", "gharbia"],
    "منوفية": ["المنوفية", "monufia"],
    "قليوبية": ["القليوبية", "qalyubia"],
    "كفر": ["كفر الشيخ", "kafr elsheikh"],
    "دقهلية": ["الدقهلية", "dakahlia"],
    "سوهاج": ["sohag"],
    "قنا": ["qena"],
    "اسيوط": ["asyut", "assiut"],
    "اقصر": ["الاقصر", "luxor"],
    "اسوان": ["aswan"],
    "بني": ["بني سويف", "beni suef"],
    "فيوم": ["الفيوم", "fayoum"],
    "مينيا": ["المنيا", "minya"],
    "بحر": ["البحر الاحمر", "red sea"],
    "وادي": ["وادي جديد", "new valley"],
    "مطروح": ["مرسي مطروح", "matrouh"],
    "شمال": ["شمال سيناء", "north sinai"],
    "جنوب": ["جنوب سيناء", "south sinai"]
};

// ==================== 🎯 أنماط النية الذكية ====================
const IntentPatterns = {
    storage: { patterns: ["تخزين", "مخزن", "حفظ", "مستودع", "warehouse"], boost: 1.5 },
    medical: { patterns: ["علاج", "طبيب", "دواء", "صيدلية", "عيادة", "medical"], boost: 1.4 },
    food: { patterns: ["طعام", "اكل", "مطعم", "اغذية", "food"], boost: 1.4 },
    manufacturing: { patterns: ["تصنيع", "مصنع", "انتاج", "factory"], boost: 1.3 },
    agriculture: { patterns: ["زراعة", "مزرعة", "محصول", "farm"], boost: 1.3 },
    tourism: { patterns: ["سياحة", "فندق", "منتجع", "hotel"], boost: 1.3 },
    
    // أنماط جديدة للمناطق الصناعية
    industrial_zone: { patterns: ["منطقة", "صناعية", "صناعيه", "منطقه", "مناطق", "zone"], boost: 1.6 },
    location: { patterns: ["محافظة", "مدينة", "موقع", "مكان", "اين", "فين", "where"], boost: 1.4 },
    governance: { patterns: ["تبعية", "ولاية", "جهة", "اشراف", "ادارة", "تابع"], boost: 1.3 },
    
    // أنماط جديدة للقرار 104
    decision: { patterns: ["قرار", "104", "قانون", "حوافز", "اعفاءات", "incentives"], boost: 1.5 },
    sector: { patterns: ["قطاع", "sector", "أ", "ب"], boost: 1.4 }
};
// ==================== 💾 نظام التخزين المؤقت الذكي ====================
const IntelligentCache = {
    searches: new Map(),
    semantic: new Map(),
    levenshtein: new Map(),
    userBehavior: new Map(),
    
    get(key, type = 'searches') {
        return this[type].get(key);
    },
    
    set(key, value, type = 'searches') {
        this[type].set(key, value);
        // تنظيف تلقائي للذاكرة
        if (this[type].size > 1000) {
            const firstKey = this[type].keys().next().value;
            this[type].delete(firstKey);
        }
    },
    
    clear() {
        this.searches.clear();
        this.semantic.clear();
        this.levenshtein.clear();
    }
};

// ==================== 🧠 نظام إدارة السياق الذكي ====================
const ContextManager = {
    history: [],
    maxHistory: 10,
    currentContext: null,
    
    // إضافة سؤال للتاريخ
    addQuery(query, dbType, results) {
        this.history.push({
            query,
            dbType,
            timestamp: Date.now(),
            results: results.slice(0, 3) // نحفظ أول 3 نتائج فقط
        });
        
        // تنظيف التاريخ القديم
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        
        // تحديث السياق الحالي
        this.updateContext();
    },
    
    // تحديث السياق
    updateContext() {
        if (this.history.length === 0) {
            this.currentContext = null;
            return;
        }
        
        const lastQuery = this.history[this.history.length - 1];
        this.currentContext = {
            dbType: lastQuery.dbType,
            mainEntity: this.extractMainEntity(lastQuery),
            relatedEntities: this.extractRelatedEntities()
        };
    },
    
    // استخراج الكيان الرئيسي من آخر سؤال
    extractMainEntity(queryData) {
        if (!queryData.results || queryData.results.length === 0) return null;
        
        const topResult = queryData.results[0];
        
        switch(queryData.dbType) {
            case 'activities':
                return {
                    type: 'activity',
                    name: topResult.text,
                    value: topResult.value
                };
                
            case 'industrial_zones':
                return {
                    type: 'zone',
                    name: topResult.originalData?.name,
                    governorate: topResult.originalData?.governorate,
                    dependency: topResult.originalData?.dependency
                };
                
            case 'decision104':
                return {
                    type: 'decision_activity',
                    name: topResult.originalData?.activity,
                    sector: topResult.originalData?.sector,
                    category: topResult.originalData?.category
                };
                
            default:
                return null;
        }
    },
    
    // استخراج الكيانات المرتبطة
    extractRelatedEntities() {
        const entities = [];
        
        // نأخذ آخر 3 أسئلة
        const recentQueries = this.history.slice(-3);
        
        recentQueries.forEach(q => {
            if (q.results && q.results.length > 0) {
                const entity = this.extractMainEntity(q);
                if (entity) entities.push(entity);
            }
        });
        
        return entities;
    },
    
    // تحليل ما إذا كان السؤال متعلق بالسياق الحالي
    isRelatedToContext(query, newDbType) {
        if (!this.currentContext) return { related: false };
        
        const normalizedQuery = advancedNormalize(query);
        const context = this.currentContext;
        
        // 1. التحقق من الكلمات السياقية
        const contextKeywords = [
            'هل', 'هذا', 'هذه', 'ايضا', 'أيضاً', 'كمان', 'برضه', 
            'وماذا عن', 'و', 'ماذا عن', 'طيب', 'تمام'
        ];
        
        const hasContextKeyword = contextKeywords.some(kw => 
            normalizedQuery.includes(advancedNormalize(kw))
        );
        
        // 2. التحقق من الإشارة للكيان السابق
        let mentionsMainEntity = false;
        if (context.mainEntity) {
            const entityName = advancedNormalize(context.mainEntity.name || '');
            mentionsMainEntity = entityName.length > 0 && 
                               (normalizedQuery.includes(entityName) || 
                                entityName.includes(normalizedQuery));
        }
        
        // 3. تحليل نوع العلاقة
        let relationshipType = null;
        
        // علاقة: نشاط → قرار 104
        if (context.dbType === 'activities' && newDbType === 'decision104') {
            relationshipType = 'activity_to_decision';
        }
        // علاقة: نشاط → منطقة صناعية
        else if (context.dbType === 'activities' && newDbType === 'industrial_zones') {
            relationshipType = 'activity_to_zone';
        }
        // علاقة: منطقة → قرار 104
        else if (context.dbType === 'industrial_zones' && newDbType === 'decision104') {
            relationshipType = 'zone_to_decision';
        }
        // نفس القاعدة
        else if (context.dbType === newDbType) {
            relationshipType = 'same_database';
        }
        
        // 4. تحديد مستوى العلاقة
        const isStronglyRelated = (hasContextKeyword && mentionsMainEntity) || 
                                 (mentionsMainEntity && relationshipType);
        const isWeaklyRelated = hasContextKeyword || mentionsMainEntity;
        
        return {
            related: isStronglyRelated || isWeaklyRelated,
            strength: isStronglyRelated ? 'strong' : (isWeaklyRelated ? 'weak' : 'none'),
            relationshipType,
            context: context.mainEntity,
            hasContextKeyword,
            mentionsMainEntity
        };
    },
    
    // الحصول على معلومات سياقية إضافية
    getContextualBoost(query, dbType) {
        const analysis = this.isRelatedToContext(query, dbType);
        
        if (!analysis.related) return { boost: 1.0, info: null };
        
        // إذا كان السؤال مرتبط بقوة، نعطي دفعة للنتائج المرتبطة
        const boostFactor = analysis.strength === 'strong' ? 1.3 : 1.15;
        
        return {
            boost: boostFactor,
            info: {
                previousEntity: analysis.context,
                relationshipType: analysis.relationshipType
            }
        };
    },
    
    // مسح السياق
    clearContext() {
        this.history = [];
        this.currentContext = null;
    }
};
// ==================== 🧬 المحلل اللغوي المتطور ====================
// الكود المطور - المشرط الجراحي
function advancedNormalize(text) {
    if (!text) return '';
    
    let normalized = text.toString()
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/[ةه]/g, 'ه')
        .replace(/[ىي]/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/[.,;:!?،؛]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    // نزع "ال" التعريف من الكلمات لضمان تطابق "المكتب" مع "مكتب"
    return normalized.split(' ').map(word => {
        if (word.startsWith('ال') && word.length > 4) {
            return word.substring(2);
        }
        return word;
    }).join(' ');
}

// ==================== 🎲 تفكيك الاستعلام الذكي ====================
// تم التعديل لدعم قائمة كلمات استبعاد متغيرة عند كل بحث
function intelligentTokenize(query, dynamicStopWords = []) {
    const normalized = advancedNormalize(query);
    
   // كلمات التوقف الأساسية (التي تحذف دائماً عند البحث الفني لزيادة الدقة)
const baseStopWords = [
    // أدوات استفهام وطلب
    'ما', 'ما هي', 'ماهي', 'ماذا', 'كيف', 'اين', 'فين', 'متى', 'كم', 'هل', 'اي', 'أي', 'ايه',
    'اريد', 'ابحث', 'اعطني', 'عرض', 'اظهر', 'قائمة', 'جدول', 'بيانات', 'معلومات', 'تفاصيل',
    // كلمات وظيفية (Noise)
    'نشاط', 'انشطه', 'أنشطة', 'ترخيص', 'تراخيص', 'رخصة', 'رخصه', 'اجراءات', 'إجراءات', 
    'خطوات', 'مطلوب', 'متطلبات', 'اوراق', 'أوراق', 'ازاي', 'كيفية', 'طريقة', 'شروط', 'متوفر',
    // حروف
    'في', 'من', 'الى', 'على', 'عن', 'بشان', 'بخصوص', 'لي', 'لك', 'هذا', 'هذه', 'تلك'
];
    
    // دمج الكلمات الأساسية مع الكلمات المرسلة ديناميكياً (مثل "منطقة صناعية")
    const allStopWords = [...baseStopWords, ...dynamicStopWords.map(w => advancedNormalize(w))];
    
    // التعديل هنا: نقوم بتجريد كل توكن من "ال" التعريف أيضاً كخطوة تأكيدية
    const tokens = normalized.split(/\s+/)
        .filter(t => t.length > 1)
        .map(t => (t.startsWith('ال') && t.length > 4) ? t.substring(2) : t)
        .filter(t => !allStopWords.includes(t));
    
    return {
        tokens,
        biGrams: createNGrams(tokens, 2),
        triGrams: createNGrams(tokens, 3),
        original: query,
        normalized
    };
}

function createNGrams(tokens, n) {
    const ngrams = [];
    for (let i = 0; i <= tokens.length - n; i++) {
        ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    return ngrams;
}

// ==================== 🔍 التوسع الدلالي الثوري ====================
function semanticExpansion(tokens) {
    const expanded = new Set(tokens);
    const relevanceMap = new Map();
    
    tokens.forEach(token => {
        // البحث في المصفوفة الدلالية
        for (const [key, synonyms] of Object.entries(SemanticBrain)) {
            const normalizedKey = advancedNormalize(key);
            
            // تطابق كامل أو جزئي
            if (normalizedKey === token || normalizedKey.includes(token) || token.includes(normalizedKey)) {
                synonyms.forEach(syn => {
                    const normalizedSyn = advancedNormalize(syn);
                    expanded.add(normalizedSyn);
                    relevanceMap.set(normalizedSyn, 0.9); // وزن عالي للمرادفات المباشرة
                });
            }
        }
        
        // البحث العكسي في المرادفات
        for (const [key, synonyms] of Object.entries(SemanticBrain)) {
            synonyms.forEach(syn => {
                const normalizedSyn = advancedNormalize(syn);
                if (normalizedSyn === token || normalizedSyn.includes(token)) {
                    expanded.add(advancedNormalize(key));
                    synonyms.forEach(s => {
                        expanded.add(advancedNormalize(s));
                        relevanceMap.set(advancedNormalize(s), 0.8);
                    });
                }
            });
        }
    });
    
    return {
        tokens: Array.from(expanded),
        relevanceMap
    };
}

// ==================== 🎯 كشف النية المتقدم ====================
function detectIntent(query) {
    const normalized = advancedNormalize(query);
    const detectedIntents = [];
    
    for (const [intent, config] of Object.entries(IntentPatterns)) {
        for (const pattern of config.patterns) {
            if (normalized.includes(advancedNormalize(pattern))) {
                detectedIntents.push({ 
                    intent, 
                    boost: config.boost, 
                    pattern 
                });
                break;
            }
        }
    }
    
    return detectedIntents;
}

// ==================== 📊 مسافة Levenshtein المحسنة ====================
function smartLevenshtein(s1, s2) {
    const key = `${s1}::${s2}`;
    const cached = IntelligentCache.get(key, 'levenshtein');
    if (cached !== undefined) return cached;
    
    s1 = advancedNormalize(s1);
    s2 = advancedNormalize(s2);
    
    if (s1 === s2) return 0;
    if (s1.length === 0) return s2.length;
    if (s2.length === 0) return s1.length;
    
    const matrix = Array(s2.length + 1).fill(null)
        .map(() => Array(s1.length + 1).fill(0));
    
    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= s2.length; j++) {
        for (let i = 1; i <= s1.length; i++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + cost
            );
        }
    }
    
    const result = matrix[s2.length][s1.length];
    IntelligentCache.set(key, result, 'levenshtein');
    return result;
}

// ==================== 🎲 تشابه Jaro-Winkler ====================
function jaroWinkler(s1, s2) {
    s1 = advancedNormalize(s1);
    s2 = advancedNormalize(s2);
    
    if (s1 === s2) return 1.0;
    
    const len1 = s1.length;
    const len2 = s2.length;
    const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
    
    const s1Matches = new Array(len1).fill(false);
    const s2Matches = new Array(len2).fill(false);
    
    let matches = 0;
    for (let i = 0; i < len1; i++) {
        const start = Math.max(0, i - matchWindow);
        const end = Math.min(i + matchWindow + 1, len2);
        
        for (let j = start; j < end; j++) {
            if (s2Matches[j] || s1[i] !== s2[j]) continue;
            s1Matches[i] = s2Matches[j] = true;
            matches++;
            break;
        }
    }
    
    if (matches === 0) return 0.0;
    
    let transpositions = 0;
    let k = 0;
    for (let i = 0; i < len1; i++) {
        if (!s1Matches[i]) continue;
        while (!s2Matches[k]) k++;
        if (s1[i] !== s2[k]) transpositions++;
        k++;
    }
    
    const jaro = (matches / len1 + matches / len2 + 
                  (matches - transpositions / 2) / matches) / 3;
    
    let prefix = 0;
    for (let i = 0; i < Math.min(len1, len2, 4); i++) {
        if (s1[i] === s2[i]) prefix++;
        else break;
    }
    
    return jaro + prefix * 0.1 * (1 - jaro);
}


/// ==================== 🎯 كشف نوع قاعدة البيانات (نسخة احترافية محدثة) ====================
function detectDatabaseType(database) {
    if (!database || !Array.isArray(database) || database.length === 0) return 'unknown';
    
    const sample = database[0];
    if (!sample) return 'unknown';

    // 1. فحص قاعدة الأنشطة (Standard Format)
    if (sample.text !== undefined && sample.value !== undefined) {
        return 'activities';
    }
    
    // 2. فحص قاعدة المناطق الصناعية
    if (sample.name && (sample.governorate || sample.dependency)) {
        return 'industrial_zones';
    }
    
    // 3. فحص قاعدة القرار 104 (بما في ذلك الحقول العربية والمتداخلة)
    // نتحقق من وجود مسمى "نشاط" و "قطاع" بأي صيغة (عربي/إنجليزي/متداخل)
    const hasActivity = sample.activity || sample.النشاط || (sample.data && sample.data.activity);
    const hasSector = sample.sector || sample.القطاع || sample.قطاع || (sample.data && sample.data.sector);
    
    if (hasActivity && hasSector) {
        return 'decision104';
    }
    
    return 'unknown';
}
// ==================== 🔄 تحويل بيانات المناطق لصيغة موحدة ====================
function normalizeIndustrialZone(zone) {
    return {
        text: zone.name || '',
        value: zone.name || '',
        keywords: [
            zone.name || '',
            zone.governorate || '',
            zone.dependency || '',
            zone.location || '',
            'منطقة صناعية'
        ].filter(Boolean),
        synonyms: [
            advancedNormalize(zone.name || ''),
            advancedNormalize(zone.governorate || ''),
            advancedNormalize(zone.dependency || '')
        ].filter(Boolean),
        // بيانات إضافية
        originalData: zone,
        dataType: 'industrial_zone',
        intent: ['industrial_zone', 'location']
    };
}

// ==================== 🔄 تحويل بيانات القرار 104 (نسخة احترافية محدثة) ====================
function normalizeDecision104(item) {
    // استخراج البيانات بمرونة عالية (Fallback Strategy)
    const activity = item.activity || item.النشاط || (item.data && item.data.activity) || '';
    const sector = item.sector || item.القطاع || item.قطاع || (item.data && item.data.sector) || '';
    const mainSector = item.mainSector || item.القطاع_الرئيسي || item.category || item.الفئة || (item.data && item.data.mainSector) || '';
    const subSector = item.subSector || item.القطاع_الفرعي || (item.data && item.data.subSector) || '';

    // توحيد القطاع للصيغة المختصرة (أ / ب)
    const normalizedSector = sector.toString().includes('أ') || sector.toString().toUpperCase().includes('A') ? 'أ' : 'ب';

    return {
        text: activity,
        value: activity,
        keywords: [
            activity,
            mainSector,
            subSector,
            'قرار 104',
            `قطاع ${normalizedSector}`
        ].filter(Boolean),
        synonyms: [
            advancedNormalize(activity),
            advancedNormalize(mainSector),
            advancedNormalize(subSector)
        ].filter(Boolean),
        // الحفاظ على البيانات الأصلية لضمان عمل دوال العرض (Formatters)
        originalData: item.originalData || item, 
        dataType: 'decision104',
        sector: normalizedSector,
        mainSector: mainSector,
        intent: ['decision', 'sector']
    };
}
// ==================== 🔄 التحويل التلقائي (إضافة صمام أمان) ====================
function autoNormalizeDatabase(database) {
    const dbType = detectDatabaseType(database);
    
    // إذا كانت البيانات مطبعة مسبقاً (تحتوي على حقل dataType)، لا نعدل عليها
    if (database[0] && database[0].dataType) {
        return database;
    }

    switch(dbType) {
        case 'activities':
            return database;
        case 'industrial_zones':
            return database.map(normalizeIndustrialZone);
        case 'decision104':
            return database.map(normalizeDecision104);
        default:
            // بدلاً من التحذير فقط، نعيد البيانات كما هي لتجنب كسر البحث
            console.log("ℹ️ NeuralSearch: Using raw data mode for unique structure");
            return database;
    }
}
// ==================== 🧠 المحرك الرئيسي - NeuralSearch ====================
// أضفنا معامل options للتحكم في سلوك البحث
function NeuralSearch(query, database, options = {}) {
    if (!query || query.trim().length < 1) {
        return { results: [], suggestion: null, stats: {} };
    }
    
    const startTime = performance.now();
    
    // 🆕 تطبيع تلقائي لقاعدة البيانات حسب نوعها
    const normalizedDatabase = autoNormalizeDatabase(database);
    const dbType = detectDatabaseType(database);
    
    // تخصيص مفتاح الذاكرة بناءً على الخيارات ونوع القاعدة
    // في neural_search_v6.js
        const scope = options.cacheScope || 'global';
        const cacheKey = `${dbType}_${scope}_${advancedNormalize(query)}${options.exclude ? "_" + options.exclude.join('') : ""}`;
    const cached = IntelligentCache.get(cacheKey);
    if (cached) {
        console.log(`⚡ نتائج من الذاكرة المؤقتة (${dbType})`);
        return cached;
    }
    
    // إرسال كلمات الاستبعاد إلى المحلل اللغوي
    const queryData = intelligentTokenize(query, options.exclude || []);
    const detectedIntents = detectIntent(query);
    const { tokens: expandedTokens, relevanceMap } = semanticExpansion(queryData.tokens);
    
    console.log('🧠 التحليل الذكي:', {
        tokensOriginal: queryData.tokens,
        tokensExpanded: expandedTokens.length,
        intents: detectedIntents
    });
    
    // 2️⃣ تسجيل كل نشاط بنظام متطور (يدعم جميع أنواع القواعد)
    const scoredActivities = normalizedDatabase.map(activity => {
        let score = 0;
        const matches = [];
        
        const normalizedText = advancedNormalize(activity.text);
        const allKeywords = (activity.keywords || []).map(k => advancedNormalize(k));
        const allSynonyms = (activity.synonyms || []).map(s => advancedNormalize(s));
        
        // ⭐ 1. تطابق تام (أعلى أولوية)
        if (normalizedText === queryData.normalized) {
            score += 10000;
            matches.push({ type: 'exact_match', score: 10000, emoji: '🎯' });
        }
        
        // ⭐ 2. تطابق العبارة الكاملة
        if (normalizedText.includes(queryData.normalized)) {
            score += 3000;
            matches.push({ type: 'full_phrase', score: 3000, emoji: '📝' });
        }
        
        // ⭐ 3. البداية بالاستعلام (مهم جداً)
        if (normalizedText.startsWith(queryData.normalized)) {
            score += 1500;
            matches.push({ type: 'starts_with', score: 1500, emoji: '▶️' });
        }
        
        // ⭐ 4. تطابق المرادفات
        for (const syn of allSynonyms) {
            if (syn.includes(queryData.normalized) || queryData.normalized.includes(syn)) {
                score += 800;
                matches.push({ type: 'synonym', score: 800, emoji: '🔄' });
                break;
            }
        }
        
        // ⭐ 5. تطابق الكلمات الأصلية (مع أوزان)
        let originalMatches = 0;
        queryData.tokens.forEach(token => {
            if (normalizedText.includes(token)) {
                const weight = token.length > 3 ? 150 : 100;
                score += weight;
                originalMatches++;
                matches.push({ type: 'token_text', token, score: weight, emoji: '🔤' });
            }
            else if (allKeywords.some(kw => kw.includes(token) || token.includes(kw))) {
                score += 80;
                originalMatches++;
                matches.push({ type: 'token_keyword', token, score: 80, emoji: '🔑' });
            }
        });
        
        // ⭐ 6. تطابق دلالي (الذكاء الاصطناعي المحلي)
        let semanticMatches = 0;
        expandedTokens.forEach(token => {
            if (normalizedText.includes(token)) {
                const relevance = relevanceMap.get(token) || 0.5;
                const weight = Math.round(120 * relevance);
                score += weight;
                semanticMatches++;
                matches.push({ type: 'semantic', token, score: weight, emoji: '🧬' });
            }
            else if (allKeywords.some(kw => kw.includes(token))) {
                const relevance = relevanceMap.get(token) || 0.5;
                const weight = Math.round(60 * relevance);
                score += weight;
                semanticMatches++;
                matches.push({ type: 'semantic_keyword', token, score: weight, emoji: '🔬' });
            }
        });
        
        // ⭐ 7. مكافأة الاكتمال (كل الكلمات موجودة)
        if (queryData.tokens.length > 1 && originalMatches === queryData.tokens.length) {
            score += 500;
            matches.push({ type: 'completeness', score: 500, emoji: '✅' });
        }
        
        // ⭐ 8. BiGrams و TriGrams
        [...queryData.biGrams, ...queryData.triGrams].forEach(gram => {
            if (normalizedText.includes(gram)) {
                score += 200;
                matches.push({ type: 'ngram', gram, score: 200, emoji: '🔗' });
            }
        });
        
        // ⭐ 9. مطابقة النية
        detectedIntents.forEach(({ intent, boost }) => {
            if (activity.intent && activity.intent.includes(intent)) {
                score *= boost;
                matches.push({ type: 'intent', intent, multiplier: boost, emoji: '🎭' });
            }
        });
        
        // ⭐ 10. تطابق تقريبي (Fuzzy)
        if (score < 100 && queryData.normalized.length > 3) {
            const fuzzyMatches = [normalizedText, ...allKeywords].filter(text => {
                const similarity = jaroWinkler(queryData.normalized, text);
                return similarity > 0.82;
            });
            
            if (fuzzyMatches.length > 0) {
                score += 150;
                matches.push({ type: 'fuzzy', score: 150, emoji: '🎲' });
            }
        }
        
        // ⭐ 11. تصحيح إملائي ذكي
        if (score < 80 && queryData.normalized.length > 3) {
            const distance = smartLevenshtein(queryData.normalized, normalizedText);
            const maxDistance = Math.floor(queryData.normalized.length * 0.35);
            
            if (distance <= maxDistance && distance > 0) {
                const correctionScore = Math.max(100 - (distance * 20), 30);
                score += correctionScore;
                matches.push({ type: 'spelling', distance, score: correctionScore, emoji: '📝' });
            }
        }
        
        // ⭐ 12. وزن الشعبية والاستخدام
        const popularityWeight = activity.searchWeight || 1.0;
        const userPreference = IntelligentCache.get(activity.value, 'userBehavior') || 1.0;
        score *= (popularityWeight * userPreference);
        
        return {
            ...activity,
            finalScore: Math.round(score),
            matches,
            matchTypes: matches.length,
            semanticScore: semanticMatches,
            originalScore: originalMatches,
            relevance: score > 0 ? Math.min((score / 1000), 10).toFixed(1) : 0
        };
    });
    
    // 3️⃣ ترشيح وترتيب النتائج
    // 3️⃣ ترشيح وترتيب النتائج مع نظام العتبة الذكية (Smart Threshold)
    let finalResults = scoredActivities
        .filter(activity => activity.finalScore >= (options.minScore || 30))
        .sort((a, b) => {
            if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
            if (b.matchTypes !== a.matchTypes) return b.matchTypes - a.matchTypes;
            return a.text.localeCompare(b.text, 'ar');
        });

    // [تعديل مرن] حذف التشتت فقط إذا كانت النتائج كثيرة جداً مع الحفاظ على أفضل 5 نتائج دائماً
    if (finalResults.length > 5 && finalResults[0].finalScore > 900) {
        const topScore = finalResults[0].finalScore;
        // سنسمح بهامش أوسع (20% بدلاً من 40%) وسنضمن بقاء أول 5 نتائج دائماً لإعطاء خيارات للمستخدم
        finalResults = finalResults.filter((r, index) => index < 5 || (r.finalScore / topScore) > 0.2); 
    }
    
    // 4️⃣ اقتراح ذكي عند عدم وجود نتائج
    let suggestion = null;
    let suggestions = [];
    
    if (finalResults.length === 0 && queryData.normalized.length > 2) {
        suggestions = database
            .map(activity => ({
                text: activity.text,
                value: activity.value,
                similarity: jaroWinkler(queryData.normalized, advancedNormalize(activity.text))
            }))
            .filter(s => s.similarity > 0.55)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3);
        
        if (suggestions.length > 0) {
            suggestion = suggestions[0];
        }
    }
    
    const endTime = performance.now();
    
    const result = {
        results: finalResults.slice(0, 12),
        suggestion,
        suggestions,
        stats: {
            executionTime: `${(endTime - startTime).toFixed(2)}ms`,
            totalScored: scoredActivities.length,
            resultsFound: finalResults.length,
            intentsDetected: detectedIntents.length,
            tokensOriginal: queryData.tokens.length,
            tokensExpanded: expandedTokens.length,
            semanticMatches: finalResults.reduce((sum, r) => sum + r.semanticScore, 0),
            cached: false
        }
    };
    
    // 🆕 حفظ في نظام السياق
    ContextManager.addQuery(query, dbType, finalResults);
    
    // 🆕 إضافة معلومات السياق للنتيجة
    const contextAnalysis = ContextManager.isRelatedToContext(query, dbType);
    result.contextInfo = {
        isRelatedToPrevious: contextAnalysis.related,
        relationshipStrength: contextAnalysis.strength,
        relationshipType: contextAnalysis.relationshipType,
        previousContext: contextAnalysis.context
    };
    
    // حفظ في الذاكرة المؤقتة
    IntelligentCache.set(cacheKey, result);
    
    return result;
}

// ==================== 🎨 تمييز النص المطابق ====================
function highlightMatch(text, query) {
    if (!query) return text;
    
    const queryData = intelligentTokenize(query);
    let highlighted = text;
    
    // تمييز الكلمات الأصلية
    queryData.tokens.forEach(token => {
        const safeToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\            tokensExp');
        try {
            const regex = new RegExp(`(${safeToken})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark class="highlight-primary">$1</mark>');
        } catch(e) {
            // تجاهل الأخطاء
        }
    });
    
    return highlighted;
}

// ==================== 🚀 دالة التكامل الرئيسية ====================
function initializeNeuralSearch(searchInputId, resultsContainerId, selectId, database) {
    const searchInput = document.getElementById(searchInputId);
    const resultsContainer = document.getElementById(resultsContainerId);
    const activitySelect = document.getElementById(selectId);
    
    if (!searchInput || !resultsContainer) {
        console.error('❌ عناصر البحث غير موجودة');
        return;
    }
    
    if (!database || database.length === 0) {
        console.error('❌ قاعدة البيانات فارغة');
        return;
    }
    
    // إضافة أنماط CSS للنتائج
    injectSearchStyles();
    
    let searchTimeout;
    let currentQuery = '';
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        currentQuery = query;
        
        if (!query) {
            resultsContainer.style.display = 'none';
            return;
        }
        
        // تأخير ذكي (150ms)
        searchTimeout = setTimeout(() => {
            // استدعاء المحرك الذكي
            const { results, suggestion, suggestions, stats } = NeuralSearch(query, database);
            
            // طباعة إحصائيات في الكونسول
            console.log('🔍 NeuralSearch Stats:', stats);
            
            renderResults(results, suggestion, suggestions, query, searchInput, resultsContainer, activitySelect);
        }, 150);
    });
    
    // إخفاء النتائج عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
    
    // إظهار النتائج عند التركيز
    searchInput.addEventListener('focus', () => {
        if (currentQuery && resultsContainer.children.length > 0) {
            resultsContainer.style.display = 'block';
        }
    });
    
    console.log('✅ NeuralSearch v6.0 initialized successfully!');
}

// ==================== 🎨 رندر النتائج بأسلوب ثوري ====================
function renderResults(results, suggestion, suggestions, query, searchInput, container, selectElement) {
    container.innerHTML = '';
    container.style.display = 'block';
    
    if (results.length > 0) {
        // عرض النتائج
        results.forEach((result, index) => {
            const div = document.createElement('div');
            div.className = `search-result-item ${index === 0 ? 'top-result' : ''}`;
            
            // حساب مؤشرات الجودة
            const confidencePercent = Math.min(Math.round((result.finalScore / 100)), 99);
            const isHighConfidence = confidencePercent >= 70;
            const isMediumConfidence = confidencePercent >= 40 && confidencePercent < 70;
            
            // أيقونات حسب نوع التطابق
            const matchEmojis = [...new Set(result.matches.slice(0, 3).map(m => m.emoji))].join(' ');
            
            div.innerHTML = `
                <div class="result-header">
                    <div class="result-text">
                        ${index === 0 ? '<span class="best-match">🏆</span>' : ''}
                        ${highlightMatch(result.text, query)}
                    </div>
                    <div class="result-meta">
                        <span class="confidence ${isHighConfidence ? 'high' : isMediumConfidence ? 'medium' : 'low'}">
                            ${confidencePercent}%
                        </span>
                    </div>
                </div>
                <div class="result-footer">
                    <span class="match-types">${matchEmojis} ${result.matchTypes} تطابق</span>
                    ${result.semanticScore > 0 ? `<span class="semantic-badge">🧠 ذكاء دلالي</span>` : ''}
                    ${index === 0 && isHighConfidence ? '<span class="recommended">⭐ موصى به</span>' : ''}
                </div>
            `;
            
            // التفاعل مع النتيجة
            div.addEventListener('click', () => selectResult(result, searchInput, container, selectElement));
            
            container.appendChild(div);
        });
        
        // إضافة تلميح في النهاية
        const hint = document.createElement('div');
        hint.className = 'search-hint';
        hint.innerHTML = `
            <div style="text-align: center; padding: 8px; color: #666; font-size: 0.75rem;">
                💡 عثرت على ${results.length} نتيجة في ${results[0].finalScore > 1000 ? 'أقل من' : 'حوالي'} 0.1 ثانية
            </div>
        `;
        container.appendChild(hint);
        
    } else {
        // لا توجد نتائج - اقتراحات ذكية
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        
        if (suggestion) {
            noResults.innerHTML = `
                <div class="no-results-icon">🤔</div>
                <div class="no-results-title">لم أجد تطابقاً تاماً</div>
                <div class="no-results-subtitle">لكن ربما تقصد:</div>
                <div class="suggestions">
                    ${suggestions.slice(0, 3).map((s, i) => `
                        <div class="suggestion-item" data-value="${s.value}" data-text="${s.text}">
                            <span class="suggestion-icon">${i === 0 ? '🎯' : '💡'}</span>
                            <span class="suggestion-text">${s.text}</span>
                            <span class="suggestion-similarity">${Math.round(s.similarity * 100)}%</span>
                        </div>
                    `).join('')}
                </div>
                <div class="search-tips">
                    <div class="tip-title">💭 نصائح البحث:</div>
                    <div class="tip-item">• جرب كلمات أبسط (مثل: مخزن، علاج، مصنع)</div>
                    <div class="tip-item">• تأكد من الإملاء الصحيح</div>
                    <div class="tip-item">• استخدم كلمات عربية أو إنجليزية</div>
                </div>
            `;
            
            // ربط الاقتراحات
            setTimeout(() => {
                noResults.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        searchInput.value = item.dataset.text;
                        searchInput.dispatchEvent(new Event('input'));
                    });
                });
            }, 10);
            
        } else if (query.length > 1) {
            noResults.innerHTML = `
                <div class="no-results-icon">😕</div>
                <div class="no-results-title">لم أجد أي نتائج مطابقة</div>
                <div class="no-results-subtitle">حاول البحث بطريقة مختلفة</div>
                <div class="search-examples">
                    <div class="example-title">أمثلة للبحث:</div>
                    <div class="example-tags">
                        <span class="example-tag">تخزين</span>
                        <span class="example-tag">مصنع</span>
                        <span class="example-tag">مطعم</span>
                        <span class="example-tag">صيدلية</span>
                        <span class="example-tag">سياحة</span>
                    </div>
                </div>
            `;
            
            // ربط الأمثلة
            setTimeout(() => {
                noResults.querySelectorAll('.example-tag').forEach(tag => {
                    tag.addEventListener('click', () => {
                        searchInput.value = tag.textContent;
                        searchInput.dispatchEvent(new Event('input'));
                    });
                });
            }, 10);
        } else {
            container.style.display = 'none';
            return;
        }
        
        container.appendChild(noResults);
    }
}

// ==================== ✅ اختيار النتيجة ====================
function selectResult(result, searchInput, container, selectElement) {
    searchInput.value = result.text;
    container.style.display = 'none';
    
    if (selectElement) {
        selectElement.value = result.value;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // تعلم من سلوك المستخدم
    const currentWeight = IntelligentCache.get(result.value, 'userBehavior') || 1.0;
    IntelligentCache.set(result.value, Math.min(currentWeight * 1.15, 2.5), 'userBehavior');
    
    // استدعاء دوال خارجية إذا كانت موجودة
    if (typeof selectActivityType === 'function') {
        selectActivityType(result.value, result.text);
    }
    
    console.log('✅ تم اختيار:', result.text);
}

// ==================== 🎨 حقن أنماط CSS ====================
function injectSearchStyles() {
    if (document.getElementById('neural-search-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'neural-search-styles';
    style.textContent = `
        .search-result-item {
            padding: 12px 16px;
            margin: 4px 0;
            cursor: pointer;
            border-radius: 8px;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }
        
        .search-result-item:hover {
            background: #f8f9fa;
            border-color: #2196f3;
            transform: translateX(-4px);
            box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
        }
        
        .search-result-item.top-result {
            background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
            border: 2px solid #4caf50;
            font-weight: 500;
        }
        
        .search-result-item.top-result:hover {
            background: linear-gradient(135deg, #c8e6c9 0%, #e8f5e9 100%);
        }
        
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 6px;
        }
        
        .result-text {
            flex: 1;
            color: #2c3e50;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        .best-match {
            margin-left: 6px;
            font-size: 1.1rem;
        }
        
        .highlight-primary {
            background: linear-gradient(120deg, #fff3cd 0%, #fffbea 100%);
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: 600;
            color: #856404;
        }
        
        .result-meta {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .confidence {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 700;
            white-space: nowrap;
        }
        
        .confidence.high {
            background: #d4edda;
            color: #155724;
        }
        
        .confidence.medium {
            background: #fff3cd;
            color: #856404;
        }
        
        .confidence.low {
            background: #f8d7da;
            color: #721c24;
        }
        
        .result-footer {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            font-size: 0.7rem;
        }
        
        .match-types {
            color: #666;
        }
        
        .semantic-badge, .recommended {
            padding: 2px 8px;
            border-radius: 10px;
            font-weight: 600;
        }
        
        .semantic-badge {
            background: #e3f2fd;
            color: #1565c0;
        }
        
        .recommended {
            background: #fff9c4;
            color: #f57f17;
        }
        
        .no-results {
            padding: 24px;
            text-align: center;
        }
        
        .no-results-icon {
            font-size: 3rem;
            margin-bottom: 12px;
        }
        
        .no-results-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
        }
        
        .no-results-subtitle {
            color: #666;
            margin-bottom: 16px;
        }
        
        .suggestions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 16px 0;
        }
        
        .suggestion-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .suggestion-item:hover {
            background: #e3f2fd;
            border-color: #2196f3;
            transform: scale(1.02);
        }
        
        .suggestion-icon {
            font-size: 1.2rem;
        }
        
        .suggestion-text {
            flex: 1;
            font-weight: 500;
            color: #2c3e50;
            text-align: right;
        }
        
        .suggestion-similarity {
            background: #2196f3;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: 700;
        }
        
        .search-tips, .search-examples {
            margin-top: 20px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            text-align: right;
        }
        
        .tip-title, .example-title {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .tip-item {
            color: #666;
            margin: 6px 0;
            font-size: 0.85rem;
        }
        
        .example-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
        }
        
        .example-tag {
            padding: 6px 14px;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.85rem;
            color: #495057;
        }
        
        .example-tag:hover {
            background: #2196f3;
            color: white;
            border-color: #2196f3;
            transform: translateY(-2px);
            box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
        }
        
        .search-hint {
            border-top: 1px solid #e0e0e0;
            margin-top: 8px;
            padding-top: 8px;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .search-result-item {
            animation: slideIn 0.3s ease-out;
        }
    `;
    
    document.head.appendChild(style);
}

// ==================== 📤 التصدير ====================
// يمكن استخدامها مباشرة أو من خلال window
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NeuralSearch,
        initializeNeuralSearch,
        advancedNormalize,
        intelligentTokenize,
        semanticExpansion,
        IntelligentCache,
        ContextManager,
        detectDatabaseType,
        normalizeIndustrialZone,
        normalizeDecision104
    };
}
// إتاحة عالمياً
// إتاحة عالمياً
window.NeuralSearch = NeuralSearch;
window.initializeNeuralSearch = initializeNeuralSearch;
window.IntelligentCache = IntelligentCache;
window.ContextManager = ContextManager;
window.detectDatabaseType = detectDatabaseType;
window.normalizeIndustrialZone = normalizeIndustrialZone;
window.normalizeDecision104 = normalizeDecision104;