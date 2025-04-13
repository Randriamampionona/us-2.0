import { useImagePreview } from "@/store/use-image-preview.store";
import { Dispatch, SetStateAction } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Download from "yet-another-react-lightbox/plugins/download";

type TProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ImagePreview({ open, setOpen }: TProps) {
  const { imageData, reset } = useImagePreview();

  const onClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={[{ src: imageData?.secure_url! }]}
      plugins={[Download]}
    />
  );
}
