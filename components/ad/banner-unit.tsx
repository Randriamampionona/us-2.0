"use client";
import Script from "next/script";

export default function BannerUnit() {
  return (
    <div className="flex justify-center w-full overflow-hidden">
      {/* This wrapper handles the responsiveness.
        On mobile: It scales the 728px banner down.
        On desktop: It shows at full size.
      */}
      <div className="relative w-full max-w-[728px] h-[90px] flex justify-center items-center overflow-hidden scale-50 sm:scale-75 md:scale-100 origin-center transition-transform">
        {/* 1. Define the config variable */}
        <Script id="adsterra-banner-config-728" strategy="afterInteractive">
          {`
            window.atOptions = {
              'key' : '5046c47cb44223cab428400643d44a39',
              'format' : 'iframe',
              'height' : 90,
              'width' : 728,
              'params' : {}
            };
          `}
        </Script>

        {/* 2. Load the actual ad script */}
        <Script
          id="adsterra-banner-invoke-728"
          src="https://www.highperformanceformat.com/5046c47cb44223cab428400643d44a39/invoke.js"
          strategy="afterInteractive"
        />
      </div>
    </div>
  );
}
