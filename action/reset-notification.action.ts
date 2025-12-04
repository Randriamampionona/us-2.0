"use server";

import { USERCOLECTION_DEV, USERCOLECTION_PROD } from "@/constant";
import { db } from "@/firebase";
import { deleteField, doc, updateDoc } from "firebase/firestore";

/**
 * Reset all push notification subscriptions for a user.
 * Removes the "subscriptions" array completely.
 *
 * @param user_id string - Firestore user document ID
 */

const USERCOLECTION =
  process.env.NODE_ENV === "development"
    ? USERCOLECTION_DEV
    : USERCOLECTION_PROD;

export async function resetNotification(user_id: string) {
  if (!user_id) {
    throw new Error("resetNotification: user_id is required.");
  }

  try {
    const ref = doc(db, USERCOLECTION, user_id);

    // Remove only the subscriptions field
    await updateDoc(ref, {
      subscriptions: deleteField(),
    });

    return { success: true };
  } catch (error) {
    console.error("? resetNotification error:", error);
    return { success: false, error: String(error) };
  }
}
