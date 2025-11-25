"use client";

import "react-photo-album/styles.css";
import PhotoAlbum from "react-photo-album";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import type { UploadApiResponse } from "cloudinary";
import { getGalleryImages } from "@/action/get-gallery-images.action";
import { useImagePreview } from "@/store/use-image-preview.store";
import ImagePreview from "../chat/image-preview";

type TProps = {
  initialImages: UploadApiResponse[]; // use Cloudinary type directly
  initialCursor: string | null;
};

export default function GalleryGrid({ initialImages, initialCursor }: TProps) {
  const { setImageData, imageData } = useImagePreview();
  const [openPreview, setOpenPreview] = useState(false);
  const [images, setImages] = useState<UploadApiResponse[]>(initialImages);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Convert UploadApiResponse to PhotoAlbum expected format
  const photos = images.map((img) => ({
    src: img.secure_url,
    width: img.width,
    height: img.height,
    alt: img.public_id,
    key: img.asset_id,
  }));

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);

    const result = await getGalleryImages(cursor);

    // result.images are already mapped as UploadApiResponse-like objects
    setImages((prev) => [...prev, ...result.images]);
    setCursor(result.nextCursor);
    setLoading(false);
  }, [cursor, loading]);

  const onPreview = (asset_id: string) => {
    setOpenPreview(true);
    const image = images.find((img) => img.asset_id === asset_id);
    if (!image) return;

    setImageData(image);
  };

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      {imageData && (
        <ImagePreview open={openPreview} setOpen={setOpenPreview} />
      )}
      <div className="pt-24 pb-10 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Us Gallery
          </h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto text-sm md:text-base">
            A curated mosaic of moments — collected, captured, and shared. Each
            image holds a tiny story from our journey building this feature
            together.
          </p>
        </div>

        {/* Gallery */}
        <div className="p-2">
          <PhotoAlbum
            layout="masonry"
            photos={photos}
            spacing={8}
            columns={(containerWidth: number) => {
              if (containerWidth < 400) return 1;
              if (containerWidth < 800) return 2;
              return 3;
            }}
            render={{
              photo: (_, { photo, width, height }) => (
                <div
                  key={photo.key}
                  onClick={() => onPreview(photo.key)}
                  style={{ width, height }}
                  className="shadow-sm overflow-hidden rounded-xl transition hover:shadow-md hover:scale-[1.01] hover:opacity-70"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt ?? ""}
                    width={width}
                    height={height}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                    loading="lazy"
                  />
                </div>
              ),
            }}
          />

          {/* Infinite scroll */}
          <div
            ref={loaderRef}
            className="py-10 text-center text-xs md:text-sm text-gray-500"
          >
            {cursor
              ? "Loading more beautiful memories..."
              : "You've reached the end ✨"}
          </div>
        </div>
      </div>
    </>
  );
}
