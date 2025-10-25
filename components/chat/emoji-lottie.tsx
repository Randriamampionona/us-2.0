"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { emojiMap } from "./message-effect";

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
