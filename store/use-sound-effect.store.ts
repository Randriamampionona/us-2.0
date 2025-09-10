import { create } from "zustand";

type Store = {
  play: boolean;
  setPlay: (play: boolean) => void;
  source: string | null;
  isAllowed: boolean;
  setIsAllowed: (allowed: boolean) => void;
};

const SOUND_STORAGE_NAME =
  process.env.NODE_ENV === "development"
    ? "is_sound_effect_allowed--dev"
    : "is_sound_effect_allowed";

export const useSoundEffect = create<Store>()((set) => ({
  play: false,
  source: "/sounds/message-pop.wav",
  setPlay: (play: boolean) => set((state) => ({ ...state, play })),
  isAllowed: (() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SOUND_STORAGE_NAME);
      if (stored === null) return false; // default ??
      return stored === "true";
    }
    return false; // also false during SSR
  })(),
  setIsAllowed: (allowed: boolean) => {
    localStorage.setItem(SOUND_STORAGE_NAME, String(allowed));
    set({ isAllowed: allowed });
  },
}));
