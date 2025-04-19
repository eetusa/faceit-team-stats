import { create } from 'zustand';

interface DatesState {
  matchesEarliestDate: Date | undefined;
  matchesLatestDate: Date | undefined;
  setMatchesEarliestDate: (input: Date | undefined) => void;
  setMatchesLatestDate: (input: Date | undefined) => void;
}

export const useDatesStateStore = create<DatesState>((set) => ({
    matchesEarliestDate: undefined,
    matchesLatestDate: undefined,
    setMatchesEarliestDate: (input) => {
        set({ matchesEarliestDate: input });
    },
    setMatchesLatestDate: (input) => {
        set({ matchesLatestDate: input });
    },
}));