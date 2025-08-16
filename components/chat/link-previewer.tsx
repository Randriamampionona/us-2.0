"use client";

import { cn } from "@/lib/utils";
import { Copy, Link } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { toastify } from "@/utils/toastify";

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

  const onCopy = async () => {
    if (!url) return;

    if (!navigator.clipboard) {
      console.error("Clipboard API not supported");
      alert("Clipboard not supported in your browser");
      return;
    }

    try {
      await navigator.clipboard.writeText(url);

      toastify("success", "Copied to clipboard");
    } catch (err) {
      alert("Failed to copy text to clipboard. Please try again.");
    }
  };

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

  console.log(data);

  return (
    <div
      className={cn(
        "group relative block max-w-md min-h-24 min-w-96 mx-auto rounded-xl border border-neutral-200 bg-foreground shadow-md hover:shadow-lg transition overflow-hidden",
        isSender ? "rounded-br-none" : "rounded-bl-none"
      )}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center space-x-4 bg-transparent hover:bg-background/50 w-full h-full">
        <Button className="shadow-lg" variant={"secondary"} onClick={onCopy}>
          <span>Copy link</span>
          <Copy />
        </Button>
        <Button className="shadow-lg" variant={"secondary"} asChild>
          <a href={data.url || url} target="_blank" rel="noopener noreferrer">
            <span>Open link</span>
            <Link />
          </a>
        </Button>
      </div>

      <div>
        {data.images?.[0] && (
          <img
            src={data.images[0]}
            alt={data.title || "preview"}
            className="w-full h-48 object-cover rounded-t-xl"
          />
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-background">
            {data.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {data.description}
          </p>
          <p className="text-xs text-blue-500 mt-2">{data.siteName}</p>
        </div>
      </div>
    </div>
  );
}
