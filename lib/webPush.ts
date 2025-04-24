import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:" + process.env.NEXT_PUBLIC_MAILTO,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default webpush;
