"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type PreviewData = {
  title?: string;
  description?: string;
  images?: string[];
  siteName?: string;
  url: string;
  isSender: boolean;
};

export default function LinkPreviewer({ url, isSender }: PreviewData) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const res = await fetch(
          `/api/link-preview?url=${encodeURIComponent(url)}`,
          {
            cache: "no-store", // prevents any client or CDN caching
          }
        );
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Client fetch failed", e);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [url]);

  if (loading)
    return <p className="text-foreground italic">Generating link preview…</p>;
  if (!data) return <p className="text-red-500">Could not load preview.</p>;

  return (
    <a
      href={data.url || url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block max-w-md mx-auto rounded-xl border border-neutral-200 bg-foreground shadow-md hover:shadow-lg transition",
        isSender ? "rounded-br-none" : "rounded-bl-none"
      )}
    >
      {data.images?.[0] && (
        <img
          src={data.images[0]}
          alt={data.title || "preview"}
          className="w-full h-48 object-cover rounded-t-xl"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-background">{data.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
        <p className="text-xs text-blue-500 mt-2">{data.siteName}</p>
      </div>
    </a>
  );
}
