import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ReplyToInfo } from "@/typing";
import { useState } from "react";
import Image from "next/image";

type Tprops = {
  className: string;
  message: ReplyToInfo;
};

const inter = Inter({ subsets: ["latin"] });

export default function MessageReply({ className, message }: Tprops) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div
      className={cn(
        "!bg-muted-foreground/5 top-2 cursor-default opacity-45 hover:opacity-60",
        className
      )}
      onClick={() => setShowAll((state) => !state)}
    >
      {!!message.content.assets && (
        <Image
          src={message.content.assets.secure_url}
          alt={message.content.assets.original_filename ?? ""}
          width={message.content.assets.width}
          height={message.content.assets.height}
        />
      )}

      {!!message.content.gif && !!message.content.gif.url && (
        <Image
          src={message.content.gif.url}
          alt={message.content.gif.description ?? ""}
          width={message.content.gif.width}
          height={message.content.gif.height}
        />
      )}

      {showAll ? (
        <p className={cn("!text-muted-foreground", inter.className)}>
          {message.content.message}
        </p>
      ) : (
        <p
          className={cn("!text-muted-foreground line-clamp-3", inter.className)}
        >
          {message.content.message}
        </p>
      )}
    </div>
  );
}
