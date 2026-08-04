import { create } from 'zustand';

/**
 * Client/UI state only (sidebar, theme, ephemeral flags). Server-state belongs
 * to TanStack Query — do NOT duplicate backend data here.
 */
interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
