"use client";
import { useSoundEffect } from "@/store/use-sound-effect.store";
import { useEffect, useRef } from "react";

type TProps = {
  source: string;
};

export default function NewMessageSentEffectPlayer({ source }: TProps) {
  const { play, isAllowed } = useSoundEffect();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current && source) {
      audioRef.current = new Audio(source);
      audioRef.current.volume = 1;
    }
  }, [source]); // ?? recreate if source changes

  useEffect(() => {
    if (!isAllowed) return; // ?? don't play if disabled

    if (play && audioRef.current) {
      audioRef.current.currentTime = 0; // restart if already playing
      audioRef.current.play().catch((err) => {
        console.warn("Sound playback failed:", err);
      });
    }
  }, [play, isAllowed]); // ?? depend on isAllowed too

  return null; // No visible UI
}
