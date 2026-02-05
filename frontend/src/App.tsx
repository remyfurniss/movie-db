import './App.css'
import { useEffect, useState } from "react";
import {
  fetchMovies,
  fetchWatchlists,
  createWatchlist,
  addMovieToWatchlist,
} from "./api";
import './MovieSearch.tsx'
import MovieSearch from './MovieSearch.tsx';

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

function App() {

  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const activeWatchlistId = watchlists[0]?.id;


  /*
  useEffect(() => {
    fetchMovies()
      .then(setMovies)
      .catch((err) => setError(err.message));
    fetchWatchlists()
      .then(setWatchlists)
      .catch((err) => setError(err.message));
  }, []);

  async function handleCreateWatchlist() {
    if (!newName) return;
    const wl = await createWatchlist(newName);
    setWatchlists([...watchlists, wl]);
    setNewName("");
  }

  async function handleAddMovie(watchlistId: string, movieId: string) {
    await addMovieToWatchlist(watchlistId, movieId);
    alert("Movie added");
  }
    */

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
    <div style={{ padding: 24 }}>
      
      <MovieSearch onAddMovie={(movieId) => {
          if (!activeWatchlistId) return;
          handleAddMovie(activeWatchlistId, movieId);
        }}
      />

      <h1>Watchlists</h1>

      <input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="New watchlist name"
      />
      <button onClick={() => handleCreateWatchlist(newName)}>
        Create
      </button>

      <ul>
        {watchlists.map((wl) => (
  <li key={wl.id}>
    <strong>{wl.name}</strong>

    <ul>
      {wl.items.length === 0 && <li>No movies yet</li>}

      {wl.items.map((item) => (
        <li key={item.movie.id}>
          {item.movie.title}
        </li>
      ))}
    </ul>

    <select
      onChange={(e) =>
        handleAddMovie(wl.id, e.target.value)
      }
    >
      <option value="">Add movie…</option>
      {movies.map((movie) => (
        <option key={movie.id} value={movie.id}>
          {movie.title}
        </option>
      ))}
    </select>
  </li>
))}

      </ul>
    </div>
  );
}

export default App
