import type { Watchlist } from "../../../types/watchlist";

import "../../../styles/ui/scrollRow.css";
import "../../../styles/ui//movieCard.css";
import "../../../styles/ui/addWatchlistCard.css";

type WatchlistRowProps = {
    watchlists: Watchlist[];
    onWatchlistClick: (id: string) => void;
    onAddWatchlist: () => void;
};

export default function WatchlistRow({
    watchlists,
    onWatchlistClick,
    onAddWatchlist}: WatchlistRowProps){

    return(
        <section className="watchlist-row">
            <h2>Watchlists</h2>

            {/* Watchlist scroll view */}

            <div className="movies-scroll-wrapper">
                <div className="movies-scroll">
                    {watchlists.map((watchlist) => (
                        <div
                            key={watchlist.id}
                            className="movie-card"
                            onClick={() => onWatchlistClick(watchlist.id)}>
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

                    {/* ➕ Add Watchlist Card */}
                    <div
                        className="movie-card add-watchlist-card"
                        onClick={() => onAddWatchlist()}>
                        <div className="add-poster">
                            <div className="add-icon">+</div>
                        </div>
                        <p className="movie-title">Add Watchlist</p>  
                    </div>
                </div>
            </div>
        </section>
    );
}