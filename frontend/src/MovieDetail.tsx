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
    onAddMovieToWatchlist: (watchlistId: string, movieId: string) => void;
    onCreateWatchlist: (name: string) => Promise<Watchlist>;
}

export default function MovieDetail({
    watchlists,
    onAddMovieToWatchlist,
    onCreateWatchlist
}: Props){

    const { id, tmdbId } = useParams();
    const [watched, setWatched] = useState(false);
    const [movie, setMovie] = useState<any>(null);
    const [selected, setSelected] = useState("");
    const [showWatchlistModal, setShowWatchlistModal] = useState(false);
    const [showAddWatchlistModal, setShowAddWatchlistModal] = useState(false);
    const [showCreateWatchlist, setShowCreateWatchlist] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState("");
    const [rating, setRating] = useState<number | null>(null);
    const [hovered, setHovered] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
    const navigate = useNavigate();
    const [showSetRating, setShowSetRating] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchRating(id).then(data => setRating(data.score));
    }, [tmdbId]);

    async function handleRating(score: number) {
        const updated = await submitRating(tmdbId!, score);
        setRating(updated.score);
        setMovie((movie) =>
    movie ? { ...movie, rating: updated.score } : movie
  );

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
  {/* TMDB Rating */}
  <div className="stat">
    <span className="label">TMDB RATING</span>

    <div className="rating-block">
      <span className="star tmdb">★</span>
      <div className="rating-text">
        <span className="value">{movie.voteAverage?.toFixed(1) ?? "-"} / 10</span>
        {movie.voteCount && (
          <span className="subtext">{movie.voteCount.toLocaleString()} votes</span>
        )}
      </div>
    </div>
  </div>

  {/* Your Rating */}
  <div className="stat">
    <span className="label">YOUR RATING</span>
    <button
      className="rating-block clickable"
      onClick={() => {
        document.getElementById("rating-section")?.scrollIntoView({ behavior: "smooth" });
        setShowSetRating(true);}
      }>
     
      <span className="star user">★</span>
      <span className="value">{movie.rating ?? "-"} / 10</span>
    </button>
  </div>

  {/* Popularity */}
  <div className="stat">
    <span className="label">POPULARITY</span>
    <div className="rating-block">
      <span className="star popularity">🔥</span>
      <span className="value">{movie.popularity?.toFixed(0)}</span>
    </div>
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
                    {/* watched and watch list button*/}
            <div className="movie-actions">
                <button
    className={`watched-btn ${watched ? "active" : ""}`}
    onClick={handleToggleWatched}
  >
    {watched ? "✓ Watched" : "Mark as watched"}
  </button>
                <button className="watchlist-btn" onClick={() => setShowWatchlistModal(true)}>
                    + Add to Watchlist
                </button>
            </div>
                </div>
            </div>

            {/* MAKE BETTER AND CHANGE CLASS NAME*/}


            {/* Show watchlist popup*/}
            {showWatchlistModal && (
                <div className="modal-overlay" 
                    onClick={() => setShowWatchlistModal(false)}>

                    <div className="modal" onClick={e => e.stopPropagation()}>

                        <h3 className="rating-popup-title">ADD TO WATCHLIST</h3> {/* chagen calss anem */}

                        <div className="movies-scroll-wrapper">

                            <div className="movies-scroll">

                                {watchlists.map((watchlist) => (
                                    <div key={watchlist.id}
                                        className="movie-card"
                                        onClick={() => {
                                            onAddMovieToWatchlist(watchlist.id, movie!.tmdbId);
                                            setShowWatchlistModal(false);}}>

                                        <div className="poster-wrapper">
                                            {watchlist.items?.[0]?.movie?.posterPath ? (
                                            <img
                                                src={watchlist.items[0].movie.posterPath}
                                                alt={watchlist.name}
                                            />
                                            ) : (
                                            <div className="placeholder">No Image</div>
                                            )}
                                        </div>

                                        <p>{watchlist.name}</p>
                                    </div>
                                ))}

                                {/* ➕ Add Watchlist Card */}
                                <div
                                    className="movie-card add-watchlist-card"
                                    onClick={() => {
                                        setShowAddWatchlistModal(true);}}>

                                    <div className="add-poster">

                                        <div className="add-icon">+</div>

                                    </div>

                                    <p className="movie-title">Add Watchlist</p>
                                    
                                </div>
                            </div>
                        </div>  
                    </div>
                </div>
            )}
            
        
        {/* Show add watchlist popup*/}
        {showAddWatchlistModal && (
  <div
    className="modal-overlay"
    onClick={() => setShowAddWatchlistModal(false)}
  >
    <div className="modal add-watchlist-modal" onClick={e => e.stopPropagation()}>
      <h3 className="rating-popup-title">ENTER WATCHLIST NAME</h3>

      <input
        className="watchlist-input"
        type="text"
        placeholder="e.g. Movies to Watch 🍿"
        value={newWatchlistName}
        onChange={(e) => setNewWatchlistName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && newWatchlistName.trim()) {
            onCreateWatchlist(newWatchlistName.trim());
            setShowAddWatchlistModal(false);
            setNewWatchlistName("");
          }
        }}
        autoFocus
      />

      <div className="modal-buttons">
        <button
          className="cancel-btn"
          onClick={() => setShowAddWatchlistModal(false)}
        >
          Cancel
        </button>

        <button
          className="confirm-btn"
          disabled={!newWatchlistName.trim()}
          onClick={() => {
            onCreateWatchlist(newWatchlistName.trim());
            setShowAddWatchlistModal(false);
            setNewWatchlistName("");
          }}
        >
          Create
        </button>
      </div>
    </div>
  </div>
)}




{showSetRating && (
  <div
    className="rating-popup-backdrop"
    onClick={() => setShowSetRating(false)}
  >
    <div className="rating-popup">
      {/* Title above stars */}
      <h3 className="rating-popup-title">RATE THIS MOVIE</h3>

      {/* Stars */}
      <div className="star-container">
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
  </div>
)}


        </div>
    );
}
