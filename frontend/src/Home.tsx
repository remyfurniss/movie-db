import { useEffect, useState } from "react";
import { fetchPopularMovies, fetchRecommendedMovies, fetchRecentlyWatchedMovies } from "./api";
import { Link } from "react-router-dom";
import type { Movie } from "./types/movie";
import AddWatchlistPopup from "./components/AddWatchlistPopup";




type Watchlist = {
  id: string;
  name: string;
  items: {
    movie: Movie;
  }[];
};


type HomeProps = {
  watchlists: Watchlist[];
  onMovieClick: (id: string) => void;
  onWatchlistClick: (id: string) => void;
  onCreateWatchlist: (name: string) => Promise<Watchlist>;
};

export default function Home({watchlists, onMovieClick, onWatchlistClick, onCreateWatchlist}: HomeProps) {

  //const [query, setQuery] = useState("");
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [recentlyWatchedMovies, setRecentlyWatchedMovies] = useState<Movie[]>([]);
      const [showAddWatchlistPopup, setShowAddWatchlistPopup] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);

        const popData = await fetchPopularMovies(); // fetch from api.ts
        setPopularMovies(popData.slice(0, 20)); // take top 20

        const recData = await fetchRecommendedMovies();     
        setRecommendedMovies(recData); 

        const hisData = await fetchRecentlyWatchedMovies();     
        setRecentlyWatchedMovies(hisData); 

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

      {/* Popular Movies*/}

      <h2>Popular Movies</h2>
      <div className="movies-scroll-wrapper">
        <div className="movies-scroll">
          {popularMovies.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => {
                if (!movie.tmdbId) return;
                onMovieClick(movie.tmdbId);}}>
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

      {/* Popular Movies*/}

      <h2>Recomended Movies</h2>
      <div className="movies-scroll-wrapper">
        <div className="movies-scroll">
          {recommendedMovies.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => {
                if (!movie.tmdbId) return;
                onMovieClick(movie.tmdbId);}}>
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

      {/* Watchlists*/}

      <h2>Watchlists</h2>
      <div className="movies-scroll-wrapper">
        <div className="movies-scroll">
          {watchlists.map((watchlist) => (
            <div
              key={watchlist.id}
              className="movie-card"
              onClick={() => onWatchlistClick(watchlist.id)}
            >
              <div className="poster-wrapper">
                {watchlist.items?.[0]?.movie?.posterPath ? (
                  <img
                    src={watchlist.items[0].movie.posterPath}
                    alt={watchlist.name}
                  />
                ) : (
                  <div className="placeholder">No Image</div>
                )}
              </div>

              <p>{watchlist.name}</p>
            </div>
          ))}
          {/* ➕ Add Watchlist Card */}
          <div
                                    className="movie-card add-watchlist-card"
                                    onClick={() => {
                                        setShowAddWatchlistPopup(true);}}>

                                    <div className="add-poster">

                                        <div className="add-icon">+</div>

                                    </div>

                                    <p className="movie-title">Add Watchlist</p>
                                    
                                </div>
        </div>
      </div>

      {/* Recently Watched */}
      <h2>Recently Watched</h2>
      <div className="movies-scroll-wrapper">
        <div className="movies-scroll">
          {recentlyWatchedMovies.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => {
                if (!movie.tmdbId) return;
                onMovieClick(movie.tmdbId);}}>
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


      <AddWatchlistPopup
        isOpen={showAddWatchlistPopup}
        onClose={() => setShowAddWatchlistPopup(false)}
        onCreateWatchlist={onCreateWatchlist}
      />

    </div>
  );
}