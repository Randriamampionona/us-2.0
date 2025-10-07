import EmojiLottie, { emojiMap } from "./emoji-lottie";
import { emojiParse } from "@/utils/emoji-parse";
import { useMessageEffect } from "@/store/use-message-effect.store";

export default function MessageEffect() {
  const { lastMessage } = useMessageEffect();
  const parts = emojiParse(lastMessage || "");

  if (!parts.length) return null;

  return (
    <span className="fixed left-1/2 top-0 -translate-x-1/2 flex items-center justify-center w-full h-full z-20">
      {parts.map(
        (part, i) => emojiMap[part] && <EmojiLottie key={i} emoji={part} />
      )}
    </span>
  );
}
