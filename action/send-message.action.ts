"use server";

import { db } from "@/firebase";
import { TMessageDataToSend } from "@/typing";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { CHATCOLECTION_DEV, CHATCOLECTION_PROD } from "@/constant";

import { notificationTrigger } from "./notification-trigger.action";

const CHATCOLECTION =
  process.env.NODE_ENV === "development"
    ? CHATCOLECTION_DEV
    : CHATCOLECTION_PROD;

export async function sendMessage(data: TMessageDataToSend) {
  try {
    await addDoc(collection(db, CHATCOLECTION), {
      ...data,
      timestamp: serverTimestamp(),
    });

    try {
      await notificationTrigger({ data, notificationType: "MESSAGE" });
    } catch (error: any) {
      throw new Error(error.message);
    }
  } catch (e) {
    console.error("Error sending message:", e);
  }
}
