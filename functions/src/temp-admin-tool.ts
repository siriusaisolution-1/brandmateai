import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * A temporary, callable function to grant admin privileges to a user.
 * DANGER: Delete this function before deploying to production.
 * @param email The email address of the user to make an admin.
 */
export const makeAdmin = functions.https.onCall(async (data, context) => {
    // Basic check to ensure not just anyone can call this
    if (context.auth?.token.admin !== true) {
        // To make the FIRST admin, you might need to comment this check out,
        // run the function once for yourself, then uncomment it.
        // Or, use the Firebase Admin SDK in a local script.
        // throw new functions.https.HttpsError('permission-denied', 'Only an admin can make other users admins.');
    }
    
    const email = data.email;
    if (typeof email !== 'string' || !email) {
        throw new functions.https.HttpsError('invalid-argument', 'Please provide an email address.');
    }

    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, {
            ...user.customClaims,
            role: 'admin',
        });
        
        // Also update the Firestore document for consistency
        await admin.firestore().collection('users').doc(user.uid).update({ role: 'admin' });

        return { message: `Success! ${email} is now an admin.` };

    } catch (error: any) {
        console.error("Failed to make user admin:", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
