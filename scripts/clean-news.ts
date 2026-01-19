import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!admin.apps.length) {
    if (serviceAccountKey) {
        const serviceAccount = JSON.parse(serviceAccountKey);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        admin.initializeApp();
    }
}

const db = admin.firestore();

async function clean() {
    console.log("🧹 Cleaning old news...");
    const now = admin.firestore.Timestamp.now();
    const expiry = new admin.firestore.Timestamp(now.seconds - (7 * 24 * 60 * 60), 0);

    const snapshot = await db.collection("news")
        .where("timestamp", "<", expiry)
        .limit(400) // Batch limit safety
        .get();

    if (snapshot.empty) {
        console.log("✨ No old news to delete.");
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`🗑️ Deleted ${snapshot.size} old articles.`);
}

clean().catch(console.error);
