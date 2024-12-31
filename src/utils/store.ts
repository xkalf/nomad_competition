import { RouterOutputs } from "./api";
import { create } from "zustand";

type Rounds = RouterOutputs["round"]["getByCompetitionId"];

interface RoundsState {
  rounds: Record<string, Rounds>;
  setRounds: (rounds: Record<string, Rounds>) => void;
}

export const useRoundsStore = create<RoundsState>((set) => ({
  rounds: {},
  setRounds: (rounds) => set({ rounds }),
}));
