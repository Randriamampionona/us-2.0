import { Pause, Play } from "lucide-react";
import React, { useRef, useState } from "react";

interface TProps {
  audioBlob: Blob;
  isSender?: boolean;
}

export default function VoiceMessageBubble({ audioBlob, isSender }: TProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = URL.createObjectURL(audioBlob);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div
      className={`max-w-[70%] p-3 rounded-2xl shadow-md flex items-center gap-4 ${
        isSender
          ? "bg-blue-500 text-white self-end rounded-br-none"
          : "bg-gray-200 text-black self-start rounded-bl-none"
      }`}
    >
      <button onClick={togglePlay}>{isPlaying ? <Pause /> : <Play />}</button>
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
      />
      <span className="text-sm font-light">Voice message</span>
    </div>
  );
}
