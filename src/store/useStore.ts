import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Channel } from '../types';

interface AppState {
  favorites: string[];
  recentChannels: Channel[];
  volume: number;
  muted: boolean;
  toggleFavorite: (channelId: string) => void;
  addToRecent: (channel: Channel) => void;
  setVolume: (vol: number) => void;
  setMuted: (muted: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      favorites: [],
      recentChannels: [],
      volume: 1,
      muted: false,
      toggleFavorite: (channelId) => set((state) => ({
        favorites: state.favorites.includes(channelId)
          ? state.favorites.filter(id => id !== channelId)
          : [...state.favorites, channelId]
      })),
      addToRecent: (channel) => set((state) => {
        const filtered = state.recentChannels.filter(c => c.id !== channel.id);
        return { recentChannels: [channel, ...filtered].slice(0, 10) };
      }),
      setVolume: (volume) => set({ volume }),
      setMuted: (muted) => set({ muted })
    }),
    {
      name: 'st-tv-storage',
    }
  )
);
