import { useParams, useNavigate } from "react-router-dom";
import type { Watchlist } from "../types/watchlist";
import { removeMovieFromWatchlist, deleteWatchlist } from "../api";

type WatchlistDetailProps = {
  watchlists: Watchlist[];
  refreshWatchlists: () => Promise<void>;
}

export default function WatchlistDetail({ watchlists, refreshWatchlists }: WatchlistDetailProps) {
  
  const { id } = useParams<{ id: string }>();

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
          {watchlist.items?.map((item) => (
            <div
              key={item.movie.id}
              className="watchlist-item-row"
              onClick={() => {
                if (!item.movie.tmdbId) return;
                navigateToMovie(item.movie.tmdbId);}}>
              <div className="watchlist-left">
                {item.movie.posterPath ? 
                (<img
                    src={item.movie.posterPath}
                    alt={item.movie.title}/>) : 
                (<div className="poster-placeholder">No Image</div>)}
                <span className="movie-title">
                  {item.movie.title}
                </span>
              </div>
              {/* Remove movie button */}
              <button
                className="movie-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveMovie(item.movie.id);}}>
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