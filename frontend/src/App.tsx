import './App.css'
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  fetchWatchlists,
  createWatchlist,
  addMovieToWatchlist,
  searchTmdbMovies
} from "./api";

import Home from './Home'; 
import MovieDetail from "./MovieDetail";
import TopBar from './TopBar'; 
import WatchlistDetail from './WatchlistDetail';

import type { Movie } from "./types/movie";
import type { Watchlist } from "./types/watchlist";

function AppRoutes({
  watchlists,
  handleAddMovieToWatchlist,
  handleCreateWatchlist,
  refreshWatchlists
}: {
  watchlists: Watchlist[];
  handleAddMovieToWatchlist: (watchlistId: string, tmdbId: number) => void;
  handleCreateWatchlist: (name: string) => Promise<Watchlist>;
  refreshWatchlists: () => Promise<void>
}) {

  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            watchlists={watchlists}
            onMovieClick={(tmdbId: number) => navigate(`/movies/tmdb/${tmdbId}`)}
            onWatchlistClick={(id: string) => navigate(`/watchlists/${id}`)}
            onCreateWatchlist={handleCreateWatchlist}
          />
        }
      />
      <Route
        path="/movies/:id"
        element={
          <MovieDetail
            watchlists={watchlists}
            onAddMovieToWatchlist={handleAddMovieToWatchlist}
            onCreateWatchlist={handleCreateWatchlist}
          />
        }
      />
      <Route
        path="/movies/tmdb/:tmdbId"
        element={
          <MovieDetail
            watchlists={watchlists}
            onAddMovieToWatchlist={handleAddMovieToWatchlist}
            onCreateWatchlist={handleCreateWatchlist}
          />
        }
      />
      <Route
        path="/watchlists/:id"
        element={
          <WatchlistDetail 
            watchlists={watchlists}
            refreshWatchlists={refreshWatchlists}/>
        }
      />
    </Routes>
  );
}

function App() {

  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  //Fetch initial Data
  useEffect(() => {
    fetchInitialData();
  }, []);

  //Set search results
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const data = await searchTmdbMovies(searchValue);
      setSearchResults(data);
    }, 300);

    return () => clearTimeout(timeout);
    }, [searchValue]);

  //Fetch initial Data
  async function fetchInitialData() {
    try {
      const watchlistsData = await fetchWatchlists();
      setWatchlists(watchlistsData);
    } catch (err) {
      console.error("Failed to fetch watchlists:", err);
    }
  }

  //Refresh watchlists
  async function refreshWatchlists(): Promise<void> {
    const data = await fetchWatchlists();
    setWatchlists(data);
  }

  //Create watchlists
  async function handleCreateWatchlist(name: string): Promise<Watchlist> {
    const newWatchlist = await createWatchlist(name);
    setWatchlists(prev => [...prev, newWatchlist]);
    return newWatchlist;
  }

  //Add movie to watchlist
  async function handleAddMovieToWatchlist(watchlistId: string, tmdbID: number) {
    await addMovieToWatchlist(watchlistId, tmdbID);
    await refreshWatchlists();
  }

  return (
    <div className='app'>
      <TopBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          results={searchResults}
          onSelectMovie={() => setSearchValue("")}
        />
      <AppRoutes
        watchlists={watchlists}
        handleAddMovieToWatchlist={handleAddMovieToWatchlist}
        handleCreateWatchlist={handleCreateWatchlist}
        refreshWatchlists={refreshWatchlists}
      />
    </div>
  );
}

export default App
