"use client";

import { socket } from "@/lib/socket";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [NEXT_PUBLIC_SERVER_URL]);

  return socketRef;
}
