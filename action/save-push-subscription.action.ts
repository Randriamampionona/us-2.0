// app/actions/savePushSubscription.ts
"use server";

import { USERCOLECTION_DEV, USERCOLECTION_PROD } from "@/constant";
import { db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

const USERCOLECTION =
  process.env.NODE_ENV === "development"
    ? USERCOLECTION_DEV
    : USERCOLECTION_PROD;

export async function savePushSubscription(userId: string, subscription: any) {
  const subscriptionObject = JSON.parse(JSON.stringify(subscription));

  await setDoc(
    doc(db, USERCOLECTION, userId),
    { subscription: subscriptionObject },
    { merge: true }
  );
}
