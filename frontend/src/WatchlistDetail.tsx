import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Watchlist } from "./types/watchlist"; // define type separately
import { fetchWatchlists, removeMovieFromWatchlist } from "./api";


type WatchlistItem = {
  movie: {
    id: string;
    title: string;
    posterPath?: string;
  };
};

type WatchlistDetailProps = {
  watchlists: Watchlist[];
  refreshWatchlists: () => Promise<void>;
}

export default function WatchlistDetail({ watchlists, refreshWatchlists }: WatchlistDetailProps) {
  const { id } = useParams<{ id: string }>();
  //const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [loading, setLoading] = useState(true);

  

  const watchlist = watchlists.find(wl => wl.id === id) || null;


  //if (loading) return <p>Loading watchlist...</p>;
  if (!watchlist) return <p>Watchlist not found</p>;

  const handleRemoveMovie = async (movieId: string) => {
  await removeMovieFromWatchlist(watchlist.id, movieId);
  await refreshWatchlists();
};

  return (
  <div className="watchlist-panel">
  <h2 className="watchlist-title">{watchlist.name}</h2>

  <div className="watchlist-scroll-wrapper">
    <div className="watchlist-scroll">
      {watchlist.items.map((item) => (
        <div
          key={item.movie.id}
          className="watchlist-row">
          <div className="watchlist-left">
            {item.movie.posterPath ? (
              <img
                src={item.movie.posterPath}
                alt={item.movie.title}
              />
            ) : (
              <div className="poster-placeholder">No Image</div>
            )}

            <span className="movie-title">
              {item.movie.title}
            </span>
          </div>
          
          <button
            className="movie-remove"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveMovie(item.movie.id);
            }}>
            x
          </button>

          
        </div>
      ))}
    </div>
  </div>
</div>
);
}