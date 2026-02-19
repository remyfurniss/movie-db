import axios from "axios";

export async function getRecommendationsForMovie(tmdbId: number) {
  const res = await axios.get(
    `https://api.themoviedb.org/3/movie/${tmdbId}/recommendations`,
    {
      params: { api_key: process.env.TMDB_API_KEY },
    }
  );

  return res.data.results;
}