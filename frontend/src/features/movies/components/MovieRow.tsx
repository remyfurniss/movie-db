import type { Movie } from "../../../types/movie";

import "../../../styles/ui/scrollRow.css";
import "../../../styles/ui/movieCard.css";

type MovieRowProps = {
  title: string;
  movies: Movie[];
  onMovieClick: (tmdbId: number) => void;
};

export default function MovieRow({
  title,
  movies,
  onMovieClick,
}: MovieRowProps) {

    return(
        <section className="movie-row">
            <h2>{title}</h2>
            <div className="movies-scroll-wrapper">
                <div className="movies-scroll">
                {movies.map((movie) => (
                    <div
                        key={movie.tmdbId}
                        className="movie-card"
                        onClick={() => {
                            if (!movie.tmdbId) return;
                            onMovieClick(movie.tmdbId);}}>
                        {movie.posterPath ? 
                            (<img src={movie.posterPath} alt={movie.title} />) : 
                            (<div className="placeholder">No Image</div>)}
                        <p>{movie.title}</p>
                    </div>
                ))}
                </div>
            </div>
        </section>
    );
}