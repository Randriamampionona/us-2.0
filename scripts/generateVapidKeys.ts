const webpush = require("web-push");

const keys = webpush.generateVAPIDKeys();
console.log(keys);
// COMMAND
// ts-node scripts/generateVapidKeys.ts
