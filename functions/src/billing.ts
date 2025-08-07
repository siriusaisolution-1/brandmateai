// functions/src/billing.ts
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Deducts a specified amount of BMK credits from a user's account.
 * This is the single, centralized function for all billing operations.
 * @param userId The ID of the user to charge.
 * @param costInBmk The exact cost of the action in BMK credits (e.g., from BMK_COSTS).
 * @returns A boolean indicating if the transaction was successful.
 */
export async function deductBmkCredits(userId: string, costInBmk: number): Promise<boolean> {
  if (!userId || costInBmk <= 0) {
    console.error('Invalid input for deductBmkCredits:', { userId, costInBmk });
    return false;
  }

  const userRef = admin.firestore().collection('users').doc(userId);

  try {
    await admin.firestore().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error(`User with ID ${userId} not found.`);
      }

      const currentBalance = userDoc.data()?.bmkBalance || 0;

      if (currentBalance < costInBmk) {
        throw new Error(`Insufficient balance for user ${userId}. Needed: ${costInBmk}, Has: ${currentBalance}`);
      }

      // Atomically deduct the credits
      transaction.update(userRef, {
        bmkBalance: FieldValue.increment(-costInBmk)
      });
    });

    console.log(`Successfully deducted ${costInBmk} BMK from user ${userId}.`);
    return true;

  } catch (error) {
    console.error(`Transaction failed for user ${userId}:`, error.message);
    // Optionally, send a notification to the user or admin about the failed transaction
    return false;
  }
}
