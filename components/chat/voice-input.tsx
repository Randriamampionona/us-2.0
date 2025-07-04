"use client";

import { useState, useRef, Dispatch, SetStateAction } from "react";
import { uploadAudio } from "@/action/upload-audio.action";
import { sendMessage } from "@/action/send-message.action";
import { toastify } from "@/utils/toastify";
import { Mic, SendHorizonal, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TMessageDataToSend } from "@/typing";
import { useAuth, useUser } from "@clerk/nextjs";
import RecordingBar from "./recording-bar";
import AudioVisualizer from "./audio-visualizer";

type TProps = {
  isOnRecord: boolean;
  setIsOnRecord: Dispatch<SetStateAction<boolean>>;
};

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function VoiceInput({ isOnRecord, setIsOnRecord }: TProps) {
  const { userId } = useAuth();
  const { user } = useUser();

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pauseDurationRef = useRef(0);
  const pauseStartRef = useRef<number | null>(null);

  // Media refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio context for visualizer
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Abort flag to skip onstop logic if aborted
  const abortedRef = useRef(false);

  // Start timer - reset all counters and start interval
  const startTimer = () => {
    startTimeRef.current = performance.now();
    pauseDurationRef.current = 0;
    pauseStartRef.current = null;
    setElapsedTime(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;
      // If currently paused, don't update elapsed time
      if (pauseStartRef.current !== null) {
        // paused, skip updating elapsed time
        return;
      }
      const now = performance.now();
      const elapsed = now - startTimeRef.current - pauseDurationRef.current;
      setElapsedTime(elapsed);
    }, 250);
  };

  // Pause timer - record when pause started
  const pauseTimer = () => {
    if (pauseStartRef.current === null) {
      pauseStartRef.current = performance.now();
    }
  };

  // Resume timer - add pause duration to offset and clear pause start
  const resumeTimer = () => {
    if (pauseStartRef.current !== null) {
      pauseDurationRef.current += performance.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
  };

  // Stop timer - clear interval and reset
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsedTime(0);
    startTimeRef.current = null;
    pauseStartRef.current = null;
    pauseDurationRef.current = 0;
  };

  // Setup Audio visualizer
  const setupVisualizer = (stream: MediaStream) => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    const audioCtx = new AudioContext();
    audioContextRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    sourceRef.current = source;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    drawVisualizer();
  };

  const drawVisualizer = () => {
    if (!canvasRef.current) return;
    if (!analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    const barWidth = (WIDTH / dataArrayRef.current.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const barHeight = dataArrayRef.current[i] / 2;

      ctx.fillStyle = "rgb(30, 144, 255)";
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    animationFrameIdRef.current = requestAnimationFrame(drawVisualizer);
  };

  // Cleanup visualizer and audio context
  const cleanupVisualizer = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    sourceRef.current = null;

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  // Start recording handler
  const startRecording = async () => {
    try {
      abortedRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = "audio/mp4";

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm;codecs=opus";
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        if (abortedRef.current) {
          abortedRef.current = false;
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

        streamRef.current?.getTracks().forEach((track) => track.stop());

        cleanupVisualizer();
        stopTimer();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setIsOnRecord(true);
      setAudioBlob(null);
      setAudioURL(null);

      setupVisualizer(stream);
      startTimer();
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsOnRecord(false);
    }
  };

  // Pause recording handler
  const pauseRecording = () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state !== "recording"
    )
      return;
    mediaRecorderRef.current.pause();
    setIsPaused(true);
    pauseTimer();
  };

  // Resume recording handler
  const resumeRecording = () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state !== "paused"
    )
      return;
    mediaRecorderRef.current.resume();
    setIsPaused(false);
    resumeTimer();
  };

  // Aborting
  const abortRecording = () => {
    abortedRef.current = true;

    // Stop media recorder if active
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop(); // force stop
    }

    // Stop mic stream
    streamRef.current?.getTracks().forEach((track) => track.stop());

    // Clean up
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }

    setAudioBlob(null);
    setAudioURL(null);
    setIsRecording(false);
    setIsPaused(false);
    setIsUploading(false);
    setIsOnRecord(false);

    cleanupVisualizer();
    stopTimer();

    // Reset all refs
    mediaRecorderRef.current = null;
    streamRef.current = null;
    chunksRef.current = [];
    pauseDurationRef.current = 0;
    pauseStartRef.current = null;
    startTimeRef.current = null;
  };

  // Stop recording handler
  const stopRecording = () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "inactive"
    )
      return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);
  };

  // Delete recording handler
  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL(null);
    setIsRecording(false);
    setIsPaused(false);
    setIsOnRecord(false);

    streamRef.current?.getTracks().forEach((track) => track.stop());
    cleanupVisualizer();
    stopTimer();
  };

  // Upload recording handler
  const uploadRecording = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    try {
      const base64 = await blobToBase64(audioBlob);

      const uploadedAudioResult = await uploadAudio(base64);
      if (!uploadedAudioResult) {
        throw new Error(
          "Audio upload failed. Please try again or check your connection."
        );
      }

      toastify("success", "Audio uploaded");

      const data: TMessageDataToSend = {
        sender_id: userId!,
        username: user!.firstName,
        message: "",
        reaction: null,
        is_seen: false,
        is_deleted: false,
        reply_to: null,
        audio: uploadedAudioResult,
      };

      await sendMessage(data);
      deleteRecording();
    } catch (error) {
      console.error("Upload failed:", error);
      toastify("error", "Upload failed");
    } finally {
      setIsUploading(false);
      setIsOnRecord(false);
    }
  };

  // Convert Blob to base64 helper
  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-2",
        (isRecording || isPaused || audioURL) &&
          "w-[calc(100vw-2rem)] md:w-[calc(100vw-7rem)] lg:w-[calc(100vw-45rem)] mx-auto"
      )}
    >
      {/* Waveform visualizer */}
      {(isRecording || isPaused) && (
        <RecordingBar
          isPaused={isPaused}
          timer={formatTime(elapsedTime)}
          pauseRecording={pauseRecording}
          resumeRecording={resumeRecording}
          abortRecording={abortRecording}
          stopRecording={stopRecording}
        />
      )}

      {/* Mic */}
      {!isOnRecord && (
        <div className="flex items-center space-x-3">
          {!isRecording && !audioURL && (
            <button
              type="button"
              className="opacity-65"
              onClick={startRecording}
              aria-label="Start recording"
            >
              <Mic size={20} />
            </button>
          )}
        </div>
      )}

      {/* Audio preview + upload/delete */}
      {audioURL && (
        <div className="flex-1 flex items-center w-full space-x-3">
          <button
            type="button"
            disabled={isUploading}
            onClick={deleteRecording}
            className="opacity-65"
            aria-label="Delete recording"
          >
            <Trash2 size={20} />
          </button>

          <AudioVisualizer src={audioURL} />

          <button
            type="button"
            onClick={uploadRecording}
            disabled={isUploading}
            className="opacity-65"
            aria-label="Upload recording"
          >
            {isUploading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <SendHorizonal size={20} />
            )}
          </button>

          <button
            type="button"
            onClick={startRecording}
            disabled={isUploading}
            className="opacity-65"
            aria-label="Record again"
          >
            <Mic size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
