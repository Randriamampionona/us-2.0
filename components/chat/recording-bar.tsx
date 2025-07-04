import { Pause, Play, SendHorizonal, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

type TProps = {
  isPaused: boolean;
  timer: string;
  pauseRecording: () => void;
  resumeRecording: () => void;
  abortRecording: () => void;
  stopRecording: () => void;
};

export default function RecordingBar({
  isPaused,
  timer,
  pauseRecording,
  resumeRecording,
  abortRecording,
  stopRecording,
}: TProps) {
  const handlePausePlay = () => {
    isPaused ? resumeRecording() : pauseRecording();
  };

  return (
    <div className="flex items-center max-w-full w-full space-x-2">
      {/* Trash Icon */}
      <button className="opacity-65" type="button" onClick={abortRecording}>
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
        <button type="button" onClick={handlePausePlay}>
          {isPaused ? (
            <Play className="w-5 h-5 text-foreground" />
          ) : (
            <Pause className="w-5 h-5 text-foreground" />
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
          <p className="text-sm">{timer}</p>
        </div>
      </div>

      <button type="button" className="opacity-65" onClick={stopRecording}>
        <SendHorizonal size={20} />
      </button>
    </div>
  );
}
