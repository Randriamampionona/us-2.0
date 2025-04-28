import { sendMessage } from "@/action/send-message.action";
import { TMessageDataToSend } from "@/typing";
import { useAuth, useUser } from "@clerk/nextjs";
import GifPicker, {
  Theme as GifPickerTheme,
  TenorImage,
} from "gif-picker-react";
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";

type TProps = {
  setIsPending: Dispatch<SetStateAction<boolean>>;
  setIsGifOpen: Dispatch<SetStateAction<boolean>>;
};

const tenorApiKey = process.env.NEXT_PUBLIC_TENOR_KEY!;

export default function Gif({ setIsPending, setIsGifOpen }: TProps) {
  const { userId } = useAuth();
  const { user } = useUser();
  const { resolvedTheme } = useTheme();
  const pickerRef = useRef<HTMLDivElement>(null);

  // Map next-themes' string to GifPickerTheme enum
  const pickerTheme =
    resolvedTheme === "dark" ? GifPickerTheme.DARK : GifPickerTheme.LIGHT;

  // send gif directly
  const handleGifClick = async (gif: TenorImage) => {
    setIsPending(true);

    try {
      const data: TMessageDataToSend = {
        sender_id: userId!,
        username: user?.firstName!,
        message: "",
        reaction: null,
        is_seen: false,
        is_deleted: false,
        gif,
      };

      await sendMessage(data);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsGifOpen(false);
      setIsPending(false);
    }
  };

  // prevent autoFocusSearch
  useEffect(() => {
    if (!pickerRef.current) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const input = pickerRef.current?.querySelector("input");
          if (input) {
            input.setAttribute("readonly", "true"); // Prevent focus pop
            input.blur();
            setTimeout(() => {
              input.removeAttribute("readonly"); // Re-enable typing
            }, 50);

            observer.disconnect(); // 💥 STOP observing after first fix
            break;
          }
        }
      }
    });

    observer.observe(pickerRef.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={pickerRef}>
      <GifPicker
        tenorApiKey={tenorApiKey}
        theme={pickerTheme}
        onGifClick={handleGifClick}
        autoFocusSearch={false}
      />
    </div>
  );
}
