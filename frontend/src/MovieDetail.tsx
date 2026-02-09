import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovieById } from "./api";

type Watchlist = {
  id: string;
  name: string;
};

type Movie = {
    id: string;
    title: string;
    description?: string;
    releaseYear?: number;
    posterUrl?: string;
};

type Props = {
    watchlists: Watchlist[];
    onAddMovie: (watchlistId: string, movieId: string) => void;
    onCreateWatchlist: (name: string) => Promise<Watchlist>;
}

export default function MovieDetail({
    watchlists,
    onAddMovie,
    onCreateWatchlist
}: Props) {

  const { id } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [selected, setSelected] = useState("");
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [showCreateWatchlist, setShowCreateWatchlist] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchMovieById(id).then(setMovie);
  }, [id]);

  if (!movie) return <p>Loading…</p>;

  return (
    <div>

        {/* Movie Title and year and runtime*/}
        <div>
            <h1>{movie.title}</h1>
            <p>
                {movie.releaseDate && new Date(movie.releaseDate).getFullYear()}
                {movie.runtime && ` • ${movie.runtime} min`}
            </p>
        </div>
    
        {/* Movie Backdrop */}
        {movie.backdropPath && (
            <div className="movie-hero" style={{
                backgroundImage: `url(${movie.backdropPath})`}}/>
        )}


        <div className="movie-detail-content">
            {movie.posterPath && (
                <div className="movie-detail-poster">
                    <img src={movie.posterPath} alt={movie.title} />
                </div>
            )}

            <div className="movie-detail-info">
                <h2>Overview</h2>
                <p>{movie.overview || "No description available."}</p>
            </div>
        </div>

        {/* MAKE BETTER AND CHANGE CLASS NAME*/}
        <div className="movie-detail-content">
            <p>{`${movie.voteAverage} / 10`}</p>
            <p>{movie.popularity}</p>
        </div>


        {/* watch list button*/}
        <div>
            <button className="watchlist-btn" onClick={() => setShowWatchlistModal(true)}>
                + Add to Watchlist
            </button>
        </div>

        {/* Show watchlist popup*/}
        {showWatchlistModal && (
            <div className="modal-overlay" onClick={() => setShowWatchlistModal(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                    <h3>Add to watchlist</h3>
                    <ul>
                        {watchlists.map(wl => (
                            <li key={wl.id}>
                                <button onClick={() => {
                                    onAddMovie(wl.id, movie!.id);
                                    setShowWatchlistModal(false);}}>
                                {wl.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <hr style={{ width: "100%" }} />
                    <button onClick={() => setShowCreateWatchlist(true)} style={{ marginTop: 12 }}>
                    + Create new watchlist
                    </button>    
                </div>
            </div>
        )}
        
        {/* Show create watchlist popup*/}
        {showCreateWatchlist && (
            <div 
                className="modal-overlay"
                onClick={() => setShowCreateWatchlist(false)}>
                <div 
                    className="modal" 
                    onClick={e => e.stopPropagation()}>
                    <h3>Create watchlist</h3>
                    <input
                        type="text"
                        placeholder="Watchlist name"
                        value={newWatchlistName}
                        onChange={e => setNewWatchlistName(e.target.value)}
                        style={{ width: "100%" }}/>
                    <div 
                        style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button 
                            onClick={() => setShowCreateWatchlist(false)}>
                        Cancel
                        </button>
                        <button
  disabled={!newWatchlistName.trim()}
  onClick={async () => {
    console.log("CREATE CLICKED", newWatchlistName);

    const created = await onCreateWatchlist(newWatchlistName);

    console.log("CREATED WATCHLIST", created);

    setNewWatchlistName("");
    setShowCreateWatchlist(false);

    onAddMovie(created.id, movie!.id);
  }}
>
  Create
</button>
                    </div>
                </div>
            </div>)}
    </div>
  );
}
