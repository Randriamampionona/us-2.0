import { UploadApiResponse } from "cloudinary";
import { create } from "zustand";

type Store = {
  lastMessage: string | null;
  setLastMessage: (message: string | null) => void;
};

export const useMessageEffect = create<Store>()((set) => ({
  lastMessage: null,

  setLastMessage: (lastMessage: string | null) => {
    set((state) => ({
      ...state,
      lastMessage,
    }));
  },
}));
