"use server";

import { TMessageDataToSend, TReaction } from "@/typing";
import { getOtherUser } from "./get-other-user";
import webpush from "@/lib/webPush";

type TParams<T> = {
  notificationType: "MESSAGE" | "REACTION";
  data: T;
};

export async function notificationTrigger({
  notificationType,
  data,
}: TParams<TMessageDataToSend | TReaction>) {
  try {
    const notifReceiverId = await getOtherUser();

    if (!notifReceiverId) throw new Error("User not found");

    // 4. Ensure receiver has a subscription
    if (!notifReceiverId.subscription) {
      console.log(`User ${notifReceiverId.id} has no subscription.`);
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

    // 5. Prepare and send the push notification
    const payload = JSON.stringify({
      title,
      body,
      icon: "https://us-2-0.vercel.app/favicon.ico",
    });

    try {
      await webpush.sendNotification(notifReceiverId.subscription, payload);
    } catch (err) {
      console.error("Error sending push notification:", err);
    }
  } catch (error: any) {
    console.log(error.message);
  }
}
