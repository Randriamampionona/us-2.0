"use client";

import { TMessage, TMessages } from "@/typing";
import {
  collection,
  endBefore,
  getDocs,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "@/firebase";
import { CHATCOLECTION_DEV, CHATCOLECTION_PROD } from "@/constant";
import { useInView } from "react-intersection-observer";
import { useAuth } from "@clerk/nextjs";

import Message from "./message";
import ChatLoading from "./chat-loading";
import ImagePreview from "./image-preview";
import { useImagePreview } from "@/store/use-image-preview.store";
import ScrollDownBtn from "./scroll-down-btn";
import { deleteMessage } from "@/action/delete-message.action";
import { setSeen } from "@/action/set-seen.action";

const CHATCOLECTION =
  process.env.NODE_ENV === "development"
    ? CHATCOLECTION_DEV
    : CHATCOLECTION_PROD;

const MESSAGE_LENGTH = process.env.NODE_ENV === "development" ? 5 : 75;

export default function ChatView() {
  const { userId } = useAuth();
  const { imageData } = useImagePreview();

  const [messages, setMessages] = useState<TMessages>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [trigger, setTrigger] = useState(false);

  const endOfListRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledInitially = useRef(false);

  const { ref: topRef, inView: topInView } = useInView({ threshold: 1 });
  const { ref: seenRef, inView: seenInView } = useInView();

  const othersLastMessage: TMessage = [...messages]
    .reverse()
    .find((msg) => msg.sender_id !== userId);

  const onDelete = async (id: string) => {
    try {
      await deleteMessage(id);
    } catch (err) {
      console.error(err);
    }
  };

  // Real-time listener for newest messages
  useEffect(() => {
    const q = query(
      collection(db, CHATCOLECTION),
      orderBy("timestamp", "asc"),
      limitToLast(MESSAGE_LENGTH)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(newMessages);
      setLastVisible(snapshot.docs[0] || null);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Scroll to bottom once after initial load
  useEffect(() => {
    if (!hasScrolledInitially.current && messages.length > 0) {
      endOfListRef.current?.scrollIntoView({ behavior: "auto" });
      hasScrolledInitially.current = true;
    }
  }, [messages.length]);

  // Scroll to bottom when a message is added
  useEffect(() => {
    if (messages.length > 0) {
      endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch older messages on scroll up
  useEffect(() => {
    const fetchOlder = async () => {
      if (!lastVisible || isFetchingMore) return;
      setIsFetchingMore(true);

      const q = query(
        collection(db, CHATCOLECTION),
        orderBy("timestamp", "asc"),
        endBefore(lastVisible),
        limitToLast(5)
      );

      const snap = await getDocs(q);
      if (!snap.empty) {
        const olderMessages = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const container = scrollContainerRef.current;
        const prevScrollHeight = container?.scrollHeight || 0;

        setMessages((prev) => [...olderMessages, ...prev]);
        setLastVisible(snap.docs[0]);

        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - prevScrollHeight;
          }
        });
      }

      setIsFetchingMore(false);
    };

    if (topInView) {
      fetchOlder();
    }
  }, [topInView]);

  // Seen detection
  useEffect(() => {
    if (seenInView) {
      setSeen().catch(console.error);
    }
  }, [seenInView, messages]);

  // Poll for seen trigger
  useEffect(() => {
    const iv = setInterval(() => setTrigger((p) => !p), 5000);
    return () => clearInterval(iv);
  }, []);

  if (loading) return <ChatLoading />;

  return (
    <>
      {imageData && (
        <ImagePreview open={openPreview} setOpen={setOpenPreview} />
      )}

      <div
        ref={scrollContainerRef}
        className="relative flex-1 w-[calc(100vw-2rem)] md:w-[calc(100vw-7rem)] lg:w-[calc(100vw-45rem)] mx-auto h-[80vh] overflow-y-auto overflow-x-hidden px-2"
      >
        {messages.length > 0 && (
          <div
            ref={topRef}
            className="relative flex justify-center items-center py-2"
          >
            {isFetchingMore && (
              <div className="absolute z-50 w-4 h-4 border-2 border-gray-300 border-t-loveRose animate-spin rounded-full" />
            )}
          </div>
        )}

        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onDelete={onDelete}
            setOpenPreview={setOpenPreview}
          />
        ))}

        <div ref={endOfListRef} className="h-4" />

        <ScrollDownBtn
          scrollContainerRef={scrollContainerRef}
          endOfListRef={endOfListRef}
        />
      </div>

      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center w-full h-64">
          <p className="text-muted-foreground">No Chat yet!</p>
        </div>
      )}

      {trigger && othersLastMessage?.is_seen == false && (
        <div ref={seenRef} id="OKOK" className="fixed top-0" />
      )}
    </>
  );
}
