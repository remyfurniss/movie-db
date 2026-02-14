import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovieById, fetchRating, submitRating, fetchMovieByTmdbId, toggleWatched } from "./api";
import TopBar from "./TopBar";

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
}: Props){

    const { id, tmdbId } = useParams();
    const [watched, setWatched] = useState(false);
    const [movie, setMovie] = useState<any>(null);
    const [selected, setSelected] = useState("");
    const [showWatchlistModal, setShowWatchlistModal] = useState(false);
    const [showCreateWatchlist, setShowCreateWatchlist] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState("");
    const [rating, setRating] = useState<number | null>(null);
    const [hovered, setHovered] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        fetchRating(id).then(data => setRating(data.score));
    }, [id]);

    async function handleRating(score: number) {
        const updated = await submitRating(id!, score);
        setRating(updated.score);
    }

    async function handleToggleWatched() {
        console.log("WATCH TOGGLE ID:", movie.id);
        const updated = await toggleWatched(movie.id);
        setWatched(updated.watched);
    }

    /*
    useEffect(() => {
    if (!id) return;
    fetchMovieById(id).then(setMovie);
    }, [id]);
    */

    useEffect(() => {
  async function loadMovie() {
    if (tmdbId) {
      const data = await fetchMovieByTmdbId(tmdbId);
      setMovie(data);
      setWatched(data.watched);
    } else if (id) {
      const data = await fetchMovieById(id);
      setMovie(data);
      setWatched(data.watched);
    }
  }

  loadMovie();
}, [id, tmdbId]);

    if (!movie) return <p>Loading…</p>;

    return (
        <div>
            {/* Movie Title and year and runtime*/}
            <div>
                <h1>{movie.title}</h1>
                <p>
                    {movie.releaseDate && movie.releaseDate}
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
                    {movie.genres && movie.genres.length > 0 && (
  <div className="genre-container">
    {movie.genres.map((genre: any) => (
      <span key={genre.id} className="genre-bubble">
        {genre.name}
      </span>
    ))}
  </div>
)}
                    <p>{movie.overview || "No description available."}</p>
                </div>
            </div>

            {/* MAKE BETTER AND CHANGE CLASS NAME*/}

            <div className="movie-detail-content">
                <p>{`${movie.voteAverage} / 10`}</p>
                <p>{movie.popularity}</p>
                <div className="rating">
                    {range(10).map((value) => {
                        const activeValue = hovered ?? rating ?? 0;
                        const isActive = value <= activeValue;

                        return (
                        <button
                            key={value}
                            className={`star ${isActive ? "active" : ""}`}
                            onMouseEnter={() => setHovered(value)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => handleRating(value)}
                            aria-label={`Rate ${value}`}
                        >
                            ★
                        </button>
                        );
                    })}
                </div>

            </div>


            {/* watched and watch list button*/}
            <div className="movie-actions">
                <button
    className={`watched-btn ${watched ? "active" : ""}`}
    onClick={handleToggleWatched}
  >
    {watched ? "✓ Watched" : "👁 Mark as watched"}
  </button>
                <button className="watchlist-btn" onClick={() => setShowWatchlistModal(true)}>
                    + Add to Watchlist
                </button>
            </div>

            {/* Show watchlist popup*/}
            {showWatchlistModal && (
                <div className="modal-overlay" onClick={() => setShowWatchlistModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Watchlists</h3>
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
                                    const created = await onCreateWatchlist(newWatchlistName);
                                    setNewWatchlistName("");
                                    setShowCreateWatchlist(false);
                                    onAddMovie(created.id, movie!.id);
                                }}>
                            Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
