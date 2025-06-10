import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type themeType = "light" | "dark";

interface MainState {
	theme: themeType;
	changeTheme: () => themeType;
}

export const useMainStore = create<MainState>()(
	persist(
		(set, get) => ({
			theme: "dark",
			changeTheme: () => {
				set({ theme: get().theme === "dark" ? "light" : "dark" });
				return get().theme;
			},
		}),
		{
			name: "main-storage",
			storage: createJSONStorage(() => sessionStorage),
		}
	)
);
