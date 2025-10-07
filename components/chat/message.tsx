import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { TMessage, TReaction } from "@/typing";
import { formatTimeAgo } from "@/utils/format-timeago";
import { useAuth, useUser } from "@clerk/nextjs";
import { Dispatch, SetStateAction, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
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
import Picker from "@emoji-mart/react";
import { Badge } from "@/components/ui/badge";
import {
  Clipboard,
  CornerDownLeft,
  Edit,
  Pencil,
  SmilePlus,
  Trash2,
} from "lucide-react";
import { useEditMessage } from "@/store/use-edit-message.store";
import { setReaction } from "@/action/set-reaction.action";
import Image from "next/image";
import { isValidUrl } from "@/utils/link-checker";
import { useImagePreview } from "@/store/use-image-preview.store";
import { isSingleEmoji } from "@/utils/emoji-checker";
import { useTheme } from "next-themes";
import { useReply } from "@/store/use-reply.store";
import MessageReply from "./message-reply";
import { toastify } from "@/utils/toastify";
import AudioPlayer from "./audio-palyer";
import LinkPreviewer from "./link-previewer";
import UnsentMessage from "./unsent-message";

type TProps = {
  message: TMessage;
  onDelete: (messageID: string) => Promise<void>;
  setOpenPreview: Dispatch<SetStateAction<boolean>>;
};

type Reaction = {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
};

const inter = Inter({ subsets: ["latin"] });

export default function Message({ message, onDelete, setOpenPreview }: TProps) {
  const { userId } = useAuth();
  const { user } = useUser();
  const { theme } = useTheme();
  const { replyTo, setReplyId } = useReply();

  const { setNewMessage } = useEditMessage();
  const { setImageData } = useImagePreview();
  const [isRectionOpen, setIsRectionOpen] = useState(false);

  const isSender = (user_id: string) => {
    return userId == user_id;
  };

  const onChangeReaction = async (
    reaction: string,
    message_id: string,
    key: "remove" | "set"
  ) => {
    if (!userId) return;

    if (key === "set") {
      setIsRectionOpen(false);
    }

    const reactionData: TReaction = {
      reactor_id: userId,
      reactor_username: user?.firstName!,
      reaction,
    };

    try {
      await setReaction({
        message_id,
        reactionData: key === "remove" ? null : reactionData,
        isRemove: key === "remove" ? true : false,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const triggerReply = () => {
    const content = {
      message_id: message.id,
      message: message.message,
      assets: message.asset,
      audio: message.audio,
      gif: {
        ...message.gif,
        id: message.gif?.id ?? "",
        tenorUrl: message.gif?.tenorUrl ?? "",
        shortTenorUrl: message.gif?.shortTenorUrl ?? "",
        description: message.gif?.description ?? "",
        createdAt:
          message.gif?.createdAt instanceof Date
            ? message.gif?.createdAt
            : new Date(),
        tags: message.gif?.tags ?? [],
        url: message.gif?.url ?? "",
        height: message.gif?.height ?? 0,
        width: message.gif?.width ?? 0,
        preview: {
          url: message.gif?.preview?.url ?? "",
          height: message.gif?.preview?.height ?? 0,
          width: message.gif?.preview?.width ?? 0,
        },
      },
    };

    setReplyId({
      id: message.id,
      content,
      username: message.username,
      senderId: message.sender_id,
    });
  };

  const onCopy = async (text: string) => {
    if (!message.message) return;

    if (!navigator.clipboard) {
      console.error("Clipboard API not supported");
      alert("Clipboard not supported in your browser");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);

      toastify("success", "Copied to clipboard");
    } catch (err) {
      alert("Failed to copy text to clipboard. Please try again.");
    }
  };

  const messageUX = {
    hasSeenOrReaction: !!message.reaction || !!message.is_seen,
    hasAsset: !!message.asset && !message.message,
    hasGif: !!message.gif && !message.message,
    hasAudio: !!message.audio && !message.message,
    isLink: isValidUrl(message.message),
    receiverOnlyEmoji:
      !isSender(message.sender_id) && isSingleEmoji(message.message),
    receiverOnlyAsset:
      !isSender(message.sender_id) && message.asset && !message.message,
    receiverOnlyGif:
      !isSender(message.sender_id) && message.gif && !message.message,
    receiverOnlyAudio:
      !isSender(message.sender_id) && message.audio && !message.message,
  };

  const messageUI = {
    default: {
      sender:
        "relative px-4 py-3 rounded-md w-fit max-w-[calc(100%-3rem)] md:max-w-[calc(100%-7rem)] lg:max-w-[calc(100%-13rem)] bg-loveRose text-primary-foreground dark:text-foreground ml-auto rounded-br-none",
      receiver:
        "relative px-4 py-3 rounded-md w-fit max-w-[calc(100%-3rem)] md:max-w-[calc(100%-7rem)] lg:max-w-[calc(100%-13rem)] bg-gray-200 dark:text-background rounded-bl-none",
    },
    emoji: {
      default: "bg-transparent p-0",
      receiver: "!text-foreground",
    },
    assets: {
      default: "bg-transparent p-0",
      receiver: "!text-foreground",
    },
    gif: {
      default: "bg-transparent p-0",
      receiver: "!text-foreground",
    },
    audio: {
      default: "bg-transparent p-0",
      receiver: "!text-foreground",
    },
    link: {
      default: "bg-transparent p-0",
      receiver: "!text-foreground",
    },
    hasSeenOrReaction: "",
  };

  return (
    <>
      {/* tracking */}
      <div id={message.id} />

      {message.is_deleted ? (
        <UnsentMessage
          isSender={isSender(message.sender_id)}
          message={message}
        />
      ) : (
        <div>
          {/* message reply */}
          {message.reply_to && (
            <MessageReply
              className={
                isSender(message.sender_id)
                  ? messageUI.default.sender
                  : messageUI.default.receiver
              }
              message={message.reply_to}
            />
          )}

          {/* message */}
          <div
            className={cn(
              "mb-14",
              isSender(message.sender_id)
                ? messageUI.default.sender
                : messageUI.default.receiver,
              messageUX.hasSeenOrReaction && messageUI.hasSeenOrReaction,
              isSingleEmoji(message.message) && messageUI.emoji.default,
              messageUX.hasAsset && messageUI.assets.default,
              messageUX.hasGif && messageUI.gif.default,
              messageUX.hasAudio && messageUI.audio.default,
              messageUX.isLink && messageUI.link.default
            )}
            onDoubleClick={triggerReply}
          >
            {/* reaction */}
            {!!message.reaction && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        "absolute -bottom-6 left-0 px-2 cursor-default",
                        message.reaction?.reactor_id == userId &&
                          "cursor-pointer"
                      )}
                      onClick={() =>
                        message.reaction?.reactor_id == userId &&
                        onChangeReaction("", message.id, "remove")
                      }
                    >
                      {message.reaction?.reaction}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {message.sender_id != userId
                        ? "You"
                        : message.reaction.reactor_username}
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

            {/* git */}
            {message.gif && (
              <Image
                src={message.gif.url}
                alt={message.gif.description ?? ""}
                width={message.gif.width}
                height={message.gif.height}
              />
            )}

            {/* Audio */}
            {message.audio && (
              <AudioPlayer
                src={message.audio.secure_url}
                isSender={isSender(message.sender_id)}
                isReply={false}
              />
            )}

            {/* message */}
            {messageUX.isLink ? (
              <LinkPreviewer
                url={message.message}
                isSender={isSender(message.sender_id)}
              />
            ) : (
              <p
                className={cn(
                  inter.className,
                  "whitespace-pre-line",
                  isSingleEmoji(message.message) && "text-6xl",
                  !isSingleEmoji(message.message) && "truncate"
                )}
              >
                {message.message}
              </p>
            )}

            {/* seen */}
            {message.is_seen && message.sender_id == userId && (
              <span className="absolute -bottom-6 te right-0 px-2 text-primary/20 italic">
                seen
              </span>
            )}

            {/* date */}
            {!!message?.editedAt ? (
              <span
                className={cn(
                  "text-[0.7rem] font-light text-nowrap opacity-40",

                  messageUX.receiverOnlyEmoji && messageUI.emoji.receiver,

                  messageUX.receiverOnlyAsset && messageUI.assets.receiver,

                  messageUX.receiverOnlyGif && messageUI.gif.receiver,

                  messageUX.receiverOnlyAudio && messageUI.audio.receiver,

                  messageUX.isLink && messageUI.link.receiver
                )}
              >
                {formatTimeAgo(message.editedAt, true)}
              </span>
            ) : (
              <span
                className={cn(
                  "text-[0.7rem] font-light text-nowrap opacity-40",

                  messageUX.receiverOnlyEmoji && messageUI.emoji.receiver,

                  messageUX.receiverOnlyAsset && messageUI.assets.receiver,

                  messageUX.receiverOnlyGif && messageUI.gif.receiver,

                  messageUX.receiverOnlyAudio && messageUI.audio.receiver,

                  messageUX.isLink && messageUI.link.receiver
                )}
              >
                {formatTimeAgo(message.timestamp, false)}
              </span>
            )}

            {/* message option */}
            {isSender(message.sender_id) ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="absolute top-0 -left-5 text-primary/20 hover:text-primary">
                  <Edit size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => setNewMessage(message.id, message.message)}
                  >
                    <div className="flex items-center justify-start space-x-2">
                      <DropdownMenuShortcut>
                        <Pencil />
                      </DropdownMenuShortcut>
                      <p>Edit</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={triggerReply}>
                    <div className="flex items-center justify-start space-x-2">
                      <DropdownMenuShortcut>
                        <CornerDownLeft />
                      </DropdownMenuShortcut>
                      <p>Reply</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onCopy(message.message)}
                    disabled={!message.message}
                  >
                    <div className="flex items-center justify-start space-x-2">
                      <DropdownMenuShortcut>
                        <Clipboard />
                      </DropdownMenuShortcut>
                      <p>Copy</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(message.id)}
                    className="text-destructive hover:!bg-destructive/10 hover:!text-destructive"
                  >
                    <div className="flex items-center justify-start space-x-2">
                      <DropdownMenuShortcut>
                        <Trash2 />
                      </DropdownMenuShortcut>
                      <p>Delete</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex flex-col space-y-1 absolute top-0 -right-5 ">
                {!isSingleEmoji(message.message) && (
                  <Popover
                    open={isRectionOpen}
                    onOpenChange={(open) => setIsRectionOpen(open)}
                  >
                    <PopoverTrigger asChild>
                      <span className="text-primary/20 hover:text-primary">
                        <SmilePlus size={16} />
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Picker
                        theme={theme ?? "light"}
                        onEmojiSelect={(reaction: Reaction) =>
                          onChangeReaction(reaction.native, message.id, "set")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger className="text-primary/20 hover:text-primary">
                    <Edit size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={triggerReply}>
                      <div className="flex items-center justify-start space-x-2">
                        <DropdownMenuShortcut>
                          <CornerDownLeft />
                        </DropdownMenuShortcut>
                        <p>Reply</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onCopy(message.message)}
                      disabled={!message.message}
                    >
                      <div className="flex items-center justify-start space-x-2">
                        <DropdownMenuShortcut>
                          <Clipboard />
                        </DropdownMenuShortcut>
                        <p>Copy</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
