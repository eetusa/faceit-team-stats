import { create } from 'zustand';

interface DatesState {
  matchesEarliestDate: Date | undefined;
  matchesLatestDate: Date | undefined;
  matchDates: Date[] | undefined;
  setMatchesEarliestDate: (input: Date | undefined) => void;
  setMatchesLatestDate: (input: Date | undefined) => void;
  setMatchDates: (input: Date[] | undefined) => void;
}

export const useDatesStateStore = create<DatesState>((set) => ({
    matchesEarliestDate: undefined,
    matchesLatestDate: undefined,
    matchDates: undefined,
    setMatchesEarliestDate: (input) => {
        set({ matchesEarliestDate: input });
    },
    setMatchesLatestDate: (input) => {
        set({ matchesLatestDate: input });
    },
    setMatchDates: (input) => {
        set({ matchDates: input })
    }
}));