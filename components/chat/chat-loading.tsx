"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import waitingGIf_1 from "@/app/gifs/waiting-bubu-1.gif";
import waitingGIf_2 from "@/app/gifs/waiting-bubu-2.gif";
import waitingGIf_3 from "@/app/gifs/waiting-bubu-3.gif";
import waitingGIf_4 from "@/app/gifs/waiting-bubu-4.gif";
import waitingGIf_5 from "@/app/gifs/waiting-bubu-5.gif";
import waitingGIf_6 from "@/app/gifs/waiting-bubu-6.gif";

const gifs = [
  waitingGIf_1,
  waitingGIf_2,
  waitingGIf_3,
  waitingGIf_4,
  waitingGIf_5,
  waitingGIf_6,
];

export default function ChatLoading() {
  const [gifIndex, setGifIndex] = useState<number | null>(null);

  useEffect(() => {
    const index = Math.floor(Math.random() * gifs.length);
    setGifIndex(index);
  }, []);

  if (gifIndex === null) {
    // Optional: loading placeholder or nothing
    return (
      <div className="flex-1 flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex-col space-y-2 flex items-center justify-center w-[calc(100vw-2rem)] md:w-[calc(100vw-7rem)] lg:w-[calc(100vw-45rem)] mx-auto h-fit overflow-y-auto overflow-x-hidden px-2">
      <Image src={gifs[gifIndex]} alt="waiting..." width={250} height={250} />
      <p className="text-muted-foreground">Waiting...</p>
    </div>
  );
}
