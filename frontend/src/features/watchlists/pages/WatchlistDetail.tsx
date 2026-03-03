import { useParams, useNavigate } from "react-router-dom";
import { removeMovieFromWatchlist, deleteWatchlist } from "../../../lib/api";

import { useWatchlists } from "../context/watchlistContext";

import "./WatchlistDetail.css";
import "../../../styles/ui/scrollRow.css";

export default function WatchlistDetail() {
  
  const { id } = useParams<{ id: string }>();
  const { watchlists, refreshWatchlists } = useWatchlists();

  //Get watchlist
  const watchlist = watchlists.find(wl => wl.id === id) || null;

  if (!watchlist) return <p>Watchlist not found</p>;

  const navigateToMovie = (tmdbId: number | string) => navigate(`/movies/tmdb/${tmdbId}`);
  const navigate = useNavigate();

  //Remove movie
  const handleRemoveMovie = async (movieId: string) => {
    await removeMovieFromWatchlist(watchlist.id, movieId);
    await refreshWatchlists();
  };

  //Delete movie
  async function handleDeleteWatchlist() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this watchlist? This cannot be undone."
    );

    if (!confirmed) return;

    await deleteWatchlist(id!);
    await refreshWatchlists();

    navigate("/"); 
  }

  return (
    <div className="watchlist-panel">
      <h2 className="watchlist-title">{watchlist.name}</h2>
      <div className="watchlist-scroll-wrapper">
        <div className="watchlist-scroll">
          {watchlist.movies?.map((movie) => (
            <div
              key={movie.id}
              className="watchlist-item-row"
              onClick={() => {
                if (!movie.tmdbId) return;
                navigateToMovie(movie.tmdbId);}}>
              <div className="watchlist-left">
                {/* Movie poster */}
                {movie.posterPath ? 
                (<img
                    src={movie.posterPath}
                    alt={movie.title}/>) : 
                (<div className="poster-placeholder">No Image</div>)}
                {/* Movie title */}
                <span className="movie-title">
                  {movie.title}
                </span>
              </div>
              {/* Remove movie button */}
              <button
                className="movie-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveMovie(movie.id);}}>
                x
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Delete watchlist button */}
      <button
        className="delete-watchlist-btn"
        onClick={handleDeleteWatchlist}>
        Delete Watchlist
      </button>
    </div>);
}