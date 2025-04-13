import { cn } from "@/lib/utils";
import { TMessage } from "@/typing";
import { formatTimeAgo } from "@/utils/format-timeago";
import { useAuth } from "@clerk/nextjs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import { ReactionBarSelector } from "@charkour/react-reactions";

import { Dispatch, SetStateAction, useRef } from "react";
import { Edit, SmilePlus } from "lucide-react";
import { useEditMessage } from "@/store/use-edit-message.store";
import { setReaction } from "@/action/set-reaction.action";
import Image from "next/image";
import { isValidUrl } from "@/utils/link-checker";
import LinkPreviewer from "./link-preview";
import { useImagePreview } from "@/store/use-image-preview.store";

type TProps = {
  message: TMessage;
  onDelete: (messageID: string) => Promise<void>;
  setOpenPreview: Dispatch<SetStateAction<boolean>>;
};

const reactionEmoji = [
  {
    key: "satisfaction",
    value: "👍",
  },
  {
    key: "love",
    value: "❤️",
  },
  {
    key: "happy",
    value: "😆",
  },
  {
    key: "surprise",
    value: "😮",
  },
  {
    key: "sad",
    value: "😢",
  },
  {
    key: "angry",
    value: "😡",
  },
];

export default function Message({ message, onDelete, setOpenPreview }: TProps) {
  const { userId } = useAuth();
  const { setNewMessage } = useEditMessage();
  const { setImageData } = useImagePreview();
  const reactionRef = useRef<HTMLButtonElement | null>(null);

  const isSender = (user_id: string) => {
    return userId == user_id;
  };

  const onChangeReaction = async (
    reaction: string,
    message_id: string,
    key: "remove" | "set"
  ) => {
    if (!userId) return;

    const reactionData: {
      reactor_id: string;
      reaction: string;
    } | null = {
      reactor_id: userId,
      reaction,
    };

    try {
      await setReaction({
        message_id,
        reactionData: key === "remove" ? null : reactionData,
      });
    } catch (error) {
      console.log(error);
    } finally {
      if (key === "set") {
        reactionRef.current?.click();
      }
    }
  };

  return (
    <>
      {message.is_deleted ? (
        <p
          className={cn(
            "px-4 py-3 border border-muted-foreground text-muted-foreground opacity-50 italic select-none cursor-default rounded-md w-fit max-w-[calc(100%-3rem)] md:max-w-[calc(100%-7rem)] lg:max-w-[calc(100%-13rem)]",
            isSender(message.sender_id) && "ml-auto"
          )}
        >
          {message.sender_id != userId ? message.username : "You"} unsent a
          message
        </p>
      ) : (
        <div
          className={cn(
            "relative px-4 py-3 rounded-md w-fit max-w-[calc(100%-3rem)] md:max-w-[calc(100%-7rem)] lg:max-w-[calc(100%-13rem)]",
            isSender(message.sender_id)
              ? "bg-loveRose text-primary-foreground dark:text-foreground ml-auto rounded-br-none"
              : "bg-gray-200 dark:text-background rounded-bl-none",
            (!!message.reaction || message.is_seen) && "!mb-8"
          )}
        >
          {!!message.reaction && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn(
                      "absolute -bottom-6 left-0 px-2 cursor-default",
                      message.reaction?.reactor_id == userId && "cursor-pointer"
                    )}
                    onClick={() =>
                      message.reaction?.reactor_id == userId &&
                      onChangeReaction("", message.id, "remove")
                    }
                  >
                    {
                      reactionEmoji.find(
                        (rct) => rct.key == message.reaction?.reaction
                      )?.value
                    }
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {message.sender_id != userId ? "You" : message.username}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* asset */}
          {message.asset && (
            <Image
              src={message.asset.secure_url}
              alt={message.asset.original_filename ?? ""}
              width={message.asset.width}
              height={message.asset.height}
              className="hover:contrast-[.95] cursor-pointer"
              onClick={() => {
                setImageData(message.asset!);
                setOpenPreview(true);
              }}
            />
          )}

          {/* message */}
          {isValidUrl(message.message) ? (
            <LinkPreviewer url={message.message} />
          ) : (
            <p className="whitespace-pre-line truncate">{message.message}</p>
          )}

          {message.is_seen && message.sender_id == userId && (
            <span className="absolute -bottom-6 te right-0 px-2 text-primary/20 italic">
              seen
            </span>
          )}

          {!!message?.editedAt ? (
            <span className="text-[0.7rem] font-light text-nowrap opacity-40">
              Edited {formatTimeAgo(message.editedAt)}
            </span>
          ) : (
            <span className="text-[0.7rem] font-light text-nowrap opacity-40">
              Sent {formatTimeAgo(message.timestamp)}
            </span>
          )}

          {isSender(message.sender_id) ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="absolute top-0 -left-5 text-primary/20 hover:text-primary">
                <Edit size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => setNewMessage(message.id, message.message)}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(message.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Popover>
              <PopoverTrigger asChild ref={reactionRef}>
                <span className="absolute top-0 -right-5 text-primary/20 hover:text-primary">
                  <SmilePlus size={16} />
                </span>
              </PopoverTrigger>
              <PopoverContent
                className="relative w-auto p-0 bg-transparent"
                align="center"
              >
                <ReactionBarSelector
                  iconSize={17}
                  style={{
                    position: "absolute",
                    top: "-3.5rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                  onSelect={(reaction) =>
                    onChangeReaction(reaction, message.id, "set")
                  }
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </>
  );
}
