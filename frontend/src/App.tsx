import './App.css'
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchMovies,
  fetchWatchlists,
  createWatchlist,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  searchMovies,
  searchTmdbMovies
} from "./api";
//import './MovieSearch.tsx'
import Home from './Home.tsx'; // Put in pages foldeer
import MovieDetail from "./MovieDetail";
import TopBar from './TopBar.tsx'; // Put in component Folder
import type { Movie } from "./types/movie";
import WatchlistDetail from './WatchlistDetail.tsx';

type Watchlist = {
  id: string;
  name: string;
  items: {
    movie: {
      id: string;
      title: string;
    };
  }[];
};

function AppRoutes({
  watchlists,
  handleAddMovieToWatchlist,
  handleCreateWatchlist,
  refreshWatchlists
}: {
  watchlists: Watchlist[];
  handleAddMovieToWatchlist: (watchlistId: string, movieId: string) => void;
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

  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const activeWatchlistId = watchlists[0]?.id;
  const navigate = useNavigate();
 const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
const [isSearching, setIsSearching] = useState(false);
 
 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);


  /*
useEffect(() => {
  if (!searchValue.trim()) {
    setSearchResults([]);
    return;
  }

  const timeout = setTimeout(async () => {
    try {
      setIsSearching(true);
      const results = await searchMovies(searchValue);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  }, 300);
  

  return () => clearTimeout(timeout);
}, [searchValue]);*/


useEffect(() => {
  if (!searchValue.trim()) {
    setSearchResults([]);
    return;
  }

  const timeout = setTimeout(async () => {
    const data = await searchTmdbMovies(searchValue);
    setSearchResults(data);
  }, 300); // debounce

  return () => clearTimeout(timeout);
}, [searchValue]);

  async function fetchInitialData() {
    const [moviesData, watchlistsData] = await Promise.all([
      fetchMovies(),
      fetchWatchlists(),
    ]);

    setMovies(moviesData);
    setWatchlists(watchlistsData);
  }

  /*
  async function refreshWatchlists() {
    const data = await fetchWatchlists();
    setWatchlists(data);
  }
*/

  async function refreshWatchlists(): Promise<void> {
  const data = await fetchWatchlists();
  setWatchlists(data);
}


  async function handleCreateWatchlist(name: string): Promise<Watchlist> {
    const newWatchlist = await createWatchlist(name);
    setWatchlists(prev => [...prev, newWatchlist]);
    return newWatchlist;
  }


  async function handleAddMovieToWatchlist(watchlistId: string, tmdbID: string) {
    console.log("Adding movie", tmdbID, "to watchlist", watchlistId);
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
