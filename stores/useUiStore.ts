import { create } from 'zustand';

interface UiState {
    isPlusMenuOpen: boolean;
    setPlusMenuOpen: (isOpen: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
    isPlusMenuOpen: false,
    setPlusMenuOpen: (isOpen) => set({ isPlusMenuOpen: isOpen }),
}));
