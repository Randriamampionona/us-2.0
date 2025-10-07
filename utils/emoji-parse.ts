import emojiRegex from "emoji-regex";

export function emojiParse(text: string) {
  const regex = emojiRegex();
  const parts: string[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(regex)) {
    const emoji = match[0];
    const index = match.index ?? 0;

    if (lastIndex < index) {
      parts.push(text.slice(lastIndex, index)); // normal text
    }
    parts.push(emoji); // the emoji
    lastIndex = index + emoji.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
