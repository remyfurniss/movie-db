import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { searchTmdbMovies } from "../lib/api";
import type { Movie } from "../types/movie";

import "./TopBar.css"

export default function TopBar() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<Movie[]>([]);

  // Reset search when click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSearchValue("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results
  useEffect(() => {
    if (!searchValue.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const data = await searchTmdbMovies(searchValue);
        setResults(data);
      } catch (err) {
        console.error("Failed to search movies:", err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchValue]);

  return (
    <div className="search-container" ref={containerRef}>
      {/* Home Button */}
      <button className="home-btn" onClick={() => navigate("/")}>
        Home
      </button>

      {/* Input bar */}
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search movies..."
      />

      {/* Show search results */}
      {searchValue.trim() && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((movie) => (
            <div
              key={movie.tmdbId}
              className="search-item"
              onClick={() => {
                navigate(`/movies/tmdb/${movie.tmdbId}`);
                setSearchValue("");
              }}
            >
              <img
                src={movie.posterPath || "https://via.placeholder.com/40x60?text=🎬"}
                alt={movie.title}
                className="search-poster"
              />
              <div className="search-text">
                <div className="search-title">{movie.title}</div>
                {movie.releaseDate && <div className="search-year">{movie.releaseDate}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}