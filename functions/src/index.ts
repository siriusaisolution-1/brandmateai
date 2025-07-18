import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

async function setUserClaims(uid: string, plan: string = 'free') {
  await admin.auth().setCustomUserClaims(uid, {
    plan: plan,
    role: 'user',
  });
}

export const createUserDataOnCreate = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(user.uid);
  
  const newUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    subscriptionPlan: 'free',
    role: 'user'
  };
  
  await userRef.set(newUser);
  await setUserClaims(user.uid, 'free');

  return null;
});

export const registerUserWithPlan = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to perform this action.');
  }

  const { plan, displayName } = data;
  const uid = context.auth.uid;
  const db = admin.firestore();
  const userRef = db.collection('users').doc(uid);
  
  const userRecord = await admin.auth().getUser(uid);
  
  const newUser = {
    uid: uid,
    email: userRecord.email,
    displayName: displayName,
    subscriptionPlan: plan || 'free',
    role: 'user'
  };
  
  await userRef.set(newUser);
  await setUserClaims(uid, plan || 'free');

  return { success: true };
});
