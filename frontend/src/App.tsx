import './App.css'
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchMovies,
  fetchWatchlists,
  createWatchlist,
  addMovieToWatchlist,
} from "./api";
import './MovieSearch.tsx'
import MovieSearch from './MovieSearch';
import MovieDetail from "./MovieDetail";

type Movie = {
  id: string;
  title: string;
  releaseYear?: number;
};

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
  handleAddMovie,
}: {
  watchlists: Watchlist[];
  handleAddMovie: (watchlistId: string, movieId: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <MovieSearch
            watchlists={watchlists}
            onMovieClick={(id: string) => navigate(`/movies/${id}`)}
          />
        }
      />
      <Route
        path="/movies/:id"
        element={
          <MovieDetail
            watchlists={watchlists}
            onAddMovie={handleAddMovie}
          />
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

useEffect(() => {
  fetchInitialData();
}, []);

async function fetchInitialData() {
  const [moviesData, watchlistsData] = await Promise.all([
    fetchMovies(),
    fetchWatchlists(),
  ]);

  setMovies(moviesData);
  setWatchlists(watchlistsData);
}

async function refreshWatchlists() {
  const data = await fetchWatchlists();
  setWatchlists(data);
}

async function handleCreateWatchlist(name: string) {
  await createWatchlist(name);
  await refreshWatchlists();
}

async function handleAddMovie(watchlistId: string, movieId: string) {
  await addMovieToWatchlist(watchlistId, movieId);
  await refreshWatchlists();
}

return (
      <AppRoutes
        watchlists={watchlists}
        handleAddMovie={handleAddMovie}
      />
  );
}

export default App
