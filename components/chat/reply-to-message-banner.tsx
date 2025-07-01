import { useReply } from "@/store/use-reply.store";
import { useUser } from "@clerk/nextjs";
import { X } from "lucide-react";
import { useState } from "react";

export default function ReplyToMessageBanner() {
  const { user } = useUser();
  const { replyTo, resetReplyId } = useReply();
  const [showAll, setShowAll] = useState(false);

  const contentAsText = replyTo?.content.message
    ? replyTo?.content.message
    : replyTo?.content.assets
    ? "Attachement"
    : replyTo?.content.audio
    ? "Voice message"
    : replyTo?.content.gif
    ? "GIF"
    : "Message";

  return (
    <div className="flex items-center justify-between h-auto w-full bg-secondary-foreground/5 p-2 rounded-md text-sm space-x-4">
      <div className="space-y-1">
        <h1>
          Replying to{" "}
          {replyTo?.senderId == user?.id ? " yourself" : replyTo?.username}
        </h1>
        <div
          className="cursor-default"
          onClick={() => setShowAll((state) => !state)}
        >
          {showAll ? (
            <p className="text-muted-foreground text-xs">{contentAsText}</p>
          ) : (
            <p className="text-muted-foreground text-xs line-clamp-2">
              {contentAsText}
            </p>
          )}
        </div>
      </div>
      <span className="cursor-pointer" onClick={resetReplyId}>
        <X size={14} />
      </span>
    </div>
  );
}
