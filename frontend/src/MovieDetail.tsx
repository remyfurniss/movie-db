import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchRating, submitRating, fetchMovieByTmdbId, toggleWatched } from "./api";

import AddWatchlistPopup from "./components/AddWatchlistPopup";
import SetRatingPopup from "./components/SetRatingPopup";
import WatchlistPopup from "./components/WatchlistPopup";

import type { Movie } from "./types/movie";
import type { Watchlist } from "./types/watchlist";


type Props = {
    watchlists: Watchlist[];
    onAddMovieToWatchlist: (watchlistId: string, tmdbId: number) => void;
    onCreateWatchlist: (name: string) => Promise<Watchlist>;
}

export default function MovieDetail({
    watchlists,
    onAddMovieToWatchlist,
    onCreateWatchlist
}: Props){

    const { tmdbId } = useParams<{ tmdbId: string }>();
    const tmdbIdNumber = tmdbId ? Number(tmdbId) : undefined;


    const [watched, setWatched] = useState(false);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [showWatchlistPopup, setShowWatchlistPopup] = useState(false);
    const [showAddWatchlistPopup, setShowAddWatchlistPopup] = useState(false);
    const [rating, setRating] = useState<number | null>(null);
    const [showSetRating, setShowSetRating] = useState(false);

    useEffect(() => {
        if (!tmdbIdNumber) return;
        async function loadRating() {
            try {
                const data = await fetchRating(tmdbIdNumber!); 
                setRating(data.score);
            } catch (err) {
                console.error("Failed to fetch rating:", err);
            }
        }
        loadRating();
    }, [tmdbIdNumber]);

    async function handleRating(score: number) {
        if (!tmdbIdNumber) return; 
        const updated = await submitRating(tmdbIdNumber, score);
        setRating(updated.score);
        setMovie((prevMovie) =>
            prevMovie ? { ...prevMovie, rating: updated.score } : prevMovie
        );
    }

    async function handleToggleWatched() {
        if (!movie?.tmdbId) return;
        const updated = await toggleWatched(movie.tmdbId);
        setWatched(updated.watched);
    }

    useEffect(() => {
        if (!tmdbIdNumber) return; 
        const loadMovie = async () => {
            try {
                const data = await fetchMovieByTmdbId(tmdbIdNumber);
                setMovie(data);
                setWatched(data.watched);
                setRating(data.rating);
            } catch (err) {
                console.error("Failed to load movie:", err);
            }
        };
        loadMovie();
    }, [tmdbIdNumber]);


    ///MAKE THIS CONSISTENT
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
                                    <span className="subtext">{movie.voteCount.toLocaleString()} votes</span>)}
                            </div>
                        </div>
                    </div>

                    {/* Your Rating */}
                    <div className="stat">
                        <span className="label">YOUR RATING</span>
                        <button
                            className="rating-block clickable"
                            onClick={() => {
                                setShowSetRating(true);}}>
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
                    backgroundImage: `url(${movie.backdropPath})`}}/>)}

            {/* Movie Poster */}
            <div className="movie-detail-content">
                {movie.posterPath && (
                    <div className="movie-detail-poster">
                        <img src={movie.posterPath} alt={movie.title} />
                    </div>)}

                <div className="movie-detail-info">
                    
                    {/* Movie Genres */}
                    {movie.genres && movie.genres.length > 0 && (
                        <div className="genre-container">
                            {movie.genres.map((genre: any) => (
                                <span key={genre.id} className="genre-bubble">
                                    {genre.name}
                                </span>))}
                        </div>)}

                    {/* Movie Overview */}
                    <p>{movie.overview || "No description available."}</p>

                    {/* Action buttons */}
                    <div className="movie-actions">

                        {/* Watched button */}
                        <button
                            className={`watched-btn ${watched ? "active" : ""}`}
                            onClick={handleToggleWatched}>
                            {watched ? "✓ Watched" : "Mark as watched"}
                        </button>

                        {/* Watchlist button */}
                        <button 
                            className="watchlist-btn" 
                            onClick={() => setShowWatchlistPopup(true)}>
                            + Add to Watchlist
                        </button>
                    </div>
                </div>
            </div>

            {/* Popups */}

            {/* Show watchlist popup */}
            <WatchlistPopup
                isOpen={showWatchlistPopup}
                watchlists={watchlists}
                movieTmdbId={movie!.tmdbId}
                onClose={() => setShowWatchlistPopup(false)}
                onAddToWatchlist={onAddMovieToWatchlist}
                onCreateWatchlist={() => setShowAddWatchlistPopup(true)}/>
        
            {/* Show add watchlist popup */}
            <AddWatchlistPopup
                isOpen={showAddWatchlistPopup}
                onClose={() => setShowAddWatchlistPopup(false)}
                onCreateWatchlist={onCreateWatchlist}/>

            {/* Show set rating popup */}
            <SetRatingPopup
                isOpen={showSetRating}
                rating={rating}
                onClose={() => setShowSetRating(false)}
                onRate={handleRating}/>
        </div>
    );
}
