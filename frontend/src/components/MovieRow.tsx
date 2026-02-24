import type { Movie } from "../types/movie";

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
                        key={movie.id}
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