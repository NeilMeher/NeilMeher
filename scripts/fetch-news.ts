import admin from 'firebase-admin';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

// --- Configuration ---

// Initialize Firebase Admin
// In GitHub Actions, we'll pass the service account as a JSON string env var
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;
let app;

if (!admin.apps.length) {
    if (serviceAccountKey) {
        // Production / GitHub Action environment
        const serviceAccount = JSON.parse(serviceAccountKey);
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        // Local environment - use service account file from project root
        const { fileURLToPath } = await import('url');
        const path = await import('path');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');

        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath)
        });
    }
} else {
    app = admin.app();
}

const db = admin.firestore();

// --- Types ---

interface NewsArticle {
    title: string;
    description?: string;
    content?: string;
    link: string;
    source_id: string;
    image_url?: string | null;
    pubDate: string;
}

interface FirestoreNewsDoc {
    sourceHeadline: string;
    sourceDescription: string;
    genZHeadline: string;
    bullets: string[];
    sourceUrl: string;
    sourceName: string;
    category: string;
    imageUrl: string | null;
    timestamp: admin.firestore.Timestamp;
    reactions: {
        W: number;
        mid: number;
        cooked: number;
        cap: number;
    };
}

const CATEGORIES = ["technology", "business", "science", "health", "world"];

// --- Logic ---

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchFromNewsData(category: string): Promise<NewsArticle[]> {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
        console.error("❌ NEWS_API_KEY is not set");
        return [];
    }

    console.log(`📡 Fetching category: ${category}...`);
    try {
        const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&category=${category}&language=en`;
        const response = await fetch(url);

        if (!response.ok) {
            const txt = await response.text();
            console.error(`❌ NewsData Error (${category}): ${response.status} - ${txt}`);
            return [];
        }

        const data = (await response.json()) as { results: NewsArticle[], status: string };
        if (data.status !== 'success' || !data.results) {
            console.warn(`warning: NewsData returned status ${data.status}`);
            return [];
        }

        return data.results.filter(a => a.link && a.title);
    } catch (e) {
        console.error(`❌ Exception fetching ${category}:`, e);
        return [];
    }
}

async function processWithGroq(article: NewsArticle): Promise<{ genZHeadline: string; bullets: string[] } | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const systemPrompt = `you rewrite news for slingshot news in gen z slang. rules: lowercase headlines, use slang (cooked, ate, mid, cap, no cap, delulu, its giving, hits different, sus, periodt, L + ratio, be so fr, brat, unc status), emojis (💀 😭 🔥 🫠 🙄 🧢 ✨ 🙃), facts stay accurate, show both sides, 4-5 bullet points explaining the story. output ONLY json: {genZHeadline: string, bullets: array of strings}`;
    const userPrompt = `Headline: ${article.title}\nDescription: ${article.description || article.content}`;

    const body = {
        model: "llama-3.1-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
    };

    let retries = 0;
    while (retries < 3) {
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                if (res.status === 429) {
                    await delay(2000 * (retries + 1));
                    retries++;
                    continue;
                }
                const txt = await res.text();
                // console.error(`Groq error: ${txt}`);
                return null;
            }

            const data = (await res.json()) as any;
            const content = data.choices[0].message.content;
            return JSON.parse(content);

        } catch (e) {
            retries++;
            await delay(1000);
        }
    }
    return null;
}

// --- Main Runner ---

async function run() {
    console.log("🚀 Starting News Fetcher...");

    for (const category of CATEGORIES) {
        const articles = await fetchFromNewsData(category);

        let batch = db.batch();
        let ops = 0;

        for (const article of articles) {
            // Check duplicate
            const exists = await db.collection("news")
                .where("sourceUrl", "==", article.link)
                .limit(1)
                .get();

            if (!exists.empty) {
                console.log(`⏭️ Skipping duplicate: ${article.title.substring(0, 30)}...`);
                continue;
            }

            const processed = await processWithGroq(article);
            if (!processed) {
                console.log(`⚠️ Groq failed for: ${article.title.substring(0, 30)}...`);
                continue;
            }

            const newsRef = db.collection("news").doc();
            const newsDoc: FirestoreNewsDoc = {
                sourceHeadline: article.title,
                sourceDescription: article.description || article.content || "",
                genZHeadline: processed.genZHeadline,
                bullets: processed.bullets,
                sourceUrl: article.link,
                sourceName: article.source_id,
                category: category,
                imageUrl: article.image_url || null,
                timestamp: admin.firestore.Timestamp.now(),
                reactions: { W: 0, mid: 0, cooked: 0, cap: 0 }
            };

            batch.set(newsRef, newsDoc);
            ops++;
            console.log(`✅ Processed: ${processed.genZHeadline}`);

            if (ops >= 400) {
                await batch.commit();
                batch = db.batch();
                ops = 0;
            }
        }

        if (ops > 0) await batch.commit();
    }
    console.log("🏁 Done.");
}

run().catch(console.error);
