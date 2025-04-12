import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";

type TProps = {
  asset: string;
  onClear: () => void;
  isPending: boolean;
};

export default function UuploadAassetPreview({
  asset,
  onClear,
  isPending,
}: TProps) {
  return (
    <div
      className={cn(
        "h-auto w-full bg-secondary-foreground/5 p-2 rounded-md",
        isPending && "opacity-50"
      )}
    >
      <div className="relative h-24 w-24">
        <Image
          src={asset}
          alt="Image preview"
          fill
          className="rounded hover:opacity-80 object-cover"
        />
        {!isPending && (
          <span
            className="z-10 absolute top-1 right-1 cursor-pointer bg-foreground/50 rounded-full text-muted p-1 active:scale-95"
            onClick={onClear}
          >
            <X size={14} />
          </span>
        )}
      </div>
    </div>
  );
}
