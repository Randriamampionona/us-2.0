"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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

export default function EmojiLottie({ emoji }: { emoji: string }) {
  const src = emojiMap[emoji];

  if (src) {
    return (
      <DotLottieReact
        src={src}
        loop={true}
        autoplay
        style={{ width: 220, height: 220 }}
      />
    );
  }

  return <span className="text-6xl">{emoji}</span>;
}
