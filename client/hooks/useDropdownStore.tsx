"use client";

import { create } from "zustand";

import { v7 as uuidv7 } from "uuid";

type DropdownState = {
  id: string;
  isOpen: boolean;
  toggle: () => void;
};

const useDropdownStore = create<DropdownState>((set) => ({
  id: uuidv7(),
  isOpen: false,
  toggle: () => set((state: DropdownState) => ({ isOpen: !state.isOpen })),
}));
export default useDropdownStore;
