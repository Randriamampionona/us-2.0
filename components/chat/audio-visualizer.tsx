"use client";

import { Pause, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

function formatTime(seconds: number) {
  if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function AudioVisualizer({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const context = audioCtxRef.current;

    if (!analyserRef.current) {
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserRef.current = analyserNode;
    }
    const analyserNode = analyserRef.current;

    if (!sourceRef.current) {
      try {
        sourceRef.current = context.createMediaElementSource(audioRef.current);
      } catch (e) {
        console.warn("MediaElementSource already exists");
      }
    }
    const source = sourceRef.current;

    if (!source || !analyserNode) return;

    source.connect(analyserNode);
    analyserNode.connect(context.destination);

    if (!canvasRef.current) return;

    if (!ctxRef.current) {
      const ctx = canvasRef.current!.getContext("2d");
      if (!ctx) {
        console.error("Could not get canvas 2D context");
        return;
      }
      ctxRef.current = ctx;

      // Draw idle line
      const WIDTH = canvasRef.current.width;
      const HEIGHT = canvasRef.current.height;

      ctx.fillStyle = "#E91E63"; // Background
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FFFFFF"; // Idle waveform line
      ctx.beginPath();
      ctx.moveTo(0, HEIGHT / 2);
      ctx.lineTo(WIDTH, HEIGHT / 2);
      ctx.stroke();
    }

    const bufferLength = analyserNode.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const WIDTH = canvasRef.current.width;
    const HEIGHT = canvasRef.current.height;

    function draw() {
      if (!ctxRef.current) return;

      analyserNode.getByteTimeDomainData(dataArray);

      const ctx = ctxRef.current;

      ctx.fillStyle = "#E91E63"; // Background
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FFFFFF"; // Wave color
      ctx.beginPath();

      const sliceWidth = WIDTH / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * HEIGHT) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(WIDTH, HEIGHT / 2);
      ctx.stroke();

      animationIdRef.current = requestAnimationFrame(draw);
    }

    function startVisualization() {
      if (context.state === "suspended") {
        context.resume();
      }
      if (!animationIdRef.current) {
        draw();
      }
    }

    const onPlay = () => {
      setIsPlaying(true);
      startVisualization();
    };

    const onPause = () => {
      setIsPlaying(false);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };

    const onTimeUpdate = () => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audioRef.current) setDuration(audioRef.current.duration);
    };

    audioRef.current.addEventListener("play", onPlay);
    audioRef.current.addEventListener("pause", onPause);
    audioRef.current.addEventListener("timeupdate", onTimeUpdate);
    audioRef.current.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      if (!audioRef.current) return;
      audioRef.current.removeEventListener("play", onPlay);
      audioRef.current.removeEventListener("pause", onPause);
      audioRef.current.removeEventListener("timeupdate", onTimeUpdate);
      audioRef.current.removeEventListener("loadedmetadata", onLoadedMetadata);

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      if (source && analyserNode) {
        source.disconnect();
        analyserNode.disconnect();
      }
    };
  }, [src]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-11 select-none rounded-md overflow-hidden">
      <canvas
        ref={canvasRef}
        className="flex-1 w-full h-full"
        style={{ backgroundColor: "#E91E63" }}
        width={600}
        height={80}
      />
      <div className="absolute flex items-center justify-between w-full h-full space-x-8 z-10 text-foreground text-sm font-mono">
        <button
          type="button"
          onClick={togglePlayPause}
          className="bg-loveRose h-full px-2"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause className="text-foreground" size={20} />
          ) : (
            <Play className="text-foreground" size={20} />
          )}
        </button>

        <div className="bg-loveRose flex items-center justify-center h-full px-2">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Hidden native audio element */}
      <audio ref={audioRef} src={src} className="hidden" />
    </div>
  );
}
