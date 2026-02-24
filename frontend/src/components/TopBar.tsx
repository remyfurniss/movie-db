import { useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
import type { Movie } from "./types/movie";

type TopbarProps = {
    searchValue: string;
    onSearchChange: (value: string) => void;
    results: Movie[];
    onSelectMovie: () => void;
};

export default function TopBar({
    searchValue,
    onSearchChange,
    results,
    onSelectMovie,
}: TopbarProps) {

    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    //Resets the search if click off 
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                onSelectMovie(); 
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onSelectMovie]);

    return (
        <div className="search-container" ref={containerRef}>
            {/* Home Button */}
            <button
                className="home-btn"
                onClick={() => navigate("/")}>
                Home
            </button>
            {/* Input bar */}
            <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search movies..."/>
            {/* Show search values */}
            {searchValue.trim() && results.length > 0 && (
                <div className="search-dropdown">
                    {results.map(movie => (
                    <div
                        key={movie.tmdbId}
                        className="search-item"
                        onClick={() => {
                            navigate(`/movies/tmdb/${movie.tmdbId}`);
                            onSelectMovie();}}>
                        <img
                            src={movie.posterPath || "https://via.placeholder.com/40x60?text=🎬"}
                            alt={movie.title}
                            className="search-poster"/>
                        <div className="search-text">
                            <div className="search-title">{movie.title}</div>
                            {movie.releaseDate && (
                                <div className="search-year">{movie.releaseDate}</div>)}
                        </div>
                    </div>
                    ))}
                </div>
            )}   
        </div>
    );
}