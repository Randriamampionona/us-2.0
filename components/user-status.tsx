"use client";

import { getOtherUser } from "@/action/get-other-user";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import { TUser } from "@/typing";
import { useAuth } from "@clerk/nextjs";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function UserStatus() {
  const { userId } = useAuth();
  const { current: socket } = useSocket();
  const [isOnline, setIsOnline] = useState(false);
  const [user, setUser] = useState<TUser | null>(null);

  useEffect(() => {
    if (!socket || !userId) return;

    const timiID = setInterval(() => {
      socket.emit("status", {
        userId,
      });

      socket.on("status:set", (status: boolean) => {
        setIsOnline(status);
      });
    }, 5000);

    return () => {
      socket.off("status");
      socket.off("status:set");
      clearInterval(timiID);
    };
  }, [socket, userId]);

  useEffect(() => {
    const getUser = async () => {
      const user = await getOtherUser();
      setUser(user);
    };

    getUser();

    return () => {
      getUser();
    };
  }, []);

  return (
    <div className="group flex items-center justify-start space-x-2 select-none">
      <div className="cursor-pointer">
        {isOnline ? (
          <div className="relative">
            <Wifi className="opacity-50" />
            <span className="absolute top-0 -right-1 text-[9px]">🟢</span>
          </div>
        ) : (
          <div className="relative">
            <WifiOff className="opacity-50" />
            <span className="absolute top-0 -right-1 text-[9px]">🔴</span>
          </div>
        )}
      </div>

      {user && (
        <p
          className={cn(
            "text-sm text-muted-foreground hidden group-hover:block",
            isOnline && "mt-1"
          )}
        >
          {user.username} is {isOnline ? "connected" : "disconnected"}
        </p>
      )}
    </div>
  );
}
