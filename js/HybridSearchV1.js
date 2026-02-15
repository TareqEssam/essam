/****************************************************************************
 * 🧠 HybridSearchEngine V8 - REAL SEMANTIC FIX
 * 
 * ✅ الحل الحقيقي: تطبيع النص العربي قبل التحويل لـ vectors
 * ✅ إزالة الاعتماد على regex للكلمات الفردية
 * ✅ السماح للمحرك الدلالي بالعمل بشكل حقيقي
 ****************************************************************************/

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

env.allowLocalModels = false;
env.useBrowserCache = true;

class HybridSearchEngine {
    constructor() {
        this.embedder = null;
        this.databases = {
            activities: [],
            areas: [],
            decision104: []
        };
        this.intentSignatures = {};
        this.isReady = false;
            this.activeContextName = null; // لتخزين اسم النشاط أو المنطقة الحالية دلالياً
        
        this.intentThreshold = 0.28;
        this.multiIntentThreshold = 0.24;
    }

    /**
     * 🔧 تطبيع النص العربي - الحل الحقيقي!
     * يوحد الهمزات والحروف المتشابهة
     */
    normalizeArabicText(text) {
        if (!text) return '';
        
        return text
            // توحيد الهمزات
            .replace(/[إأآا]/g, 'ا')
            .replace(/[ىي]/g, 'ي')
            // توحيد التاء المربوطة والهاء
            .replace(/ة/g, 'ه')
            // إزالة التشكيل
            .replace(/[\u0617-\u061A\u064B-\u0652]/g, '')
            // إزالة الكشيدة
            .replace(/ـ/g, '')
            // توحيد المسافات
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    /**
     * Decode Base64-encoded vector to Float32Array
     */
    decodeVector(base64String) {
        try {
            const binaryString = atob(base64String);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
            return Array.from(new Float32Array(bytes.buffer));
        } catch (error) {
            console.error("Vector Decode Failed:", error);
            return null;
        }
    }

    async initialize() {
        if (this.isReady) return;
        console.log("⏳ Initializing E5 Hybrid Search Engine...");
        
        try {
            this.embedder = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
            
            const res = await fetch('./js/vector_knowledge_db.json');
            if (!res.ok) throw new Error("فشل تحميل قاعدة البيانات الموحدة");
            const fullData = await res.json();

            this.databases.activities = this.normalizeData(fullData.activities);
            this.databases.areas = this.normalizeData(fullData.areas);
            this.databases.decision104 = this.normalizeData(fullData.decision104);

            console.log(`✅ Loaded: activities(${this.databases.activities.length}), areas(${this.databases.areas.length}), decision104(${this.databases.decision104.length})`);

            if (this.databases.activities.length > 0 && this.databases.activities[0].vector) {
                console.log(`📊 Sample vector: [${this.databases.activities[0].vector.slice(0, 3).map(v => v.toFixed(4)).join(', ')}...] (length: ${this.databases.activities[0].vector.length})`);
            }

            // 🔧 تطبيع التوقيعات الدلالية
            this.intentSignatures = {
                activities: await this.embed('أنشطة صناعية تراخيص تشغيل متطلبات'),
                areas: await this.embed('مناطق صناعية مواقع جغرافية'),
                decision104: await this.embed('إعفاءات ضريبية حوافز استثمارية قرار 104')
            };

            this.isReady = true;
            console.log("✅ E5 Hybrid Search Engine ready!");
            
        } catch (error) {
            console.error("❌ Initialization failed:", error);
            throw error;
        }
    }
     

     // ✨ اضف الدالة الجديدة هنا بمشرط الجراح ✨
    updateContextToken(context) {
        if (!context || !context.data) {
            this.activeContextName = null;
            return;
        }
        // استخراج الاسم سواء كان نشاطاً (text) أو منطقة (name)
        const contextName = context.data.text || context.data.name || "";
        this.activeContextName = contextName;
        console.log("🧠 تم تحديث الوعي الدلالي بالسياق الحالي:", contextName);
    }

    normalizeData(items) {
        if (!Array.isArray(items)) return [];

    normalizeData(items) {
        if (!Array.isArray(items)) return [];
        
        return items.map(item => ({
            id: item.id,
            vector: this.decodeVector(item.vector),
            text: item.content["الاسم"] || 
                  item.content["النشاط_المحدد"] || 
                  item.content["اسم_المنطقة"] || 
                  "بيانات صناعية", 
            original_data: item.content 
        })).filter(i => i.vector !== null);
    }

    /**
     * 🔧 تطبيع النص قبل التحويل لـ vector
     */
    async embed(text) {
        if (!this.embedder) throw new Error("Embedder not initialized");
        
        // 🔧 تطبيع النص العربي أولاً
        const normalizedText = this.normalizeArabicText(text);
        
        const cleanText = normalizedText.replace(/^(query:|passage:)\s*/, '');
        const queryText = `query: ${cleanText}`;
        
        const output = await this.embedder(queryText, { 
            pooling: 'mean', 
            normalize: true 
        });
        
        return Array.from(output.data);
    }

    similarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) {
            return 0;
        }
        
        let dot = 0, normA = 0, normB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dot += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        if (normA === 0 || normB === 0) return 0;
        
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async prepareQuery(query) {
        // نستخدم السياق المخزن محلياً في المحرك أو نجلب من الذاكرة كاحتياط
        const contextName = this.activeContextName || 
                           (window.AgentMemory?.getContext()?.data?.text || window.AgentMemory?.getContext()?.data?.name);
        
        let enhancedQuery = query;

        // التحقق من الكلمات الدلالية التي تشير إلى أن المستخدم يكمل حديثه
        const isFollowUp = /^(ما|هي|هو|كم|اين|فين|شروط|حوافز|تراخيص|قرار|ده|دي|موقع|تبعيه|ولايه)/i.test(query.trim());
        
        if (isFollowUp && contextName) {
            // دمج السياق دلالياً لتحسين فهم vector السؤال
            enhancedQuery = `query: ${query} context: ${contextName}`; 
            console.log("🧠 تم تعزيز الاستعلام دلالياً بالسياق:", contextName);
        }
        return enhancedQuery;
    }

    /**
     * 🎯 تصنيف النية - الآن يعتمد بشكل أساسي على المحرك الدلالي
     * regex فقط للحالات الواضحة جداً
     */
    async classifyIntent(query, queryVector) {
        const q = this.normalizeArabicText(query);
        
        // Hard keyword routing - فقط للحالات الواضحة جداً
        // 🔧 تقليل الاعتماد على regex - فقط للكلمات الفريدة
        if (q.match(/قرار\s*104/)) return ['decision104'];  // فقط "قرار 104" المحدد
        if (q.match(/(فدان|متر|كيلو)/)) return ['areas'];   // فقط وحدات القياس
        if (q.match(/(كود|رمز)/)) return ['activities'];      // فقط الكود والرمز
        
        // 🔧 الاعتماد الأساسي على المحرك الدلالي
        const scores = [];
        for (const [dbName, signature] of Object.entries(this.intentSignatures)) {
            const score = this.similarity(signature, queryVector);
            scores.push({ database: dbName, confidence: score });
        }
        scores.sort((a, b) => b.confidence - a.confidence);

        console.log("📊 Intent Scores:", scores.map(s => 
            `${s.database}: ${Math.round(s.confidence * 100)}%`
        ).join(' | '));

        // 🔧 خفض العتبة إلى 0.30 لزيادة الثقة في المحرك الدلالي
        if (scores[0].confidence > 0.30) {
            console.log(`✅ Semantic routing to [${scores[0].database}] with ${Math.round(scores[0].confidence * 100)}% confidence`);
            return [scores[0].database];
        }
        
        // إذا كانت الفروق صغيرة، ابحث في القاعدتين الأعلى
        if (scores[0].confidence - scores[1].confidence < 0.10) {
            console.log(`⚖️ Close scores, searching top 2: [${scores[0].database}, ${scores[1].database}]`);
            return [scores[0].database, scores[1].database];
        }
        
        return ['activities', 'decision104', 'areas']; // Fallback
    }

    rerankRRF(vectorResults, keywordResults, k = 60) {
        const scores = new Map();

        vectorResults.forEach((res, index) => {
            const rrfScore = 1.0 / (k + index + 1);
            scores.set(res.id, { 
                rrfScore: rrfScore,
                cosineScore: res.score,
                score: rrfScore,
                data: res.data, 
                source: 'vector' 
            });
        });

        keywordResults.forEach((res, index) => {
            const rrfScore = 1.0 / (k + index + 1);
            if (scores.has(res.id)) {
                const existing = scores.get(res.id);
                existing.score += rrfScore;
                existing.rrfScore += rrfScore;
                existing.source = 'hybrid';
            } else {
                scores.set(res.id, { 
                    rrfScore: rrfScore,
                    cosineScore: 0,
                    score: rrfScore, 
                    data: res.data, 
                    source: 'keyword' 
                });
            }
        });

        return Array.from(scores.entries())
            .map(([id, val]) => ({ id, ...val }))
            .sort((a, b) => b.score - a.score);
    }

    vectorSearch(queryVector, database, topK = 15) {
        const results = [];
        
        for (const item of database) {
            if (!item.vector || !Array.isArray(item.vector)) continue;
            
            const score = this.similarity(queryVector, item.vector);
            results.push({
                id: item.id,
                score: score,
                data: item
            });
        }
        
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }

    /**
     * 🔧 تطبيع النص في البحث الكلماتي أيضاً
     */
    keywordScore(query, item) {
        // 🔧 تطبيع النص قبل البحث
        const queryNormalized = this.normalizeArabicText(query);
        
        const d = item.original_data;
        const searchableText = this.normalizeArabicText([
            item.text,
            d["النشاط_الرئيسي"],
            d["القطاع_العام"],
            d["جهة_الولاية"],
            d["المحافظة"],
            d["التبعية"],
            d["الجهة"],
            d["وصف"],
            d["النشاط"]
        ].filter(Boolean).join(' '));
        
        const tokens = queryNormalized
            .replace(/[^\u0600-\u06FF\u0660-\u0669\w\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 2);
        
        if (tokens.length === 0) return 0;
        
        let matches = 0;
        for (const token of tokens) {
            if (searchableText.includes(token)) {
                matches++;
            }
        }
        
        return matches / tokens.length;
    }

    async search(query, options = {}) {
        if (!this.isReady) await this.initialize();
        
        const { topK = 5 } = options;
        
        console.log(`\n🔍 Query: "${query}"`);
        console.log(`🔧 Normalized: "${this.normalizeArabicText(query)}"`);
        
        const refinedQuery = await this.prepareQuery(query);
        const queryVector = await this.embed(refinedQuery);
        const targetDatabases = await this.classifyIntent(refinedQuery, queryVector);
        
        let allResults = [];
        
        for (const dbName of targetDatabases) {
            const db = this.databases[dbName];
            if (!db || db.length === 0) {
                console.warn(`⚠️ Empty: ${dbName}`);
                continue;
            }
            
            console.log(`🔎 Searching [${dbName}] (${db.length} items)...`);
            
            const vectorResults = this.vectorSearch(queryVector, db, 20);
            
            const keywordResults = db
                .map(item => ({
                    id: item.id,
                    score: this.keywordScore(refinedQuery, item),
                    data: item
                }))
                .filter(r => r.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 20);
            
            const combined = this.rerankRRF(vectorResults, keywordResults);
            combined.forEach(r => r.dbName = dbName);
            
            allResults.push(...combined);
        }
        
        const sortedResults = allResults.sort((a, b) => b.score - a.score);
        const finalResults = sortedResults.slice(0, topK);
        
        console.log(`✅ Found ${finalResults.length} results (from ${allResults.length})`);
        if (finalResults.length > 0) {
            const top = finalResults[0];
            console.log(`🏆 ${top.id} - Cosine: ${Math.round((top.cosineScore || 0) * 100)}% | RRF: ${Math.round(top.score * 100)}% [${top.dbName}]`);
        }
        
        const topCosineScore = finalResults[0]?.cosineScore || 0;

        return {
            query: query,
            intent: finalResults[0]?.dbName,
            topMatch: finalResults[0] ? {
                id: finalResults[0].id,
                dbName: finalResults[0].dbName,
                score: finalResults[0].cosineScore || 0,
                data: finalResults[0].data
            } : null,
            results: finalResults.map(r => ({
                ...r,
                full_report: r.data.original_data
            })),
            confidence: topCosineScore,
            metadata: { generated_at: new Date().toISOString(), total_found: allResults.length }
        };
    }
}

export const hybridEngine = new HybridSearchEngine();
window.hybridEngine = hybridEngine; // هذا السطر هو "الجسر" الذي يحتاجه gpt_agent.js
