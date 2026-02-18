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
    }, [tmdbId]);

    async function handleRating(score: number) {
        const updated = await submitRating(tmdbId!, score);
        setRating(updated.score);
    }

    async function handleToggleWatched() {
        console.log("WATCH TOGGLE ID:", movie.tmdbId);
        const updated = await toggleWatched(movie.tmdbId);
        setWatched(updated.watched);
    }

    /*
    useEffect(() => {
    if (!id) return;
    fetchMovieById(id).then(setMovie);
    }, [id]);
    */




////DONT NEED FETCH BY ID

    useEffect(() => {
  async function loadMovie() {
    if (tmdbId) {
        console.log("by TMDBID");
      const data = await fetchMovieByTmdbId(tmdbId);//failed in here
      setMovie(data);
      console.log(data);
      setWatched(data.watched);
      setRating(data.rating);
    } else if (id) {////dont need
        console.log("by ID");
      const data = await fetchMovieById(id);
      setMovie(data);
      setWatched(data.watched);
    }
  }

  loadMovie();
}, [tmdbId]);






    if (!movie) return <p>Loading…</p>;

    return (
        <div>
{/* Movie Title and stats */}
<div className="movie-header">
  <div className="movie-header-left">
    <h1>{movie.title}</h1>
    <p>
      {movie.releaseDate && movie.releaseDate}
      {movie.runtime && ` • ${movie.runtime} min`}
    </p>
  </div>

  <div className="movie-header-right">
    <div className="stat">
      <span className="label">TMDB RATING</span>
      <span className="value">
        <span className="star tmdb">★</span>
        {movie.voteAverage?.toFixed(1)} / 10
      </span>
    </div>

    <div className="stat">
      <span className="label">YOUR RATING</span>
        <span className="value">
            <span className="star user">★</span>
            {movie.rating ?? "-"} / 10
        </span>
    </div>

    <div className="stat">
      <span className="label">POPULARITY</span>
      <span className="value">{`🔥 ${movie.popularity?.toFixed(0)}`}</span>
    </div>
  </div>
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
                <p>{`${movie.voteAverage.toFixed(1)} / 10`}</p>
                <p>{movie.voteCount}</p>
                <p>{movie.popularity.toFixed(1)}</p>
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
                                        onAddMovie(wl.id, movie!.tmdbId);/////////////THIS NEEDS FIXING
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
                                    onAddMovie(created.id, movie!.tmdbId); ///Auto adds to databse -- REMOCE
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
