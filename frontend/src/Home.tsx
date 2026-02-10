import { useEffect, useState } from "react";
import { fetchPopularMovies } from "./api";
import { Link } from "react-router-dom";
import type { Movie } from "./types/movie";



type Watchlist = {
  id: string;
  name: string;
};


type HomeProps = {
  watchlists: Watchlist[];
  onMovieClick: (id: string) => void;
};

export default function Home({onMovieClick}: HomeProps) {

  const [query, setQuery] = useState("");
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        const data = await fetchPopularMovies(); // fetch from api.ts
        setPopularMovies(data.slice(0, 20)); // take top 20
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, []);

 

if (loading) return <p>Loading popular movies...</p>;

  return (
    <div className="home-container">
      <h2>Popular Movies</h2>
      <div className="movies-scroll-wrapper">
      <div className="movies-scroll">
        {popularMovies.map((movie) => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() => onMovieClick(movie.id)}
          >
            {movie.posterPath ? (
              <img src={movie.posterPath} alt={movie.title} />
            ) : (
              <div className="placeholder">No Image</div>
            )}
            <p>{movie.title}</p>
          </div>
        ))}
      </div>
      </div>
      <h2>Recomended Movies</h2>
      <h2>Watchlists</h2>
    </div>
  );
}