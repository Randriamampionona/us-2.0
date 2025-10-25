import EmojiLottie from "./emoji-lottie";
import { emojiParse } from "@/utils/emoji-parse";
import { useMessageEffect } from "@/store/use-message-effect.store";

export const emojiMap: Record<string, string> = {
  "🎉": "/animations/party.lottie",
  "❤️": "/animations/heart.lottie",
  "🩷": "/animations/hearts.lottie",
  "😢": "/animations/crying.lottie",
  "😂": "/animations/laughing.lottie",
  "😅": "/animations/lmao.lottie",
  "🥰": "/animations/feel-in-love.lottie",
  "🔥": "/animations/fire.lottie",
};

export default function MessageEffect() {
  const { lastMessage } = useMessageEffect();
  const parts = emojiParse(lastMessage || "");

  // ✅ Only if there are parts to render
  if (!parts.length) return null;

  // ✅ Only keep emojis that exist in emojiMap
  const validEmojis = parts.filter((p) => emojiMap[p]);

  // ✅ If there are no valid emojis, don’t render anything
  if (!validEmojis.length) return null;

  return (
    <span className="fixed left-1/2 top-0 -translate-x-1/2 flex items-center justify-center w-full h-full z-20 select-none pointer-events-none">
      {validEmojis.map((emoji, i) => (
        <EmojiLottie key={i} emoji={emoji} />
      ))}
    </span>
  );
}
