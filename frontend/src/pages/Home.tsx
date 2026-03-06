import { useEffect, useState } from "react";
import { fetchPopularMovies, fetchRecommendedMovies, fetchRecentlyWatchedMovies } from "../lib/api";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/context/authContext";
import { useWatchlists } from "../features/watchlists/context/watchlistContext";


import type { Movie } from "../types/movie";

import AddWatchlistPopup from "../features/watchlists/components/AddWatchlistPopup";
import MovieRow from "../features/movies/components/MovieRow";
import WatchlistRow from "../features/watchlists/components/WatchlistRow";

import Login from "../features/auth/pages/Login"

import "./Home.css"

export default function Home() {
  
  const { watchlists, createWatchlist } = useWatchlists();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [recentlyWatchedMovies, setRecentlyWatchedMovies] = useState<Movie[]>([]);
  const [showAddWatchlistPopup, setShowAddWatchlistPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // on movie click
  const onMovieClick = (tmdbId: number) => {
    navigate(`/movies/tmdb/${tmdbId}`);
  };

  const onWatchlistClick = (watchlistId: string) => {
    navigate(`/watchlists/${watchlistId}`);
  };

  const onCreateWatchlist = async (name: string) => {
    try {
      await createWatchlist(name);
      setShowAddWatchlistPopup(false);
    } catch (err) {
      console.error("Failed to create watchlist:", err);
    }
  };

  useEffect(() => {
    // do nothing if not logged in
    if (!user) return; 

    async function loadMovies() {
      try {
        setLoading(true);
        const popData = await fetchPopularMovies();
        setPopularMovies(popData.slice(0, 20));

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
  }, [user]); 

  if (!user) return <Login />;

  if (loading) return <p>Loading data...</p>;

  return (
    <div className="home-container">

      {/* Popular Movies */}
      <MovieRow
        title={"Popular Movies"}
        movies={popularMovies}
        onMovieClick={onMovieClick}/>

      {/* Recommended Movies */}
      {recommendedMovies.length > 0 ? (
        <MovieRow
          title={"Recommended Movies"}
          movies={recommendedMovies}
          onMovieClick={onMovieClick}/>
        ) : (
        <section className="recently-watched-placeholder">
          <h2>Recommend</h2>
          <div className="placeholder-message">
            You haven't watched any movies yet 🎬
          </div>
        </section>
      )}

      {/* Watchlists */}
      <WatchlistRow
        watchlists={watchlists}
        onWatchlistClick={onWatchlistClick}
        onAddWatchlist={() => setShowAddWatchlistPopup(true)}/>

      {/* Recently Watched */}
      {recentlyWatchedMovies.length > 0 ? (
        <MovieRow
          title="Recently Watched"
          movies={recentlyWatchedMovies}
          onMovieClick={onMovieClick}/>
      ) : (
        <section className="recently-watched-placeholder">
          <h2>Recently Watched</h2>
          <div className="placeholder-message">
            You haven't watched any movies yet 🎬
          </div>
        </section>
      )}

      {/* Watchlist Popup */}
      <AddWatchlistPopup
        isOpen={showAddWatchlistPopup}
        onClose={() => setShowAddWatchlistPopup(false)}
        onCreateWatchlist={onCreateWatchlist}/>

    </div>
  );
}