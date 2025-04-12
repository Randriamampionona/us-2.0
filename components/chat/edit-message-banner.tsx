import { useEditMessage } from "@/store/use-edit-message.store";
import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type TProps = {
  setValue: Dispatch<SetStateAction<string>>;
};

export default function EditMessageBanner({ setValue }: TProps) {
  const { reset } = useEditMessage();

  return (
    <div className="flex items-center justify-between h-auto w-full bg-secondary-foreground/5 p-2 rounded-md text-sm">
      <p>Edit message</p>
      <span
        className="cursor-pointer"
        onClick={() => {
          reset();
          setValue("");
        }}
      >
        <X size={14} />
      </span>
    </div>
  );
}
