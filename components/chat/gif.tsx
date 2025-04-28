import { sendMessage } from "@/action/send-message.action";
import { TMessageDataToSend } from "@/typing";
import { useAuth, useUser } from "@clerk/nextjs";
import GifPicker, {
  Theme as GifPickerTheme,
  TenorImage,
} from "gif-picker-react";
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction } from "react";

type TProps = {
  setIsPending: Dispatch<SetStateAction<boolean>>;
  setIsGifOpen: Dispatch<SetStateAction<boolean>>;
};

const tenorApiKey = process.env.NEXT_PUBLIC_TENOR_KEY!;

export default function Gif({ setIsPending, setIsGifOpen }: TProps) {
  const { userId } = useAuth();
  const { user } = useUser();
  const { resolvedTheme } = useTheme();

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

  return (
    <GifPicker
      tenorApiKey={tenorApiKey}
      theme={pickerTheme}
      onGifClick={handleGifClick}
      autoFocusSearch={false}
    />
  );
}
