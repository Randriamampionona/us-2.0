export function isSingleEmoji(text: string): boolean {
  const emojiRegex =
    /^((\p{Emoji}(?:\uFE0F)?)(\u200D(\p{Emoji}(?:\uFE0F)?))*)$/u;
  return emojiRegex.test(text);
}
