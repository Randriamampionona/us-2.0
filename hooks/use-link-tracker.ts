"use client";

import { useEffect, useState, useRef } from "react";

export default function useLinkTracker() {
  const [hashId, setHashId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateHash = () => {
      const hash = window.location.hash;
      const newHashId = hash ? hash.substring(1) : null;
      setHashId(newHashId);

      // Clear any existing timeout before setting a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (newHashId) {
        timeoutRef.current = setTimeout(() => {
          window.history.replaceState(null, "", window.location.pathname);
          setHashId(null); // Optional: clear local state
        }, 3000);
      }
    };

    // Run initially (in case page loads with a hash)
    updateHash();

    // Listen for hash changes
    window.addEventListener("hashchange", updateHash);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("hashchange", updateHash);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { hashId };
}
