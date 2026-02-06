import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovieById } from "./api";

type Watchlist = {
  id: string;
  name: string;
};

export default function MovieDetail({
  watchlists,
  onAddMovie,
}: {
  watchlists: Watchlist[];
  onAddMovie: (watchlistId: string, movieId: string) => void;
}) {
  const { id } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchMovieById(id).then(setMovie);
  }, [id]);

  if (!movie) return <p>Loading…</p>;

  return (
    <div>
      <h1>{movie.title}</h1>
      <p>{movie.overview}</p>

      <p>
        <strong>Release:</strong> {movie.releaseDate}
      </p>

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Select watchlist</option>
        {watchlists.map((wl) => (
          <option key={wl.id} value={wl.id}>
            {wl.name}
          </option>
        ))}
      </select>

      <button
        disabled={!selected}
        onClick={() => onAddMovie(selected, movie.id)}
      >
        Add to watchlist
      </button>
    </div>
  );
}
