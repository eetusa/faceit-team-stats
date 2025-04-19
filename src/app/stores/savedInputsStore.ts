import { create } from 'zustand';

interface SavedInputsState {
  savedInputs: string[];
  setSavedInputs: (inputs: string[]) => void;
  addInput: (input: string) => void;
}

export const useSavedInputsStore = create<SavedInputsState>((set) => ({
    savedInputs: [],
//   savedInputs: JSON.parse(localStorage.getItem('savedInputs') || '[]'),
    setSavedInputs: (inputs) => {
        set({ savedInputs: inputs });
        localStorage.setItem('savedInputs', JSON.stringify(inputs));
    },
    addInput: (input) =>
        set((state) => {
        if (!state.savedInputs.includes(input)) {
            const updatedInputs = [...state.savedInputs, input];
            localStorage.setItem('savedInputs', JSON.stringify(updatedInputs));
            return { savedInputs: updatedInputs };
        }
        return state;
        }),
}));