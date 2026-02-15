import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import type { Movie } from "./types/movie";



type Props = {
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
}: Props) {
  const showDropdown = searchValue.trim() !== "" && results.length > 0;
    const navigate = useNavigate();

        //console.log("SEARCH VALUE:", searchValue);
        console.log("TopBar results:", results);

  return (
    <div className="search-container">
        {/* Home Button */}
      <button
        className="home-btn"
        onClick={() => navigate("/")}
      >
        Home
      </button>


  <input
    type="text"
    value={searchValue}
    onChange={(e) => onSearchChange(e.target.value)}
    placeholder="Search movies..."
  />

  {searchValue.trim() && results.length > 0 && (
  <div className="search-dropdown">
    {results.map(movie => (
      <div
        key={movie.tmdbId}
        className="search-item"
        onClick={() => {
            //navigate(`/movies/${movie.id}`); 
            navigate(`/movies/tmdb/${movie.tmdbId}`);
            onSelectMovie();}}>
               
                <img
          src={movie.posterPath || "https://via.placeholder.com/40x60?text=🎬"}
          alt={movie.title}
          className="search-poster"
        />

         
        <div className="search-text">
          <div className="search-title">{movie.title}</div>
          {movie.releaseDate && (
            <div className="search-year">{movie.releaseDate}</div>
          )}
        </div>
        
      </div>
    ))}
  </div>
    )}


    
</div>
  );
}