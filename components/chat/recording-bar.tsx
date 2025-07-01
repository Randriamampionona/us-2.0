import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Pause, Play, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

type TProps = {
  isPaused: boolean;
  setIsPaused: Dispatch<SetStateAction<boolean>>;
  pauseRecording: () => void;
  resumeRecording: () => void;
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
    <div className="flex items-center max-w-full w-full space-x-2">
      {/* Trash Icon */}
      <button className="text-white" type="button" onClick={deleteRecording}>
        <Trash size={20} />
      </button>

      {/* Recording Bar */}
      <div
        className={cn(
          "flex-1 rounded-md h-[3rem] px-4 flex items-center justify-between text-foreground overflow-hidden gap-x-2",
          isPaused ? "bg-loveRose/15" : "bg-loveRose"
        )}
      >
        {/* Pause/Play Toggle */}
        <button type="button" onClick={handleToggle}>
          {isPaused ? (
            <Play className="w-5 h-5 text-white" />
          ) : (
            <Pause className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Waveform dots */}
        <div className="relative flex-1 items-center justify-center overflow-x-hidden h-full">
          <div className="flex-1 flex space-x-1 absolute top-1/2 -translate-y-1/2">
            {Array.from({ length: 75 }).map((_, i) => (
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
        <div>
          <p className="text-sm">{formatTime(timer)}</p>
        </div>
      </div>
    </div>
  );
}
