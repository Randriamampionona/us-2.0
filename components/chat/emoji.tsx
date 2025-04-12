import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";

import { Dispatch, RefObject, SetStateAction } from "react";

type TProps = {
  setValue: Dispatch<SetStateAction<string>>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

type EmojiMartEmoji = {
  id: string;
  name: string;
  native: string; // 👈 this is the actual emoji character
  unified: string;
  shortcodes: string;
  keywords: string[];
  skin?: number;
  emoji?: string;
  custom?: boolean;
};

export default function Emoji({ setValue, textareaRef }: TProps) {
  const { theme } = useTheme();

  const appendEmoji = (emoji: EmojiMartEmoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Ensure the textarea is focused
      textarea.focus();

      // Get current cursor position and current text value
      const { selectionStart, selectionEnd, value } = textarea;

      if (selectionStart == null || selectionEnd == null) return;

      // Insert the emoji at the cursor position
      const newValue =
        value.slice(0, selectionStart) +
        emoji.native +
        value.slice(selectionEnd);

      // Set the new value to the textarea
      textarea.value = newValue;

      // Move the cursor to the position after the inserted emoji
      const newCursorPos = selectionStart + emoji.native.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;

      // Trigger a change event if you're using a controlled component
      textarea.dispatchEvent(new Event("input"));

      // Update the state (for controlled textarea)
      setValue(newValue);
    }
  };

  return (
    <Picker theme={theme ?? "light"} data={data} onEmojiSelect={appendEmoji} />
  );
}
