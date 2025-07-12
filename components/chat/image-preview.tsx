import { useState, useEffect, useRef, useCallback } from "react";
import { useImagePreview } from "@/store/use-image-preview.store";
import { ZoomIn, ZoomOut, Download, X, RefreshCcw } from "lucide-react";
import Image from "next/image";

type TProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ImagePreview({ open, setOpen }: TProps) {
  const { imageData, reset } = useImagePreview();

  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setNaturalSize(null);
    }
  }, [open]);

  // Load natural image size
  useEffect(() => {
    if (!imageData?.secure_url) return;

    const img = new window.Image(); // <-- use window.Image here
    img.src = imageData.secure_url;
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [imageData?.secure_url]);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  // Calculate rendered image size based on object-fit: contain
  const getRenderedImageSize = useCallback(() => {
    if (!containerRef.current || !naturalSize) return { width: 0, height: 0 };

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const imageRatio = naturalSize.width / naturalSize.height;
    const containerRatio = containerWidth / containerHeight;

    let renderedWidth = 0;
    let renderedHeight = 0;

    if (imageRatio > containerRatio) {
      // Image is wider relative to container
      renderedWidth = containerWidth;
      renderedHeight = containerWidth / imageRatio;
    } else {
      // Image is taller relative to container
      renderedHeight = containerHeight;
      renderedWidth = containerHeight * imageRatio;
    }

    return { width: renderedWidth, height: renderedHeight };
  }, [naturalSize]);

  // Calculate max offset for pan (in pixels)
  const getMaxOffset = useCallback(() => {
    if (!containerRef.current) return { maxX: 0, maxY: 0 };

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const { width: renderedWidth, height: renderedHeight } =
      getRenderedImageSize();

    // The image scales with zoom, so multiply rendered size by zoom
    // Max pan offset is half the difference between zoomed image size and container size, min 0
    const maxX = Math.max(0, (renderedWidth * zoom - containerWidth) / 2);
    const maxY = Math.max(0, (renderedHeight * zoom - containerHeight) / 2);

    return { maxX, maxY };
  }, [zoom, getRenderedImageSize]);

  const setClampedOffset = (x: number, y: number) => {
    const { maxX, maxY } = getMaxOffset();
    const clampedX = clamp(x, -maxX, maxX);
    const clampedY = clamp(y, -maxY, maxY);
    setOffset({ x: clampedX, y: clampedY });
  };

  if (!open || !imageData?.secure_url) return null;

  const getFileName = (url: string) => {
    try {
      return decodeURIComponent(url.split("/").pop() || "image.jpg");
    } catch {
      return "image.jpg";
    }
  };

  const getTodayDateString = () => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const handleDownload = async () => {
    if (!imageData.secure_url) return;

    try {
      const response = await fetch(imageData.secure_url, { mode: "cors" });
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();

      const originalName = getFileName(imageData.secure_url);
      const today = getTodayDateString();
      const newFileName = `Us - Image ${today} - ${originalName}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = newFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const onClose = () => {
    setOpen(false);
    reset();
  };

  const zoomIn = () => {
    setZoom((z) => Math.min(z + 0.25, 3));
  };

  const zoomOut = () => {
    setZoom((z) => {
      const newZoom = Math.max(z - 0.25, 1);
      if (newZoom <= 1)
        setOffset({ x: 0, y: 0 }); // reset pan if zoom close to 1
      else setClampedOffset(offset.x, offset.y);
      return newZoom;
    });
  };

  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Drag handlers
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (zoom <= 1) return; // no pan if not zoomed
    dragging.current = true;
    const pos = "touches" in e ? e.touches[0] : e;
    lastPos.current = { x: pos.clientX, y: pos.clientY };
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    const pos = "touches" in e ? e.touches[0] : e;
    const dx = pos.clientX - lastPos.current.x;
    const dy = pos.clientY - lastPos.current.y;
    lastPos.current = { x: pos.clientX, y: pos.clientY };

    setClampedOffset(offset.x + dx, offset.y + dy);
  };

  const onDragEnd = () => {
    dragging.current = false;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-[1000]"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-full max-h-full flex justify-center items-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Buttons top-right */}
        <div className="absolute top-4 right-4 flex space-x-2 z-[1100]">
          <button
            onClick={zoomOut}
            disabled={zoom <= 1}
            className="p-2 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={zoomIn}
            disabled={zoom >= 3}
            className="p-2 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={resetZoom}
            disabled={zoom === 1 && offset.x === 0 && offset.y === 0}
            className="p-2 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
            title="Reset Zoom"
          >
            <RefreshCcw size={20} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition"
            title="Download"
          >
            <Download size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image container with pan + zoom */}
        <div
          className="relative w-full h-full max-w-full max-h-full select-none rounded overflow-hidden cursor-grab"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transition: dragging.current ? "none" : "transform 0.2s ease",
            touchAction: "none",
            cursor:
              zoom > 1 ? (dragging.current ? "grabbing" : "grab") : "default",
          }}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
          onTouchCancel={onDragEnd}
        >
          <Image
            src={imageData.secure_url}
            alt="Preview"
            fill
            sizes="100vw"
            style={{ objectFit: "contain", userSelect: "none" }}
            draggable={false}
            priority={true}
          />
        </div>
      </div>
    </div>
  );
}
