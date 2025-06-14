"use client";

import { useState, useRef } from "react";
import MicRecorder from "mic-recorder-to-mp3";

export default function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  // Persist MicRecorder instance using ref so it survives re-renders
  const recorderRef = useRef<MicRecorder | null>(null);
  if (!recorderRef.current) {
    recorderRef.current = new MicRecorder({ bitRate: 128 });
  }

  const startRecording = () => {
    recorderRef
      .current!.start()
      .then(() => setIsRecording(true))
      .catch((e) => console.error("Error starting recording:", e));
  };

  const stopRecording = () => {
    if (!isRecording) return; // Prevent stopping if not recording
    recorderRef
      .current!.stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setIsRecording(false);
      })
      .catch((e) => {
        console.error("Error stopping recording:", e);
        setIsRecording(false);
      });
  };

  console.log({ audioURL });

  return (
    <div className="flex flex-col items-center p-6 gap-4">
      <button
        className={`px-4 py-2 rounded text-white ${
          isRecording ? "bg-red-500" : "bg-green-500"
        }`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {audioURL && (
        <audio controls src={audioURL} className="w-full max-w-md" />
      )}
    </div>
  );
}
