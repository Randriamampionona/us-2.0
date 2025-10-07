"use server";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { CHATCOLECTION_DEV, CHATCOLECTION_PROD } from "@/constant";

const CHATCOLECTION =
  process.env.NODE_ENV === "development"
    ? CHATCOLECTION_DEV
    : CHATCOLECTION_PROD;

export async function undoUnsendMessage(message_id: string) {
  try {
    if (!message_id) {
      throw new Error("Missing message ID");
    }

    const docRef = doc(db, CHATCOLECTION, message_id);

    await updateDoc(docRef, {
      is_deleted: false,
      updated_at: new Date(),
    });

    console.log(`? Message restored (${CHATCOLECTION}): ${message_id}`);
    return { success: true };
  } catch (error) {
    console.error("? Error undoing unsend:", error);
    return { success: false, error: (error as Error).message };
  }
}
