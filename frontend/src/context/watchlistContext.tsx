import { createContext, useContext, useState, useEffect } from "react";
import { fetchWatchlists, createWatchlist as apiCreateWatchlist, addMovieToWatchlist as apiAddMovieToWatchlist } from "../api/api";
import type { Watchlist } from "../types/watchlist";
import { useAuth } from "./authContext";

type WatchlistContextType = {
  watchlists: Watchlist[];
  refreshWatchlists: () => Promise<void>;
  createWatchlist: (name: string) => Promise<void>;
  addMovieToWatchlist: (watchlistId: string, tmdbId: number) => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextType | null>(null);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);

  async function refreshWatchlists() {
    const data = await fetchWatchlists();
    setWatchlists(data);
  }

  const createWatchlist = async (name: string) => {
    const newWatchlist = await apiCreateWatchlist(name);
    setWatchlists(prev => [...prev, newWatchlist]);
    return newWatchlist;
  };

  const addMovieToWatchlist = async (watchlistId: string, tmdbId: number) => {
    await apiAddMovieToWatchlist(watchlistId, tmdbId);
    await refreshWatchlists();
  };

  useEffect(() => {
    if (user) {
      refreshWatchlists();
    } else {
      setWatchlists([]);
    }
  }, [user]);

  return (
    <WatchlistContext.Provider
      value={{
        watchlists,
        refreshWatchlists,
        createWatchlist,
        addMovieToWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlists() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error("useWatchlists must be used inside provider");
  return context;
}