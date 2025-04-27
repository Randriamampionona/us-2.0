"use server";

import { db } from "@/firebase";
import { TMessageDataToSend, TUser } from "@/typing";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import {
  CHATCOLECTION_DEV,
  CHATCOLECTION_PROD,
  USERCOLECTION_DEV,
  USERCOLECTION_PROD,
} from "@/constant";
import webpush from "@/lib/webPush";

const CHATCOLECTION =
  process.env.NODE_ENV === "development"
    ? CHATCOLECTION_DEV
    : CHATCOLECTION_PROD;

const USERCOLECTION =
  process.env.NODE_ENV === "development"
    ? USERCOLECTION_DEV
    : USERCOLECTION_PROD;

export async function sendMessage(data: TMessageDataToSend) {
  try {
    // 1. Save the message to Firestore
    await addDoc(collection(db, CHATCOLECTION), {
      ...data,
      timestamp: serverTimestamp(),
    });

    // 2. Get all users EXCEPT the sender
    const usersSnapshot = await getDocs(collection(db, USERCOLECTION));
    const recipients: TUser[] = usersSnapshot.docs
      .filter((doc) => doc.id !== data.sender_id)
      .map((doc) => {
        const user = doc.data() as Omit<TUser, "id">;
        return {
          id: doc.id,
          ...user,
        } satisfies TUser;
      });

    // 3. Optional: handle no receiver found
    if (recipients.length === 0) {
      console.warn("No other user to send notification to.");
      return;
    }

    // 👇 Assuming it's a 1-to-1 chat, take the first one
    const receiver = recipients[0];

    // 4. Ensure receiver has a subscription
    if (!receiver.subscription) {
      console.log(`User ${receiver.id} has no subscription.`);
      return;
    }

    const title = data.asset
      ? `${data.username} shared an image`
      : data.gif ? `${data.username} sent a GIF`
      : `New message from ${data.username}`;
    const body = data.asset ? "Image attached" : data.gif ? "GIF" : data.message;

    // 5. Prepare and send the push notification
    const payload = JSON.stringify({
      title,
      body,
      icon: "https://us-2-0.vercel.app/favicon.ico",
      //tag: "chat-notification",
    });

    try {
      await webpush.sendNotification(receiver.subscription, payload);
      // console.log("Push notification sent to", receiver.id);
    } catch (err) {
      console.error("Error sending push notification:", err);
    }
  } catch (e) {
    console.error("Error sending message:", e);
  }
}
