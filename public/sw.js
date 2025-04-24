self.addEventListener("push", function (event) {
  const data = event.data?.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "https://us-2-0.vercel.app/favicon.ico",
      tag: "chat-notification",
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // Open the /chat page directly when the notification is clicked
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        // If there's already a /chat page open, bring it into focus
        if (client.url.includes("/chat") && "focus" in client) {
          return client.focus();
        }
      }

      // Otherwise, open the /chat page in a new window or tab
      if (clients.openWindow) {
        return clients.openWindow("/chat");
      }
    })
  );
});
