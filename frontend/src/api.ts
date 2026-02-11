const API_URL = "http://localhost:4000";
const DEV_USER_ID = "50de6f83-b409-465e-8269-3344453a08d7";

export async function fetchPopularMovies() {
  const res = await fetch(`${API_URL}/movies?popular=true&limit=20`);
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
export async function fetchRating(movieId: string) {
  const res = await fetch(`${API_URL}/ratings/${movieId}`);
  if (!res.ok) throw new Error("Failed to fetch rating");
  return res.json(); // { score: number | null }
}

// Submit or update rating
export async function submitRating(movieId: string, score: number) {
  const res = await fetch(`${API_URL}/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ movieId, score }),
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
  movieId: string
) {
  const res = await fetch(
    `${API_URL}/watchlists/${watchlistId}/movies`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    }
  );
  if (!res.ok) throw new Error("Failed to add movie");
  return res.json();
}

export async function removeMovieFromWatchlist(
  watchlistId: string,
  movieId: string
) {
       console.log("DELETE", watchlistId, movieId);

  const res = await fetch(
    `/watchlists/${watchlistId}/movies/${movieId}`,
    { method: "DELETE" }
  );

  if (!res.ok) {
    console.log("DELETE", watchlistId, movieId);
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
