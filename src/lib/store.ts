import { create } from "zustand";

interface TimerState {
  mode: "timer" | "stopwatch" | "pomodoro";
  setMode: (mode: "timer" | "stopwatch" | "pomodoro") => void;
  // Add more state as needed
}

export const useTimerStore = create<TimerState>((set) => ({
  mode: "timer",
  setMode: (mode) => set({ mode }),
}));
