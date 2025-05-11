"use client";

import { TMessage, TMessages } from "@/typing";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { use, useEffect, useRef, useState } from "react";
import Message from "./message";
import { db } from "@/firebase";
import { CHATCOLECTION_DEV, CHATCOLECTION_PROD } from "@/constant";

import { deleteMessage } from "@/action/delete-message.action";
import ChatLoading from "./chat-loading";
import { useInView } from "react-intersection-observer";
import { setSeen } from "@/action/set-seen.action";
import { useAuth } from "@clerk/nextjs";
import ImagePreview from "./image-preview";
import { useImagePreview } from "@/store/use-image-preview.store";

const CHATCOLECTION =
  process.env.NODE_ENV === "development"
    ? CHATCOLECTION_DEV
    : CHATCOLECTION_PROD;

export default function ChatView() {
  const { userId } = useAuth();
  const { imageData } = useImagePreview();
  const [messages, setMessages] = useState<TMessages>([]);
  const [loading, setLoading] = useState(true);
  const endOfListRef = useRef<HTMLDivElement | null>(null);
  const [trigger, setTrigger] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const othersLastMessage: TMessage = [...messages]
    .reverse()
    .find((message) => message.sender_id !== userId);

  const onDelete = async (messageID: string) => {
    try {
      await deleteMessage(messageID);
    } catch (error) {
      console.log(error);
    }
  };

  // listen to messages
  useEffect(() => {
    const q = query(
      collection(db, CHATCOLECTION), // Specify the collection
      orderBy("timestamp", "asc") // Order by timestamp field in descending order (newest first)
    );
    // Reference to the Firestore collection
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        // Map snapshot docs to an array of data
        const fetchedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Update the state with the fetched data
        setMessages(fetchedData);
        setLoading(false); // Set loading to false after data is fetched
      },
      (error) => {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    );

    // Cleanup the listener when the component unmounts or when `useEffect` reruns
    return () => unsub();
  }, []);

  useEffect(() => {
    // Scroll to the bottom whenever new messages are added
    if (endOfListRef.current) {
      endOfListRef.current.scrollIntoView({
        behavior: "smooth", // Smooth scrolling
        block: "end", // Scroll to the end of the element
      });
    }
  }, [messages.length]);

  useEffect(() => {
    if (inView) {
      const updater = async () => {
        try {
          await setSeen();
        } catch (error) {
          console.log(error);
        }
      };

      updater();
    }
  }, [inView, messages]);

  useEffect(() => {
    // Set an interval to toggle the `trigger` state every 3 seconds
    const interval = setInterval(() => {
      setTrigger((prev) => !prev); // Toggle the state between true and false
    }, 5000); // 3000 milliseconds = 3 seconds

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading) return <ChatLoading />;

  return (
    <>
      {messages.length > 0 ? (
        <>
          {!!imageData && (
            <ImagePreview open={openPreview} setOpen={setOpenPreview} />
          )}
          <div className="flex-1 w-[calc(100vw-2rem)] md:w-[calc(100vw-7rem)] lg:w-[calc(100vw-45rem)] mx-auto h-fit overflow-y-auto overflow-x-hidden px-2">
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onDelete={onDelete}
                setOpenPreview={setOpenPreview}
              />
            ))}
            <div ref={endOfListRef} className="h-4" />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center w-[calc(100vw-2rem)] md:w-[calc(100vw-7rem)] lg:w-[calc(100vw-45rem)] mx-auto h-fit overflow-y-auto overflow-x-hidden space-y-4 px-2">
          <p className="text-muted-foreground">No Chat yet!</p>
        </div>
      )}
      {trigger && othersLastMessage?.is_seen == false && (
        <div ref={ref} className="fixed top-0" />
      )}
    </>
  );
}
