export function isSingleEmoji(text: string): boolean {
  const emojiSequenceRegex = /^(\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*)$/u;
  return emojiSequenceRegex.test(text);
}
