"use client";

import { useState, useRef, Dispatch, SetStateAction } from "react";
import MicRecorder from "mic-recorder-to-mp3";
import { uploadAudio } from "@/action/upload-audio.action";
import { Mic, SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";
import RecordingBar from "./recording-bar";
import { toastify } from "@/utils/toastify";
import { sendMessage } from "@/action/send-message.action";
import { TMessageDataToSend } from "@/typing";
import { useAuth, useUser } from "@clerk/nextjs";

type TProps = {
  setIsOnRecord: Dispatch<SetStateAction<boolean>>;
};

export default function VoiceInput({ setIsOnRecord }: TProps) {
  const { userId } = useAuth();
  const { user } = useUser();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [_audioURL, setAudioURL] = useState<string | null>(null);

  const recorderRef = useRef<MicRecorder | null>(null);

  if (typeof window !== "undefined" && !recorderRef.current) {
    recorderRef.current = new MicRecorder({ bitRate: 128 });
  }

  const startRecording = async () => {
    try {
      await recorderRef.current!.start();
      setIsRecording(true);
      setIsPaused(false);
      setIsOnRecord(true);
    } catch (e) {
      console.error("Error starting recording:", e);
      setIsOnRecord(false);
    }
  };

  const pauseRecording = () => {
    // UI-only pause
    setIsPaused(true);
  };

  const resumeRecording = () => {
    // Resume UI-only pause
    setIsPaused(false);
  };

  const stopRecording = async () => {
    if (!recorderRef.current || !isRecording) return;

    try {
      const [_, blob] = await recorderRef.current.stop().getMp3();

      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setIsRecording(false);
      setIsPaused(false);

      // Convert blob to base64
      const reader = new FileReader();
      const base64: string = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

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
    } catch (e) {
      console.error("Error stopping recording:", e);
    } finally {
      setIsRecording(false);
      setIsPaused(false);
      setIsOnRecord(false);
    }
  };

  const deleteRecording = async () => {
    try {
      if (isRecording && recorderRef.current) {
        await recorderRef.current.stop(); // Discard the recording
      }

      setIsRecording(false);
      setIsPaused(false);
      setAudioURL(null);
      setIsOnRecord(false);
    } catch (e) {
      console.error("Error aborting recording:", e);
      setIsOnRecord(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        (isRecording || isPaused) &&
          "w-[calc(100vw-2rem)] md:w-[calc(100vw-7rem)] lg:w-[calc(100vw-45rem)] mx-auto"
      )}
    >
      {!isRecording && !isPaused && (
        <button type="button" className="opacity-65" onClick={startRecording}>
          <Mic size={20} />
        </button>
      )}

      {(isRecording || isPaused) && (
        <div className="flex items-center justify-center max-w-full min-w-full space-x-2">
          <RecordingBar
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            pauseRecording={pauseRecording}
            resumeRecording={resumeRecording}
            deleteRecording={deleteRecording}
          />
          <button type="button" onClick={stopRecording} className="opacity-65">
            <SendHorizonal size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
