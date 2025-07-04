"use client";

import { ChevronsDown } from "lucide-react";
import React, { RefObject, useEffect, useState } from "react";
import { Button } from "../ui/button";

type Props = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  endOfListRef: RefObject<HTMLDivElement | null>;
};

export default function ScrollDownBtn({
  scrollContainerRef,
  endOfListRef,
}: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      // ?? Set threshold here (in pixels)
      setShow(distanceFromBottom > 300);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // Check immediately

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [scrollContainerRef]);

  const scrollToBottom = () => {
    endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <Button
      onClick={scrollToBottom}
      className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center justify-center px-4 py-2 rounded-full shadow-lg z-50"
    >
      <span>Scroll to bottom</span> <ChevronsDown />
    </Button>
  );
}
