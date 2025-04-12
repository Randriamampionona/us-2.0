import { UploadApiResponse } from "cloudinary";
import { create } from "zustand";

type Store = {
  imageData: UploadApiResponse | null;
  setImageData: (imageData: UploadApiResponse) => void;
  reset: () => void;
};

export const useImagePreview = create<Store>()((set) => ({
  imageData: null,

  setImageData: (imageData: UploadApiResponse) => {
    set((state) => ({
      ...state,
      imageData,
    }));
  },

  reset: () => {
    set((state) => ({
      ...state,
      imageData: null,
    }));
  },
}));
