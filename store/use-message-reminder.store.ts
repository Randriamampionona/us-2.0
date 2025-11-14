import { create } from "zustand";

type Store = {
  interval: number | null;
  setIntervalReminder: (value: number | null) => void;
};

const REMINDER_INTERVAL_KEY =
  process.env.NODE_ENV === "development"
    ? "reminder_interval--dev"
    : "reminder_interval";

export const useMessageReminder = create<Store>()((set) => ({
  interval: (() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(REMINDER_INTERVAL_KEY);
      return stored ? Number(stored) : null;
    }
    return null;
  })(),

  setIntervalReminder: (value: number | null) => {
    if (value === null) {
      localStorage.removeItem(REMINDER_INTERVAL_KEY);
    } else {
      localStorage.setItem(REMINDER_INTERVAL_KEY, String(value));
    }
    set({ interval: value });
  },
}));
