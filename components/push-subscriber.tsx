"use client";

import { savePushSubscription } from "@/action/save-push-subscription.action";
import { useEffect } from "react";

export default function PushSubscriber({ userId }: { userId: string }) {
  useEffect(() => {
    const subscribe = async () => {
      if (!("serviceWorker" in navigator)) return;

      await navigator.serviceWorker.register("/sw.js");
      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        });
      }

      await savePushSubscription(
        userId,
        JSON.parse(JSON.stringify(subscription))
      );
    };

    subscribe();
  }, [userId]);

  return null;
}

// helper function
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}
