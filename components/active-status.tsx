import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getDocs, collection } from "firebase/firestore";
import { useSocket } from "@/hooks/use-socket";
import { db } from "@/firebase";
import { USERCOLECTION_DEV, USERCOLECTION_PROD } from "@/constant";
import { TUser } from "@/typing";
import { cn } from "@/lib/utils";

const USERCOLECTION =
  process.env.NODE_ENV === "development"
    ? USERCOLECTION_DEV
    : USERCOLECTION_PROD;

export default function ActiveStatus() {
  const { userId: myUserId } = useAuth();
  const socketRef = useSocket();
  const [isOnline, setIsOnline] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);

  // ✅ Get recipient only once
  useEffect(() => {
    const fetchOtherUser = async () => {
      const usersSnapshot = await getDocs(collection(db, USERCOLECTION));
      const recipients: TUser[] = usersSnapshot.docs
        .filter((doc) => doc.id !== myUserId)
        .map((doc) => {
          const user = doc.data() as Omit<TUser, "id">;
          return {
            id: doc.id,
            ...user,
          } satisfies TUser;
        });

      if (recipients.length > 0) {
        setOtherUserId(recipients[0].id);
      }
    };

    if (myUserId) {
      fetchOtherUser();
    }
  }, [myUserId]);

  // ✅ Socket connection and status listener
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !myUserId || !otherUserId) return;

    // Identify this user
    socket.emit("user:connect", myUserId);

    // Listen for status updates
    const handleStatus = ({
      userId,
      isOnline,
    }: {
      userId: string;
      isOnline: boolean;
    }) => {
      if (userId === otherUserId) {
        setIsOnline(isOnline);
      }
    };

    socket.on("user:status", handleStatus);

    // ✅ Auto-refresh every 5 seconds
    const intervalId = setInterval(() => {
      socket.emit("check:status", otherUserId, (res: { isOnline: boolean }) => {
        setIsOnline(res.isOnline);
      });
    }, 5000);

    return () => {
      socket.off("user:status", handleStatus);
      clearInterval(intervalId);
    };
  }, [socketRef, myUserId, otherUserId]);

  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full border-background border",
        isOnline
          ? "absolute bottom-[.35rem] right-[.1rem] bg-[#16c60c]"
          : "absolute bottom-[.35rem] right-[.1rem] bg-[#e81224]"
      )}
    />
  );
}
