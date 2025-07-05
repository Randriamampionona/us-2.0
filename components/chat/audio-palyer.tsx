"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

type TProps = {
  src: string;
  isSender: boolean;
  isReply: boolean;
};

export default function AudioPlayer({ src, isSender, isReply }: TProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fixed waveform heights
  const barHeights = useRef<number[]>(
    Array.from({ length: 20 }, () => Math.floor(Math.random() * 24 + 8))
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.ended || audio.currentTime >= audio.duration) {
      audio.currentTime = 0; // rewind if ended
    }

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (s: number) =>
    isNaN(s)
      ? "0:00"
      : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div
      className={cn(
        "flex items-center rounded-md w-full max-w-md px-4 py-2 gap-3",
        isSender
          ? "bg-loveRose text-foreground rounded-br-none"
          : "bg-gray-200 rounded-bl-none",
        isReply && "bg-transparent text-foreground p-0"
      )}
    >
      {/* preload animation classes */}
      <div className="hidden animate-waveBounce animate-wavePulse" />

      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause Button */}
      <button onClick={togglePlayback}>
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Waveform */}
      <div className="flex-1 flex items-center gap-1 overflow-hidden h-8">
        {barHeights.current.map((height, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full origin-center transition-all duration-300 ease-in-out",
              isSender ? "bg-foreground" : "bg-background",
              isReply && "bg-foreground"
            )}
            style={{
              height: `${height}px`,
              animation: isPlaying
                ? `waveBounce 1.2s ease-in-out ${i * 0.05}s infinite`
                : "none",
            }}
          />
        ))}
      </div>

      {/* Timestamp */}
      <span className="text-sm text-right">
        {formatTime(progress)} / {formatTime(duration)}
      </span>
    </div>
  );
}
