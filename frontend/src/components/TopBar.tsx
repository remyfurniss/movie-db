import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { searchTmdbMovies } from "../lib/api";
import type { Movie } from "../types/movie";
import { useAuth } from "../features/auth/context/authContext";


import "./TopBar.css"

export default function TopBar() {
  const { user, logout } = useAuth();
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
    //No search value
    if (!searchValue.trim()) {
      setResults([]);
      return;
    }
    //slow down the searching between key strokes
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

      {user && (
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      )}

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