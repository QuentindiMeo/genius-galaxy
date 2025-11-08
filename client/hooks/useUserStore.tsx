import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = any; // ! TODO: Define a proper User type

type UserState = {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "user-storage" } // persisted in localStorage
  )
);
