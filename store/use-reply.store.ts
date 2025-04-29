import { ReplyToInfo } from "@/typing";
import { create } from "zustand";

type Store = {
  replyTo: ReplyToInfo | null;
  setReplyId: (replyInfo: ReplyToInfo) => void;
  resetReplyId: () => void;
};

export const useReply = create<Store>()((set, get) => ({
  replyTo: null,
  setReplyId: ({ id, content, username, senderId }: ReplyToInfo) => {
    const replyToId = get().replyTo?.id;

    replyToId != id &&
      set((state) => ({
        ...state,
        replyTo: {
          ...state.replyTo,
          id,
          content,
          username,
          senderId,
        },
      }));
  },
  resetReplyId: () => set((state) => ({ ...state, replyTo: null })),
}));
