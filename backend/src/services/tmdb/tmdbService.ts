import axios from "axios";

export async function fetchPopularMoviesFromTMDB() {
  // Get most popular movies from TMDB
  const response = await axios.get(
    "https://api.themoviedb.org/3/movie/popular",
    {
      params: {
        api_key: process.env.TMDB_API_KEY,
      },
    }
  );
  return response.data.results.map((m: any) => ({
    tmdbId: m.id,
    title: m.title,
    posterPath: m.poster_path
      ? `https://image.tmdb.org/t/p/w300${m.poster_path}`
      : null,
    releaseDate: m.release_date
      ? Number(m.release_date.split("-")[0])
      : null,
    popularity: m.popularity,
    voteAverage: m.vote_average,
    voteCount: m.vote_count,
  }));
}

export async function getRecommendationsForMovie(tmdbId: number) {
  // Get recommnedations from TMDB by a chosen movie tmdbId
  const res = await axios.get(
    `https://api.themoviedb.org/3/movie/${tmdbId}/recommendations`,
    {
      params: { api_key: process.env.TMDB_API_KEY },
    }
  );
  return res.data.results;
}