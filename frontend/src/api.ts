const API_URL = "http://localhost:4000";
const DEV_USER_ID = "50de6f83-b409-465e-8269-3344453a08d7";

/*
export async function fetchPopularMovies() {
  const res = await fetch(`${API_URL}/movies?popular=true&limit=20`);
  if (!res.ok) throw new Error("Failed to fetch popular movies");
  return res.json();
}
*/


export async function fetchRecentlyWatchedMovies() {
    const res = await fetch(`${API_URL}/movies/recentlywatched`);
    if (!res.ok) throw new Error("Failed to fetch recently watched movies");
    return res.json();
}

export async function fetchRecommendedMovies() {
    const res = await fetch(`${API_URL}/movies/recommendations`);
    if (!res.ok) throw new Error("Failed to fetch recommended movies");
    return res.json();
}

export async function fetchPopularMovies() {
  const res = await fetch(`${API_URL}/tmdb/popular`);
  if (!res.ok) throw new Error("Failed to fetch popular movies");
  return res.json();
}

export async function fetchMovies() {
  const res = await fetch(`${API_URL}/movies`);
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json();
}

export async function fetchWatchlists() {
  const res = await fetch(`${API_URL}/watchlists`);
  if (!res.ok) throw new Error("Failed to fetch watchlists");
  return res.json();
}

// Fetch rating for a movie
export async function fetchRating(tmdbId: number) {
  const res = await fetch(`${API_URL}/ratings/${tmdbId}`);
  if (!res.ok) throw new Error("Failed to fetch rating");
  return res.json(); // { score: number | null }
}

// Submit or update rating
export async function submitRating(tmdbId: number, score: number) {
  const res = await fetch(`${API_URL}/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tmdbId, score }),
  });
  if (!res.ok) throw new Error("Failed to submit rating");
  return res.json(); // returns the updated rating
}

export async function createWatchlist(name: string) {
  const res = await fetch(`${API_URL}/watchlists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: DEV_USER_ID,
      name,
    }),
  });

  if (!res.ok) throw new Error("Failed to create watchlist");
  return res.json();
}

export async function addMovieToWatchlist(
  watchlistId: string,
  tmdbId: number
) {
  const res = await fetch(
    `${API_URL}/watchlists/${watchlistId}/movies`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdbId }),
    }
  );
  if (!res.ok) throw new Error("Failed to add movie");
  return res.json();
}

export async function removeMovieFromWatchlist(
  watchlistId: string,
  movieId: string
) {

  const res = await fetch(
    `/watchlists/${watchlistId}/movies/${movieId}`,
    { method: "DELETE" }
  );

  if (!res.ok) {
    throw new Error("Failed to remove movie");
  }
}

export async function searchMovies(query: string) {
  const res = await fetch(
    `${API_URL}/movies?search=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch movies");
  }

  return res.json();
}

export async function fetchMovieById(id: string) {
  const res = await fetch(`${API_URL}/movies/${id}`);
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json();
}


export async function deleteWatchlist(watchlistId: string) {
  const res = await fetch(`/watchlists/${watchlistId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete watchlist");
  }
}

export async function searchTmdbMovies(query: string) {
  const res = await fetch(
    `${API_URL}/tmdb/search?q=${encodeURIComponent(query)}`
  );

  if (!res.ok) throw new Error("TMDB search failed");
  return res.json();
}

export async function fetchMovieByTmdbId(tmdbId: number) {
  const res = await fetch(`/movies/tmdb/${tmdbId}`);
  if (!res.ok) throw new Error("Failed to fetch movie");
  //console.log(res.json());
  return res.json();
}

export async function toggleWatched(tmdbId: number) {
  const res = await fetch(`/movies/${tmdbId}/watched`, {
    method: "PUT",
  });

  if (!res.ok) {
    throw new Error("Failed to update watched status");
  }

  return res.json();
}

