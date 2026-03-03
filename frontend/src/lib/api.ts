const API_URL = "http://localhost:4000";

//NEED TO CHANGE IN FUTURE
const DEV_USER_ID = "50de6f83-b409-465e-8269-3344453a08d7";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Fetch Recently Watched Moives
export async function fetchRecentlyWatchedMovies() {
    const res = await fetch(`${API_URL}/movies/recentlywatched`,
       {headers: authHeaders()});
    if (!res.ok) throw new Error("Failed to fetch recently watched movies");
    return res.json();
}

// Fetch Recommened Movies
export async function fetchRecommendedMovies() {
    const res = await fetch(`${API_URL}/movies/recommendations`,
      {headers: authHeaders()});
    if (!res.ok) throw new Error("Failed to fetch recommended movies");
    return res.json();
}

// Fetch Popular Movies
export async function fetchPopularMovies() {
  const res = await fetch(`${API_URL}/tmdb/popular`);
  if (!res.ok) throw new Error("Failed to fetch popular movies");
  return res.json();
}

// Fetch Watchlists
export async function fetchWatchlists() {
  const res = await fetch(`${API_URL}/watchlists`,
    {headers: authHeaders()});
  if (!res.ok) throw new Error("Failed to fetch watchlists");
  return res.json();
}

// Fetch rating for a movie
export async function fetchRating(tmdbId: number) {
  const res = await fetch(`${API_URL}/ratings/${tmdbId}`, 
    {headers: authHeaders()});
  if (!res.ok) throw new Error("Failed to fetch rating");
  return res.json(); // { score: number | null }
}

// Submit or update rating
export async function submitRating(tmdbId: number, score: number | null) {
  const res = await fetch(`${API_URL}/ratings`, 
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ tmdbId, score })
    });
  if (!res.ok) throw new Error("Failed to submit rating");
  return res.json(); // returns the updated rating
}

// Create a Watchlist
export async function createWatchlist(name: string) {
  const res = await fetch(`${API_URL}/watchlists`, 
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        userId: DEV_USER_ID,
        name})
    });
  if (!res.ok) throw new Error("Failed to create watchlist");
  return res.json();
}

// Add a movie to a Watchlist
export async function addMovieToWatchlist(watchlistId: string, tmdbId: number) {
  const res = await fetch(
    `${API_URL}/watchlists/${watchlistId}/movies`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ tmdbId }),
    }
  );
  if (!res.ok) throw new Error("Failed to add movie");
  return res.json();
}

// Remove a movie from a Watchlist
export async function removeMovieFromWatchlist(watchlistId: string, movieId: string) {
  const res = await fetch(
    `${API_URL}/watchlists/${watchlistId}/movies/${movieId}`,
    { 
      method: "DELETE",
      headers: authHeaders(),
    }
  );
  if (!res.ok) {
    throw new Error("Failed to remove movie");
  }
}

// Delete a Watchlist
export async function deleteWatchlist(watchlistId: string) {
  const res = await fetch(`${API_URL}/watchlists/${watchlistId}`, 
  {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to delete watchlist");
  }
}

// Search TMDB API by string
export async function searchTmdbMovies(query: string) {
  const res = await fetch(
    `${API_URL}/tmdb/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("TMDB search failed");
  return res.json();
}

// Fetch movie by TMDBID
export async function fetchMovieByTmdbId(tmdbId: number) {
  const res = await fetch(`${API_URL}/movies/tmdb/${tmdbId}`, 
    {headers: authHeaders()});
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json();
}

// Toggle watched 
export async function toggleWatched(tmdbId: number) {
  const res = await fetch(`${API_URL}/movies/${tmdbId}/watched`, 
    {
      method: "PUT",
      headers: authHeaders()
    });
  if (!res.ok) {
    throw new Error("Failed to update watched status");
  }
  return res.json();
}

// Login
export async function loginRequest(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

// Register
export async function registerRequest(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Register failed");
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch current user");
  }

  return res.json();
}

