import { useEffect, useState } from "react";
import { fetchPopularMovies, fetchRecommendedMovies, fetchRecentlyWatchedMovies } from "../api";

import type { Movie } from "../types/movie";
import type { Watchlist } from "../types/watchlist";

import AddWatchlistPopup from "../components/AddWatchlistPopup";
import MovieRow from "../components/MovieRow";
import WatchlistRow from "../components/WatchlistRow";

type HomeProps = {
  watchlists: Watchlist[];
  onMovieClick: (id: number) => void;
  onWatchlistClick: (id: string) => void;
  onCreateWatchlist: (name: string) => Promise<Watchlist>;
};

export default function Home({watchlists, onMovieClick, onWatchlistClick, onCreateWatchlist}: HomeProps) {

  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [recentlyWatchedMovies, setRecentlyWatchedMovies] = useState<Movie[]>([]);
  const [showAddWatchlistPopup, setShowAddWatchlistPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);

        //fetch most popular movies
        const popData = await fetchPopularMovies(); 
        setPopularMovies(popData.slice(0, 20)); // take top 20

        //fetch receommneded movies
        const recData = await fetchRecommendedMovies();     
        setRecommendedMovies(recData); 

        //fetch recently watched movies
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

  if (loading) return <p>Loading data...</p>;

  return (
    <div className="home-container">

      {/* Popular Movies */}
      <MovieRow
        title={"Popular Movies"}
        movies={popularMovies}
        onMovieClick={onMovieClick}/>

      {/* Recommended Movies */}
      <MovieRow
        title={"Recommended Movies"}
        movies={recommendedMovies}
        onMovieClick={onMovieClick}/>

      {/* Watchlists */}
      <WatchlistRow
        watchlists={watchlists}
        onWatchlistClick={onWatchlistClick}
        onAddWatchlist={() => setShowAddWatchlistPopup(true)}/>

      {/* Recently Watched */}
      <MovieRow
        title={"Recently Watched"}
        movies={recentlyWatchedMovies}
        onMovieClick={onMovieClick}/>

      {/* Watchlist Popup */}
      <AddWatchlistPopup
        isOpen={showAddWatchlistPopup}
        onClose={() => setShowAddWatchlistPopup(false)}
        onCreateWatchlist={onCreateWatchlist}/>

    </div>
  );
}