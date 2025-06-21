"use client";

import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import MicRecorder from "mic-recorder-to-mp3";
import { uploadAudio } from "@/action/upload-audio.action";
import { LoaderCircle, Mic, Pause, Play, SendHorizonal } from "lucide-react";
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
  const recordedChunksRef = useRef<Blob[]>([]);

  if (!recorderRef.current) {
    recorderRef.current = new MicRecorder({ bitRate: 128 });
  }

  const startRecording = async () => {
    try {
      await recorderRef.current!.start();
      setIsRecording(true);
      setIsOnRecord(true);
      setIsPaused(false);
    } catch (e) {
      console.error("Error starting recording:", e);
      setIsOnRecord(false);
    }
  };

  const pauseRecording = async () => {
    if (!recorderRef.current || !isRecording) return;

    try {
      const [_, blob] = await recorderRef.current.stop().getMp3();
      recordedChunksRef.current.push(blob);
      setIsRecording(false);
      setIsPaused(true);
    } catch (e) {
      console.error("Error during pause:", e);
    }
  };

  const resumeRecording = async () => {
    try {
      await recorderRef.current!.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (e) {
      console.error("Error resuming recording:", e);
    }
  };

  const stopRecording = async () => {
    if ((!isRecording && !isPaused) || !recorderRef.current) return;

    try {
      // If currently recording, capture the last part
      if (isRecording) {
        const [_, blob] = await recorderRef.current.stop().getMp3();
        recordedChunksRef.current.push(blob);
      }

      const finalBlob = new Blob(recordedChunksRef.current, {
        type: "audio/mpeg",
      });

      const url = URL.createObjectURL(finalBlob);
      setAudioURL(url);
      setIsRecording(false);
      setIsPaused(false);
      recordedChunksRef.current = [];

      // Convert blob to base64
      const reader = new FileReader();
      const base64: string = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(finalBlob);
      });

      // Upload base64 audio
      const uploadedAudioResult = await uploadAudio(base64);

      if (!uploadedAudioResult)
        throw new Error(
          "Audio upload failed. Please try again or check your connection."
        );

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
      setIsRecording(false);
      setIsPaused(false);
    } finally {
      setIsOnRecord(false);
    }
  };

  const deleteRecording = async () => {
    try {
      if (isRecording && recorderRef.current) {
        // Stop and discard the recorded chunk (but don't save it)
        await recorderRef.current.stop().getMp3();
      }

      // Cleanup
      recordedChunksRef.current = [];
      setIsRecording(false);
      setIsPaused(false);
      setIsOnRecord(false);
      setAudioURL(null);
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
      {/* Recording Control Button */}
      {!isRecording && !isPaused && (
        <button type="button" className="opacity-65" onClick={startRecording}>
          <Mic size={20} />
        </button>
      )}

      {(isRecording || isPaused) && (
        <div className="flex items-center justify-center max-w-full min-w-full space-x-2">
          {/* Show recording UI */}
          <RecordingBar
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            pauseRecording={pauseRecording}
            resumeRecording={resumeRecording}
            deleteRecording={deleteRecording}
          />

          {/* Stop Button and send (always shown if recording or paused) */}
          <button type="button" onClick={stopRecording} className="opacity-65">
            <SendHorizonal size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
