export function isSingleEmoji(text: string): boolean {
  const singleEmojiRegex =
    /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Extended_Pictographic})$/u;
  return singleEmojiRegex.test(text);
}
