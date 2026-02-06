import { useState } from "react";
import { searchMovies } from "./api";
import { Link } from "react-router-dom";

type Watchlist = {
  id: string;
  name: string;
};

type Movie = {
  id: string;
  title: string;
  posterPath?: string;
};

type MovieSearchProps = {
  watchlists: Watchlist[];
  onMovieClick: (id: string) => void;
};

export default function MovieSearch({

  watchlists,
  onMovieClick,

}: MovieSearchProps) {

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  async function searchMovies() {
    if (!query.trim()) return;

    setLoading(true);
    const res = await fetch(`http://localhost:4000/movies/search?q=${query}`);
    const data = await res.json();
    console.log("API response:", data);
    setMovies(data);
    setLoading(false);
  }

  return (
    <div>
      <h1>Search Movies</h1>

      <p>Watchlists: {watchlists.length}</p>

      {/* Search bar */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a movie..."
      />
      <button onClick={searchMovies}>Search</button>

      {loading && <p>Loading...</p>}

      {/* Movie results */}
      <ul>
        {movies.map((movie) => (
          <li
            key={movie.id}
            style={{ cursor: "pointer", marginBottom: "8px" }}
            onClick={() => onMovieClick(movie.id)}
          >
            {movie.title}
          </li>
        ))}
      </ul>
    </div>
  );
}