// app/actions/savePushSubscription.ts
"use server";

import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function savePushSubscription(userId: string, subscription: any) {
  // Convert subscription to plain object
  const subscriptionObject = JSON.parse(JSON.stringify(subscription));

  await updateDoc(doc(db, "USERS", userId), {
    subscription: subscriptionObject,
  });
}
