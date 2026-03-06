import type { Watchlist } from "../../../types/watchlist";

import "../../../styles/ui/popup.css"
import "../../../styles/ui/movieCard.css"
import "../../../styles/ui/scrollRow.css"
import "../../../styles/ui/addWatchlistCard.css"


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
        <div className="popup-overlay" onClick={onClose}>
            <div
                className="popup"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="popup-title">ADD TO WATCHLIST</h3>

                {/* Watchlist movie scroll */}

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
                                    {watchlist.movies?.[0]?.posterPath ? 
                                    (<img
                                        src={watchlist.movies[0].posterPath}
                                        alt={watchlist.name}/>) : 
                                    (<div className="placeholder">No Image</div>)}
                                </div>

                                <p>{watchlist.name}</p>
                            </div>
                        ))}

                        {/* Add Watchlist movie card */}
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