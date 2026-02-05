const API_URL = "http://localhost:4000";
const DEV_USER_ID = "50de6f83-b409-465e-8269-3344453a08d7";

export async function fetchMovies() {
  const res = await fetch(`${API_URL}/movies`);
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json();
}

export async function fetchWatchlists() {
  const res = await fetch(`${API_URL}/watchlists/user/${DEV_USER_ID}`);
  if (!res.ok) throw new Error("Failed to fetch watchlists");
  return res.json();
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

export async function searchMovies(query: string) {
  const res = await fetch(
    `${API_URL}/movies?search=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch movies");
  }

  return res.json();
}
