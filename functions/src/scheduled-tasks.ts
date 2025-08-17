import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { runFlow } from '@genkit-ai/flow';
import { analyzeCompetitorsFlow, generateIdeasFromTrendFlow } from '../../src/ai/flows/strategic-analysis';
import { Brand, Notification } from '../../src/types/firestore';

// ... (Initialization and NewsAPI key logic is unchanged)

/**
 * A scheduled function that runs monthly to clean up inactive data.
 */
export const cleanupInactiveData = functions.pubsub.schedule('1 of month 03:00').onRun(async (context) => {
    console.log('Starting monthly cleanup of inactive data...');

    const db = admin.firestore();
    const storage = admin.storage().bucket();
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - 180)); // 180 days ago
    const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);

    // 1. Find all brands that have not been updated in the last 180 days
    const inactiveBrandsSnapshot = await db.collection('brands')
        .where('lastUpdatedAt', '<', cutoffTimestamp)
        .get();

    if (inactiveBrandsSnapshot.empty) {
        console.log('No inactive brands found to clean up.');
        return null;
    }

    console.log(`Found ${inactiveBrandsSnapshot.size} inactive brands to delete.`);

    // 2. For each inactive brand, perform a cascading delete
    const cleanupPromises = inactiveBrandsSnapshot.docs.map(async (brandDoc) => {
        const brandId = brandDoc.id;
        console.log(`Cleaning up data for inactive brand: ${brandId}`);
        
        // Use a batched writer for efficiency
        const batch = db.batch();

        // a. Delete Media Assets (documents and files in Storage)
        const mediaAssetsSnapshot = await db.collection('mediaAssets').where('brandId', '==', brandId).get();
        mediaAssetsSnapshot.forEach(doc => {
            const asset = doc.data();
            if (asset.storagePath) {
                // Delete the file from Cloud Storage
                storage.file(asset.storagePath).delete().catch(err => console.error(`Failed to delete file ${asset.storagePath}:`, err));
            }
            batch.delete(doc.ref);
        });

        // b. Delete Calendar Events
        const calendarEventsSnapshot = await db.collection('calendarEvents').where('brandId', '==', brandId).get();
        calendarEventsSnapshot.forEach(doc => batch.delete(doc.ref));

        // c. Delete Ad Campaigns
        const adCampaignsSnapshot = await db.collection('adCampaigns').where('brandId', '==', brandId).get();
        adCampaignsSnapshot.forEach(doc => batch.delete(doc.ref));

        // d. Delete Notifications
        const notificationsSnapshot = await db.collection('notifications').where('brandId', '==', brandId).get();
        notificationsSnapshot.forEach(doc => batch.delete(doc.ref));
        
        // e. Finally, delete the brand document itself
        batch.delete(brandDoc.ref);

        await batch.commit();
        console.log(`Successfully cleaned up brand: ${brandId}`);
    });

    await Promise.all(cleanupPromises);
    console.log('Monthly cleanup finished.');
    return null;
});


// ... (existing scheduled functions)
export { competitorWatchtower, trendAndOpportunityRadar, syncAdPerformance } from './competitor-watchtower';
