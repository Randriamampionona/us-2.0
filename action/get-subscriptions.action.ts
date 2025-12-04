"use server";

import { USERCOLECTION_DEV, USERCOLECTION_PROD } from "@/constant";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const USERCOLECTION =
  process.env.NODE_ENV === "development"
    ? USERCOLECTION_DEV
    : USERCOLECTION_PROD;

export async function getSubscriptions(user_id: string) {
  if (!user_id) {
    throw new Error("getSubscriptions: user_id is required.");
  }

  try {
    const ref = doc(db, USERCOLECTION, user_id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return { success: false, error: "User not found", subscriptions: null };
    }

    const data = snap.data();

    return {
      success: true,
      subscriptions: data.subscriptions ?? null,
    };
  } catch (error) {
    console.error("? getSubscriptions error:", error);
    return { success: false, error: String(error), subscriptions: null };
  }
}
