"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Send, SmilePlus } from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { sendMessage } from "@/action/send-message.action";
import Emoji from "./emoji";
import { useEditMessage } from "@/store/use-edit-message.store";
import { editMessage } from "@/action/edit-message.action";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TMessageDataToSend } from "@/typing";

export default function ChatForm() {
  const { userId } = useAuth();
  const { user } = useUser();

  const { message_id, message, reset } = useEditMessage();
  const [value, setValue] = useState("");
  const [isPending, setIsPending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isOnEdit = !!message_id;

  const onChangeFn = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const onSend = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (isPending || !userId || !user || !value.trim()) return;

    setIsPending(true);

    try {
      const data: TMessageDataToSend = {
        sender_id: userId,
        username: user.firstName,
        message: value.trim(),
        reaction: null,
        is_seen: false,
        is_deleted: false,
      };

      if (isOnEdit) {
        await editMessage({
          message_id,
          message: value.trim(),
        });

        return;
      }

      await sendMessage(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsPending(false);
      setValue("");
      reset();
    }
  };

  const onEnterPress = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if Enter is pressed without Shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await onSend();
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

  return (
    <div className="w-[calc(100vw-2rem)] md:w-[calc(100vw-7rem)] lg:w-[calc(100vw-45rem)] mx-auto h-fit pt-2 space-y-4">
      <form
        className="flex items-end justify-between gap-x-2 w-full"
        onSubmit={onSend}
      >
        <textarea
          autoFocus
          ref={textareaRef}
          className="flex-1 resize-none overflow-y-hidden flex h-10 max-h-80 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          placeholder="Type your message here."
          value={value}
          disabled={isPending}
          onKeyDown={onEnterPress}
          onChange={onChangeFn}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button">
              <SmilePlus />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Emoji setValue={setValue} textareaRef={textareaRef} />
          </PopoverContent>
        </Popover>

        <Button size={"icon"} type="submit" disabled={isPending || !value}>
          <Send />
        </Button>
      </form>
    </div>
  );
}
