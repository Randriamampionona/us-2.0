"use server";

import { TMessageDataToSend, TReaction } from "@/typing";
import { getOtherUser } from "./get-other-user";
import webpush from "@/lib/webPush";
import { currentUser } from "@clerk/nextjs/server";

type TParams<T> = {
  notificationType: "MESSAGE" | "REACTION" | "REMINDER";
  data: T;
};

export async function notificationTrigger({
  notificationType,
  data,
}: TParams<TMessageDataToSend | TReaction>) {
  try {
    const receiverUser = await getOtherUser();

    if (!receiverUser) throw new Error("User not found");

    // 4. Ensure receiver has a subscription
    if (!receiverUser.subscription) {
      console.log(`User ${receiverUser.id} has no subscription.`);
      return;
    }

    let title;
    let body;

    if (notificationType === "MESSAGE") {
      const formattedData = data as TMessageDataToSend;
      title = formattedData.asset
        ? `${formattedData.username} shared an image`
        : formattedData.gif
        ? `${formattedData.username} sent a GIF`
        : formattedData.audio
        ? `${formattedData.username} sent a voice message`
        : `New message from ${formattedData.username}`;

      body = formattedData.asset
        ? "Image attached"
        : formattedData.gif
        ? "GIF"
        : formattedData.message;
    }

    if (notificationType === "REACTION") {
      const formattedData = data as TReaction;
      title = `${formattedData?.reactor_username} has reacted to your message`;

      body = `${formattedData?.reaction}`;
    }

    if (notificationType === "REMINDER") {
      const user = await currentUser();
      title = "Message Reminder";

      body = `You have an unread message from ${user?.fullName} 🥰`;
    }

    // 5. Prepare and send the push notification
    const payload = JSON.stringify({
      title,
      body,
      icon: "https://us-2-0.vercel.app/favicon.ico",
    });

    try {
      await webpush.sendNotification(receiverUser.subscription, payload);
    } catch (err) {
      console.error("Error sending push notification:", err);
    }
  } catch (error: any) {
    console.log(error.message);
  }
}
