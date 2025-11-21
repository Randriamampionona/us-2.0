// app/actions/savePushSubscription.ts
"use server";

import { USERCOLECTION_DEV, USERCOLECTION_PROD } from "@/constant";
import { db } from "@/firebase";
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

const USERCOLECTION =
  process.env.NODE_ENV === "development"
    ? USERCOLECTION_DEV
    : USERCOLECTION_PROD;

export async function savePushSubscription(userId: string, subscription: any) {
  const ref = doc(db, USERCOLECTION, userId);
  const subscriptionObject = JSON.parse(JSON.stringify(subscription));

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { subscriptions: [subscriptionObject] });
  } else {
    await updateDoc(ref, {
      subscriptions: arrayUnion(subscriptionObject),
    });
  }
}
