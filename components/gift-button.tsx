"use client";

import { Button } from "@/components/ui/button";
import { getchGifs } from "@/action/get-gif";
import { useEffect, useState } from "react";
import GifSection from "./gif-section";
import { Loader } from "lucide-react";

export default function GiftButton() {
  const [gifUrl, setGifUrl] = useState<string | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);
  const [timer, setTimer] = useState(0);

  const onClick = async () => {
    if (isPending) return false;

    try {
      setIsPending(true);

      const result = await getchGifs();
      setGifUrl(result);
      if (!!result) setTimer(7);
    } catch (error) {
      console.log(error);
      setIsPending(false);
      setTimer(0);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  return (
    <div className="w-full flex items-center justify-center mt-6">
      <Button
        size="lg"
        className="rounded-lg text-white font-bold bg-loveRose shadow-2xl shadow-loveRose hover:bg-loveRose/75"
        onClick={onClick}
        disabled={isPending || timer > 0}
      >
        {isPending ? (
          <Loader className="animate-spin" />
        ) : (
          <span>I Love You 😘</span>
        )}
      </Button>
      {!!gifUrl && timer > 0 ? <GifSection src={gifUrl} /> : null}
    </div>
  );
}
