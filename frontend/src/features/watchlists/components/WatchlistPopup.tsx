import type { Watchlist } from "../../../types/watchlist";

import "./WatchlistPopup.css";

type WatchlistPopuplProps = {
  isOpen: boolean;
  watchlists: Watchlist[];
  movieTmdbId?: number;
  onClose: () => void;
  onAddToWatchlist: (watchlistId: string, tmdbId: number) => void;
  onCreateWatchlist: () => void;
};

export default function WatchlistPopup({
    isOpen,
    watchlists,
    movieTmdbId,
    onClose,
    onAddToWatchlist,
    onCreateWatchlist,
}: WatchlistPopuplProps) {

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="modal-title">ADD TO WATCHLIST</h3>

                <div className="movies-scroll-wrapper">
                    <div className="movies-scroll">
                        {watchlists.map((watchlist) => (
                            <div
                                key={watchlist.id}
                                className="movie-card"
                                onClick={() => {
                                onAddToWatchlist(watchlist.id, movieTmdbId!);
                                onClose();
                                }}>
                                <div className="poster-wrapper">
                                    {watchlist.items?.[0]?.movie?.posterPath ? 
                                    (<img
                                        src={watchlist.items[0].movie.posterPath}
                                        alt={watchlist.name}/>) : 
                                    (<div className="placeholder">No Image</div>)}
                                </div>

                                <p>{watchlist.name}</p>
                            </div>
                        ))}

                        {/* ➕ Add Watchlist */}
                        <div
                            className="movie-card add-watchlist-card"
                            onClick={onCreateWatchlist}>
                            <div className="add-poster">
                                <div className="add-icon">+</div>
                            </div>
                            <p className="movie-title">Add Watchlist</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}