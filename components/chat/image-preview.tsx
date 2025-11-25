"use client";

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

    const img = new window.Image();
    img.src = imageData.secure_url;
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [imageData?.secure_url]);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  // Calculate rendered image size based on contain
  const getRenderedImageSize = useCallback(() => {
    if (!containerRef.current || !naturalSize) return { width: 0, height: 0 };

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const imageRatio = naturalSize.width / naturalSize.height;
    const containerRatio = containerWidth / containerHeight;

    if (imageRatio > containerRatio) {
      const width = containerWidth;
      return { width, height: width / imageRatio };
    } else {
      const height = containerHeight;
      return { width: height * imageRatio, height };
    }
  }, [naturalSize]);

  const getMaxOffset = useCallback(() => {
    if (!containerRef.current) return { maxX: 0, maxY: 0 };

    const rect = containerRef.current.getBoundingClientRect();
    const { width, height } = getRenderedImageSize();

    const maxX = Math.max(0, (width * zoom - rect.width) / 2);
    const maxY = Math.max(0, (height * zoom - rect.height) / 2);

    return { maxX, maxY };
  }, [zoom, getRenderedImageSize]);

  const setClampedOffset = (x: number, y: number) => {
    const { maxX, maxY } = getMaxOffset();
    setOffset({
      x: clamp(x, -maxX, maxX),
      y: clamp(y, -maxY, maxY),
    });
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
    return now.toISOString().split("T")[0];
  };

  const handleDownload = async () => {
    if (!imageData.secure_url) return;

    try {
      const response = await fetch(imageData.secure_url, { mode: "cors" });
      const blob = await response.blob();

      const originalName = getFileName(imageData.secure_url);
      const today = getTodayDateString();
      const newFileName = `Us - Image ${today} - ${originalName}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = newFileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const onClose = () => {
    setOpen(false);
    reset();
  };

  // 🔍 Scroll-to-zoom (cursor-centered)
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const delta = e.deltaY > 0 ? -0.2 : 0.2; // scroll up → zoom in
    const newZoom = clamp(zoom + delta, 1, 3);

    if (newZoom === zoom) return;

    // Cursor location inside container
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = newZoom / zoom;

    const newOffsetX = (offset.x - mouseX) * zoomFactor + mouseX;
    const newOffsetY = (offset.y - mouseY) * zoomFactor + mouseY;

    setZoom(newZoom);

    if (newZoom === 1) {
      setOffset({ x: 0, y: 0 });
    } else {
      setClampedOffset(newOffsetX, newOffsetY);
    }
  };

  // Dragging
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (zoom <= 1) return;
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
      className="fixed inset-0 bg-black flex justify-center items-center z-[1000]"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-full max-h-full flex justify-center items-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls */}
        <div className="absolute top-4 right-4 flex space-x-2 z-[1100]">
          <button
            onClick={() => {
              const newZoom = clamp(zoom - 0.25, 1, 3);
              setZoom(newZoom);
              if (newZoom === 1) setOffset({ x: 0, y: 0 });
            }}
            disabled={zoom <= 1}
            className="p-2 rounded bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600"
          >
            <ZoomOut size={20} />
          </button>

          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
            disabled={zoom >= 3}
            className="p-2 rounded bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600"
          >
            <ZoomIn size={20} />
          </button>

          <button
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            disabled={zoom === 1 && offset.x === 0 && offset.y === 0}
            className="p-2 rounded bg-gray-700 text-white hover:bg-gray-600"
          >
            <RefreshCcw size={20} />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded bg-gray-700 text-white hover:bg-gray-600"
          >
            <Download size={20} />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image area */}
        <div
          className="relative w-full h-full max-w-full max-h-full select-none overflow-hidden"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transition: dragging.current ? "none" : "transform 0.15s ease",
            touchAction: "none",
            cursor:
              zoom > 1 ? (dragging.current ? "grabbing" : "grab") : "default",
          }}
          onWheel={onWheel}
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
            priority
          />
        </div>
      </div>
    </div>
  );
}
