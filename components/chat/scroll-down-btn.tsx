"use client";

import { ChevronsDown } from "lucide-react";
import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Button } from "../ui/button";

type Props = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  endOfListRef: RefObject<HTMLDivElement | null>;
  setIsAtBottom: Dispatch<SetStateAction<boolean>>;
};

export default function ScrollDownBtn({
  scrollContainerRef,
  endOfListRef,
  setIsAtBottom,
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
      setIsAtBottom(distanceFromBottom > 150);
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
      className="fixed bottom-[7.5rem] left-1/2 -translate-x-1/2 flex items-center justify-center px-4 py-2 rounded-full shadow-xl z-50"
    >
      <span>Scroll to newest</span> <ChevronsDown />
    </Button>
  );
}
