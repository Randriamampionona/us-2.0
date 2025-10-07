import { cn } from "@/lib/utils";
import { TMessage } from "@/typing";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, Undo2 } from "lucide-react";
import { undoUnsendMessage } from "@/action/undo-unsend-message.action";
import { useState } from "react";

type TProps = {
  isSender: boolean;
  message: TMessage;
};

export default function UnsentMessage({ isSender, message }: TProps) {
  const { userId } = useAuth();
  const [isundoing, setIsUndoing] = useState(false);
  const isOwnMessage = message.sender_id === userId;

  const handleUndo = async () => {
    try {
      setIsUndoing(true);
      await undoUnsendMessage(message.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 mb-14 border border-muted-foreground/50 text-muted-foreground/80 italic select-none cursor-default rounded-xl w-fit max-w-[calc(100%-3rem)] md:max-w-[calc(100%-7rem)] lg:max-w-[calc(100%-13rem)] backdrop-blur-sm bg-muted/10",
        isSender && "ml-auto"
      )}
    >
      <p>{isOwnMessage ? "You" : message.username} unsent a message</p>

      {isOwnMessage && (
        <>
          {/* subtle vertical divider */}
          <div className="h-4 w-px bg-muted-foreground/40" />

          <Button
            variant="ghost"
            size="sm"
            disabled={isundoing}
            className="text-xs italic opacity-70 hover:opacity-100 hover:text-foreground transition-all duration-200 gap-1 px-2 py-1 rounded-md border border-transparent hover:border-muted-foreground/40"
            onClick={handleUndo}
          >
            {isundoing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Undo2 className="h-3 w-3" />
            )}
            {isundoing ? "Restoring..." : "Undo"}
          </Button>
        </>
      )}
    </div>
  );
}
