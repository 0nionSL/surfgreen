import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteState {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id: number) => {
        const { favorites } = get();
        const index = favorites.indexOf(id);
        if (index === -1) {
          set({ favorites: [...favorites, id] });
        } else {
          set({ favorites: favorites.filter((f) => f !== id) });
        }
      },
      isFavorite: (id: number) => {
        return get().favorites.includes(id);
      },
      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'surfgreen-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);