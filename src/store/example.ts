import { create } from "zustand";

interface BearState {
	bears: number;
	increasePopulation: () => void;
	decreasePopulation: () => void;
}

export const useBearsStore = create<BearState>()((set, get) => ({
	bears: 0,
	increasePopulation: () => {
		set({ bears: get().bears + 1 });
	},
	decreasePopulation: () => {
		set({ bears: get().bears - 1 });
	},
}));
