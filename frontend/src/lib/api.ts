const API_URL = import.meta.env.VITE_API_URL || "";

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Error");
  return data;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Fetch Recently Watched Moives
export async function fetchRecentlyWatchedMovies() {
  return apiFetch(`/api/movies/recentlywatched`, {
    headers: authHeaders(),
  });
}

// Fetch Recommened Movies
export async function fetchRecommendedMovies() {
  return apiFetch(`/api/movies/recommendations`, {
    headers: authHeaders(),
  });
}

// Fetch Popular Movies
export async function fetchPopularMovies() {
  return apiFetch(`/api/tmdb/popular`, {
    headers: authHeaders(),
  });
}

// Fetch Watchlists
export async function fetchWatchlists() {
  return apiFetch(`/api/watchlists`, {
    headers: authHeaders(),
  });
}

// Fetch rating for a movie
export async function fetchRating(tmdbId: number) {
  return apiFetch(`/api/ratings/${tmdbId}`, {
    headers: authHeaders(),
  });
}

// Submit or update rating
export async function submitRating(tmdbId: number, score: number | null) {
  return apiFetch(`/api/ratings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ tmdbId, score })
  });
}

// Create a Watchlist
export async function createWatchlist(name: string) {
  return apiFetch(`/api/watchlists`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({name})
  });
}

// Add a movie to a Watchlist
export async function addMovieToWatchlist(watchlistId: string, tmdbId: number) {
  return apiFetch(`/api/watchlists/${watchlistId}/movies`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ tmdbId }),
  });
}


// Remove a movie from a Watchlist
export async function removeMovieFromWatchlist(watchlistId: string, movieId: string) {
  return apiFetch(`/api/watchlists/${watchlistId}/movies/${movieId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

// Delete a Watchlist
export async function deleteWatchlist(watchlistId: string) {
  return apiFetch(`/api/watchlists/${watchlistId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

// Search TMDB API by string
export async function searchTmdbMovies(query: string) {
  return apiFetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`, {
    headers: authHeaders()
  });
}


// Fetch movie by TMDBID
export async function fetchMovieByTmdbId(tmdbId: number) {
  return apiFetch(`/api/movies/tmdb/${tmdbId}`, {
    headers: authHeaders()
  });
}

// Toggle watched 
export async function toggleWatched(tmdbId: number) {
  return apiFetch(`/api/movies/${tmdbId}/watched`, {
    method: "PUT",
    headers: authHeaders(),
  });
}

// Login
export async function loginRequest(email: string, password: string) {
  return apiFetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

// Register
export async function registerRequest(email: string, password: string) {
  return apiFetch(`/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

// Get current user
export async function fetchCurrentUser() {
  return apiFetch(`/api/auth/me`, {
    method: "GET",
    headers: authHeaders(),
  });
}


