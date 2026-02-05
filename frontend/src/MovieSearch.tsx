import { useState } from "react";
import { searchMovies } from "./api";

export default function MovieSearch({
  onAddMovie,
}: {
  onAddMovie: (movieId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);
    const movies = await searchMovies(query);
    setResults(movies);
    setLoading(false);
  }

  return (
    <div>
      <h2>Search Movies</h2>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title"
      />

      <button onClick={handleSearch}>Search</button>

      {loading && <p>Loading…</p>}

      <ul>
        {results.map((movie) => (
          <li key={movie.id}>
            {movie.title} ({movie.releaseYear ?? "?"})
            <button onClick={() => onAddMovie(movie.id)}>
              Add to watchlist
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
