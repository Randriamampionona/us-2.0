"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import {
  Camera,
  ImagePlay,
  LoaderCircle,
  SendHorizonal,
  SmilePlus,
} from "lucide-react";
import { ChangeEvent, use, useEffect, useRef, useState } from "react";
import Emoji from "./emoji";
import { useEditMessage } from "@/store/use-edit-message.store";
import { editMessage } from "@/action/edit-message.action";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TMessageDataToSend } from "@/typing";
import { uploadAsset } from "@/action/upload-asset.action";
import { UploadApiResponse } from "cloudinary";
import UuploadAassetPreview from "./upload-asset-preview";
import { toastify } from "@/utils/toastify";
import EditMessageBanner from "./edit-message-banner";
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import TypingBubble from "./typing-bubble";
import { USERCOLECTION_DEV, USERCOLECTION_PROD } from "@/constant";
import { cn } from "@/lib/utils";
import Gif from "./gif";
import { useReply } from "@/store/use-reply.store";
import ReplyToMessageBanner from "./reply-to-message-banner";
import { sendMessage } from "@/action/send-message.action";
import VoiceInput from "./voice-input";
import SoundPlayer from "./sound-effect/new-message-sent-effect-player";
import { useSoundEffect } from "@/store/use-sound-effect.store";
import { useMessageEffect } from "@/store/use-message-effect.store";

const USERCOLECTION =
  process.env.NODE_ENV === "development"
    ? USERCOLECTION_DEV
    : USERCOLECTION_PROD;

type TTypingUser = {
  user_id: string;
  active: boolean;
  typing: boolean;
  username: string;
};

export default function ChatForm() {
  const { userId } = useAuth();
  const { user } = useUser();
  const { replyTo, resetReplyId } = useReply();
  const { message_id, message, reset } = useEditMessage();
  const { play, setPlay } = useSoundEffect();
  const { lastMessage, setLastMessage } = useMessageEffect();

  const [value, setValue] = useState("");
  const [asset, setAsset] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isGifOpen, setIsGifOpen] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [typingUser, setTypingUser] = useState<TTypingUser | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isOnRecord, setIsOnRecord] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sendBtnRef = useRef<HTMLButtonElement | null>(null);

  const isOnEdit = !!message_id;

  const onChangeFn = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);

    if (!userId) return;

    setDoc(
      doc(db, USERCOLECTION, userId),
      {
        typing: true,
      },
      { merge: true }
    );

    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      setDoc(
        doc(db, USERCOLECTION, userId),
        {
          typing: false,
        },
        { merge: true }
      );
    }, 2000);

    setTypingTimeout(timeout);
  };

  const onClearAssetPreview = () => {
    setAsset(null);
  };

  // Handle file input change and generate the preview
  const handleFileChange = (files: FileList | null) => {
    if (files && files?.length > 0) {
      // Check if the file is an image
      const file = files[0];
      if (file.type.startsWith("image/")) {
        if (file.size <= 20 * 1024 * 1024) {
          // < 20MB
          const reader = new FileReader();
          reader.onloadend = () => {
            setAsset(reader.result as string); // Set the data URL as preview
          };
          reader.readAsDataURL(file); // Convert file to a data URL
        } else {
          alert("File size exceeds 20MB. Please select a smaller file.");
        }
        // Check if the file size is less than or equal to 20MB
      } else {
        alert("Please select a valid image file.");
      }
    }

    // Reset the input so selecting the same file again will trigger onChange
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleImgPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Image = event.target?.result as string;
            setAsset(base64Image); // set preview
            // Optionally, upload base64Image to server here
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const onSend = async () => {
    if (isPending || !userId || !user || (!value.trim() && !asset)) return;

    setIsPending(true);

    try {
      let assetData: UploadApiResponse | null = null;

      if (asset) {
        const uploadedAsset = await uploadAsset(asset);

        if (uploadedAsset) {
          toastify("success", "Image uploaded");
        }

        assetData = uploadedAsset as UploadApiResponse;
      }

      const data: TMessageDataToSend = assetData
        ? {
            sender_id: userId,
            username: user.firstName,
            message: value.trim(),
            reaction: null,
            is_seen: false,
            is_deleted: false,
            reply_to: replyTo,
            asset: assetData,
          }
        : {
            sender_id: userId,
            username: user.firstName,
            message: value.trim(),
            reaction: null,
            is_seen: false,
            is_deleted: false,
            reply_to: replyTo,
          };

      if (isOnEdit) {
        await editMessage({
          message_id,
          message: value.trim(),
        });

        return;
      }

      await sendMessage(data);
    } catch (error: any) {
      toastify("error", error.message);
    } finally {
      setIsPending(false);
      setValue("");
      setAsset(null);
      reset();
      resetReplyId();
      setLastMessage(value.trim());
    }
  };

  useEffect(() => {
    if (!!message_id) {
      setValue(message);
    }
  }, [message]);

  // Update textarea height based on content size
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = !value.trim() ? "2.5rem" : "auto"; // Reset height to auto before recalculating
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scrollHeight
      // Add overflow-y auto if height exceeds 15rem
      if (textareaRef.current.scrollHeight > 20 * 16) {
        // 15rem in pixels (16px per rem)
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden"; // or "initial" depending on your preference
      }
    }
  }, [value]);

  // listen to typing
  useEffect(() => {
    const q = query(collection(db, USERCOLECTION), where("typing", "==", true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typingUsers = snapshot.docs
        .filter((doc) => doc.id !== userId) // exclude yourself
        .map((doc) => ({
          user_id: doc.id,
          ...doc.data(),
        })) as TTypingUser[];

      setTypingUser(typingUsers[0]);
    });

    return () => unsubscribe(); // cleanup listener
  }, [userId]);

  // play sound on typing user
  useEffect(() => {
    !!typingUser && typingUser.typing && setPlay(true);
  }, [typingUser]);

  // Reset play sound after 500ms whenever it changes to true
  useEffect(() => {
    if (!play) return;

    const timer = setTimeout(() => setPlay(false), 500);
    return () => clearTimeout(timer);
  }, [play]);

  useEffect(() => {
    if (typeof window == undefined) return;
    window.addEventListener("keydown", async (e) => {
      const code = e.code;
      const hasCtrl = e.ctrlKey;

      switch (e.code) {
        case "Enter":
          if (hasCtrl) {
            sendBtnRef.current?.click();
          }

          break;

        default:
          break;
      }
    });
  }, [typeof window, sendBtnRef.current]);

  return (
    <div
      className={cn(
        "w-[calc(100vw-2rem)] md:w-[calc(100vw-7rem)] lg:w-[calc(100vw-45rem)] mx-auto h-fit pt-2 space-y-1",
        isPending && "opacity-45"
      )}
    >
      {/* This will play the sound whenever there is a new message */}
      {!!typingUser && typingUser.typing && (
        <SoundPlayer source="/sounds/typing.mp3" />
      )}

      {/* typing indicator */}
      {!!typingUser && typingUser.typing && (
        <TypingBubble username={typingUser.username} />
      )}

      {/* asset preview */}
      {asset && (
        <UuploadAassetPreview
          asset={asset}
          onClear={onClearAssetPreview}
          isPending={isPending}
        />
      )}

      {/* edit banna indicator */}
      {isOnEdit && <EditMessageBanner setValue={setValue} />}

      {replyTo && <ReplyToMessageBanner />}

      <form
        className={cn(
          "w-full",
          !isOnRecord && "bg-card-foreground/5 border rounded-md"
        )}
      >
        {/* input */}
        {!isOnRecord && (
          <div className="flex-1 space-y-1">
            <textarea
              autoFocus
              spellCheck={false}
              lang="zxx"
              autoComplete="off"
              ref={textareaRef}
              className="resize-none overflow-y-hidden flex h-10 max-h-64 w-full rounded-none border-none border-input bg-transparent px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm outline-none ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none"
              placeholder="Message"
              value={value}
              disabled={isPending || isOnRecord}
              onChange={onChangeFn}
              onPaste={handleImgPaste}
            />
          </div>
        )}

        {/* chat options */}
        <div
          className={cn(
            "flex items-center space-x-4 divide-x-2 p-2 pr-4",
            isOnRecord ? "justify-center" : "justify-end"
          )}
        >
          <div
            className={cn(
              "flex items-center space-x-4",
              isOnRecord && "flex-1"
            )}
          >
            {/* emoji btn */}
            {!isOnRecord && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={isPending}
                    className="opacity-65"
                  >
                    <SmilePlus size={20} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Emoji setValue={setValue} textareaRef={textareaRef} />
                </PopoverContent>
              </Popover>
            )}

            {/* gif btn */}
            {!isOnRecord && (
              <Popover
                open={isGifOpen}
                onOpenChange={(open) => setIsGifOpen(open)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="opacity-65"
                    disabled={isPending}
                  >
                    <ImagePlay size={20} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Gif
                    setIsPending={setIsPending}
                    setIsGifOpen={setIsGifOpen}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* asset btn */}
            {!isOnRecord && (
              <>
                <button
                  type="button"
                  className="opacity-65"
                  disabled={isPending || isOnEdit}
                  onClick={() => inputRef.current?.click()}
                >
                  <Camera size={20} />
                </button>
                <input
                  ref={inputRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="hidden"
                />
              </>
            )}

            {/* vocal input */}
            <VoiceInput setIsOnRecord={setIsOnRecord} isOnRecord={isOnRecord} />
          </div>

          {/* send btn */}
          {!isOnRecord && (
            <button
              type="button"
              disabled={isPending || (!value && !asset)}
              onClick={onSend}
              className="pl-4 opacity-65"
              ref={sendBtnRef}
            >
              {isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <SendHorizonal size={20} />
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
