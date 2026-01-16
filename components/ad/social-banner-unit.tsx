"use client";
import Script from "next/script";

export default function SocialBarUnit() {
  return (
    <Script
      id="adsterra-social-bar"
      src="https://pl28490202.effectivegatecpm.com/a7/90/c0/a790c0627afc664f67f3f1414120b51b.js"
      strategy="afterInteractive"
      // This ensures the script is placed correctly in the DOM
      onLoad={() => {
        console.log("Social Bar loaded successfully");
      }}
    />
  );
}
