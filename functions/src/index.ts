import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
// Initialize Firebase
admin.initializeApp();
const db = admin.firestore();

// --- Interfaces ---

interface NewsArticle {
    sourceHeadline: string;
    sourceDescription: string;
    sourceUrl: string;
    sourceName: string;
    urlToImage?: string | null;
    publishedAt: string;
}

interface FirestoreNewsDoc {
    id?: string;
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

// --- Environment Variables ---
// Ensure these are set in functions/.env
// NEWS_API_KEY
// GROQ_API_KEY

// Use NewsData.io categories
const CATEGORIES = ["technology", "business", "science", "health", "world"];

// --- Helper Functions ---

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchFromNewsAPI(category: string): Promise<NewsArticle[]> {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
        console.error("NEWS_API_KEY is not set");
        return [];
    }

    try {
        // NewsData.io API (matches the pub_ key format)
        const response = await fetch(
            `https://newsdata.io/api/1/latest?apikey=${apiKey}&category=${category}&language=en`
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`NewsData.io error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json() as { results: any[] };
        if (!data.results) {
            console.warn(`No results for category ${category}`);
            return [];
        }

        return data.results.map((article: any) => ({
            sourceHeadline: article.title,
            sourceDescription: article.description || article.content || "",
            sourceUrl: article.link,
            sourceName: article.source_id,
            urlToImage: article.image_url,
            publishedAt: article.pubDate,
        })).filter((a: any) => a.sourceUrl && a.sourceHeadline);
    } catch (error) {
        console.error(`Error fetching news for category ${category}:`, error);
        return [];
    }
}

async function processWithGroq(article: NewsArticle): Promise<{ genZHeadline: string; bullets: string[] } | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("GROQ_API_KEY is not set");
        return null;
    }

    const systemPrompt = `you rewrite news for slingshot news in gen z slang. rules: lowercase headlines, use slang (cooked, ate, mid, cap, no cap, delulu, its giving, hits different, sus, periodt, L + ratio, be so fr, brat, unc status), emojis (💀 😭 🔥 🫠 🙄 🧢 ✨ 🙃), facts stay accurate, show both sides, 4-5 bullet points explaining the story. output ONLY json: {genZHeadline: string, bullets: array of strings}`;

    const userPrompt = `Headline: ${article.sourceHeadline}\nDescription: ${article.sourceDescription}\nContent: ${article.sourceDescription}`; // Using description as content proxy if full content unavailable

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
    const maxRetries = 3;

    while (retries <= maxRetries) {
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                if (response.status === 429) {
                    // Rate limit handling
                    const waitTime = Math.pow(2, retries) * 1000;
                    await delay(waitTime);
                    retries++;
                    continue;
                }
                throw new Error(`Groq API error: ${response.statusText}`);
            }

            const data = await response.json() as any;
            const content = data.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error("Error calling Groq API:", error);
            retries++;
            if (retries > maxRetries) return null;
            await delay(1000);
        }
    }
    return null;
}

// --- Cloud Functions ---

export const fetchAndProcessNews = functions.pubsub
    .schedule("every 1 hours")
    .onRun(async (context) => {
        console.log("Starting fetchAndProcessNews...");

        // Process categories sequentially to avoid hitting rate limits too hard
        for (const category of CATEGORIES) {
            console.log(`Processing category: ${category}`);
            const articles = await fetchFromNewsAPI(category);

            const batchSize = 500; // Firestore batch limit
            let batch = db.batch();
            let operationCount = 0;

            for (const article of articles) {
                // Check for duplicates
                const snapshot = await db.collection("news")
                    .where("sourceUrl", "==", article.sourceUrl)
                    .limit(1)
                    .get();

                if (!snapshot.empty) {
                    console.log(`Skipping duplicate: ${article.sourceHeadline}`);
                    continue;
                }

                const processed = await processWithGroq(article);
                if (!processed) {
                    console.log(`Failed to process with Groq: ${article.sourceHeadline}`);
                    continue;
                }

                const newsRef = db.collection("news").doc();
                const newsDoc: FirestoreNewsDoc = {
                    sourceHeadline: article.sourceHeadline,
                    sourceDescription: article.sourceDescription,
                    genZHeadline: processed.genZHeadline,
                    bullets: processed.bullets,
                    sourceUrl: article.sourceUrl,
                    sourceName: article.sourceName,
                    category: category,
                    imageUrl: article.urlToImage || null,
                    timestamp: admin.firestore.Timestamp.now(),
                    reactions: {
                        W: 0,
                        mid: 0,
                        cooked: 0,
                        cap: 0
                    }
                };

                batch.set(newsRef, newsDoc);
                operationCount++;

                if (operationCount >= batchSize) {
                    await batch.commit();
                    batch = db.batch();
                    operationCount = 0;
                }
            }

            if (operationCount > 0) {
                await batch.commit();
            }
        }
        console.log("Finished fetchAndProcessNews.");
    });


export const getNewsFeed = functions.https.onCall(async (data: any, context) => {
    // Parameters: limit (default 20), category (optional), lastTimestamp (for pagination)
    const limit = data.limit || 20;
    const category = data.category;
    const lastTimestamp = data.lastTimestamp;

    let query = db.collection("news").orderBy("timestamp", "desc");

    if (category) {
        query = query.where("category", "==", category);
    }

    if (lastTimestamp) {
        const timestamp = admin.firestore.Timestamp.fromDate(new Date(lastTimestamp));
        query = query.startAfter(timestamp);
    }

    query = query.limit(limit);

    try {
        const snapshot = await query.get();
        const news = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate().toISOString()
        }));
        return news;
    } catch (error) {
        console.error("Error in getNewsFeed:", error);
        throw new functions.https.HttpsError("internal", "Unable to fetch news feed");
    }
});


export const addReaction = functions.https.onCall(async (data: any, context) => {
    const { newsId, reactionType } = data;

    const validReactions = ["W", "mid", "cooked", "cap"];
    if (!newsId || !validReactions.includes(reactionType)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid parameters");
    }

    const newsRef = db.collection("news").doc(newsId);
    const reactionRef = db.collection("reactions").doc();

    try {
        await db.runTransaction(async (t) => {
            const doc = await t.get(newsRef);
            if (!doc.exists) {
                throw new functions.https.HttpsError("not-found", "News article not found");
            }

            // Increment count
            t.update(newsRef, {
                [`reactions.${reactionType}`]: admin.firestore.FieldValue.increment(1)
            });

            // Track individual reaction
            t.set(reactionRef, {
                newsId,
                reactionType,
                timestamp: admin.firestore.Timestamp.now()
            });
        });

        return { success: true };
    } catch (error) {
        console.error("Error in addReaction:", error);
        throw new functions.https.HttpsError("internal", "Unable to add reaction");
    }
});


export const cleanOldNews = functions.pubsub
    .schedule("every day 02:00")
    .onRun(async (context) => {
        console.log("Starting cleanOldNews...");
        const now = admin.firestore.Timestamp.now();
        const sevenDaysAgo = new admin.firestore.Timestamp(now.seconds - (7 * 24 * 60 * 60), 0);

        const snapshot = await db.collection("news")
            .where("timestamp", "<", sevenDaysAgo)
            .get();

        if (snapshot.empty) {
            console.log("No old news to delete.");
            return;
        }

        const batchSize = 500;
        let batch = db.batch();
        let count = 0;

        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
            count++;
            if (count >= batchSize) {
                // Note: In a real scenario we'd await promises in a loop properly.
            }
        });

        // Proper batching loop for deletions
        const chunks = [];
        let tempBatch = db.batch();
        let counter = 0;
        for (const doc of snapshot.docs) {
            tempBatch.delete(doc.ref);
            counter++;
            if (counter >= batchSize) {
                chunks.push(tempBatch.commit());
                tempBatch = db.batch();
                counter = 0;
            }
        }
        if (counter > 0) {
            chunks.push(tempBatch.commit());
        }

        await Promise.all(chunks);
        console.log(`Deleted ${snapshot.size} old news articles.`);
    });
