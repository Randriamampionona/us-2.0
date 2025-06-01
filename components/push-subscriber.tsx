"use client";

import { savePushSubscription } from "@/action/save-push-subscription.action";
import { useEffect } from "react";

export default function PushSubscriber({ userId }: { userId: string }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const subscribe = async () => {
      try {
        const existing = await navigator.serviceWorker.getRegistration();
        if (!existing) {
          await navigator.serviceWorker.register("/sw.js");
        }

        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!vapidKey) {
            console.warn("VAPID key is missing");
            return;
          }

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          });
        }

        await savePushSubscription(
          userId,
          JSON.parse(JSON.stringify(subscription))
        );
      } catch (err) {
        console.error("Failed to subscribe for push notifications:", err);
      }
    };

    subscribe();
  }, [userId]);

  return null;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}
