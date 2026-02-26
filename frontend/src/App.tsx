import './App.css'
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  fetchWatchlists,
  createWatchlist,
  addMovieToWatchlist,
  searchTmdbMovies
} from "./api/api";

import { useAuth, AuthProvider } from "./context/authContext";
import { WatchlistProvider } from "./context/watchlistContext";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./layouts/ProtectedLayout";
import PublicLayout from "./layouts/PublicLayout";

import Home from './pages/Home'; 
import MovieDetail from "./pages/MovieDetail";
import TopBar from './components/TopBar'; 
import WatchlistDetail from './pages/WatchlistDetail';
import Login from "./pages/Login";
import Register from "./pages/Register";



import type { Movie } from "./types/movie";
import type { Watchlist } from "./types/watchlist";



function AppRoutes() {

  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Routes>
      {/* public */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* protected */}
      <Route
  element={
    <ProtectedRoute>
      <WatchlistProvider>
        <ProtectedLayout />
      </WatchlistProvider>
    </ProtectedRoute>
  }
>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/movies/tmdb/:tmdbId" element={<MovieDetail />} />
        <Route path="/watchlists/:id" element={<WatchlistDetail />} />
      </Route>
    </Routes>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {

  const { user } = useAuth();

  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  //Fetch initial Data
  useEffect(() => {
  if (user) {
    fetchInitialData();
  } else {
    setWatchlists([]); // clear when logged out
  }
}, [user]);

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
      {user && (  // only render TopBar if logged in
    <TopBar
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      results={searchResults}
      onSelectMovie={() => setSearchValue("")}
    />
  )}
      <AppRoutes/>
    </div>
  );
}

export default AppWrapper;
//export default App
