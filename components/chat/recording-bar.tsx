import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Pause, Play, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

type TProps = {
  isPaused: boolean;
  setIsPaused: Dispatch<SetStateAction<boolean>>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  deleteRecording: () => Promise<void>;
};

export default function RecordingBar({
  isPaused,
  pauseRecording,
  resumeRecording,
  deleteRecording,
}: TProps) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!isPaused) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused]);

  const formatTime = (t: number) => `0:${t.toString().padStart(2, "0")}`;

  const handleToggle = async () => {
    if (isPaused) {
      await resumeRecording();
    } else {
      await pauseRecording();
    }
  };

  return (
    <div className="flex-1 flex items-center w-full max-w-md space-x-2">
      {/* Trash Icon */}
      <button className="text-white" type="button" onClick={deleteRecording}>
        <Trash size={20} />
      </button>

      {/* Recording Bar */}
      <div
        className={cn(
          "relative flex-1 rounded-full h-10 px-4 flex items-center justify-between text-white bg-loveRose space-x-2 overflow-hidden"
        )}
      >
        {/* Pause/Play Toggle & Waveform */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleToggle}>
            {isPaused ? (
              <Play className="w-5 h-5 text-white" />
            ) : (
              <Pause className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Waveform dots */}
          <div className="flex space-x-1">
            {Array.from({ length: 69 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-2 bg-white rounded-full origin-center ${
                  isPaused ? "opacity-50" : "animate-wavePulse"
                }`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-centertext-sm font-semibold absolute right-0 h-full bg-loveRose pl-2 pr-4">
          <p className="text-sm">{formatTime(timer)}</p>
        </div>
      </div>
    </div>
  );
}
