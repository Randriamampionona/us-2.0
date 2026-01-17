"use client";
import { useEffect, useRef } from "react";

export default function NativeBar() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.firstChild) {
      const script = document.createElement("script");
      script.src =
        "https://pl28501494.effectivegatecpm.com/192eddeaf96e79f78f8d1970b2a5f13a/invoke.js";
      script.async = true;
      script.setAttribute("data-cfasync", "false");

      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-6 px-4">
      {/* Label and Divider */}
      <div className="w-full max-w-[1000px] flex items-center gap-2 mb-2 opacity-60">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          Advertisement
        </span>
        <div className="h-[1px] w-full bg-border" />
      </div>

      {/* Ad Container */}
      <div
        id="container-192eddeaf96e79f78f8d1970b2a5f13a"
        ref={adRef}
        className="w-full max-w-[1000px] min-h-[200px] bg-secondary/5 rounded-lg border border-border/50 overflow-hidden"
      >
        {/* Adsterra will inject the ad content here */}
      </div>
    </div>
  );
}
