import { useImagePreview } from "@/store/use-image-preview.store";
import Image from "next/image";

export default function ImagePreview() {
  const { imageData, reset } = useImagePreview();
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/45 backdrop-blur w-screen h-dvh md:h-screen overflow-auto z-50"
      onClick={reset}
    >
      <Image
        src={imageData?.secure_url!}
        alt=""
        width={imageData?.width}
        height={imageData?.height}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
