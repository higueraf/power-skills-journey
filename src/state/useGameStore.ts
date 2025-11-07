import { create } from "zustand";

type SceneKey =
  | "welcome"
  | "context"
  | "team"
  | "challenge"
  | "in-action"
  | "results"
  | "reflection"
  | "credits";

interface GameState {
  scene: SceneKey;
  setScene: (s: SceneKey) => void;
  flags: Record<string, boolean>;
  setFlag: (k: string, v: boolean) => void;

  playerName: string;
  setPlayerName: (n: string) => void;

  chosenSkill?: string | null;
  setChosenSkill: (s: string | null) => void;

  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  scene: "welcome",
  setScene: (s) => set({ scene: s }),

  flags: {},
  setFlag: (k, v) => set((st) => ({ flags: { ...st.flags, [k]: v } })),

  playerName: "",
  setPlayerName: (n) => set({ playerName: n }),

  chosenSkill: null,
  setChosenSkill: (s) => set({ chosenSkill: s }),

  reset: () =>
    set({
      scene: "welcome",
      flags: {},
      playerName: "",
      chosenSkill: null,
    }),
}));
