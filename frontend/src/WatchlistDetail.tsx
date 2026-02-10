import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Watchlist } from "./types/watchlist"; // define type separately
import { fetchWatchlists } from "./api";

type WatchlistItem = {
  movie: {
    id: string;
    title: string;
    posterPath?: string;
  };
};

export default function WatchlistDetail() {
  const { id } = useParams<{ id: string }>();
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const allWatchlists = await fetchWatchlists();
        const found = allWatchlists.find((wl: Watchlist) => wl.id === id);
        setWatchlist(found || null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <p>Loading watchlist...</p>;
  if (!watchlist) return <p>Watchlist not found</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{watchlist.name}</h1>

      {watchlist.items.length === 0 ? (
        <p>No movies in this watchlist.</p>
      ) : (
        <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
          {watchlist.items.map((item: WatchlistItem) => (
            <div key={item.movie.id} style={{ minWidth: 150 }}>
              {item.movie.posterPath ? (
                <img
                  src={item.movie.posterPath}
                  alt={item.movie.title}
                  style={{ width: "100%", borderRadius: 8 }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 225,
                    backgroundColor: "#ccc",
                    borderRadius: 8,
                  }}
                >
                  No Image
                </div>
              )}
              <p>{item.movie.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}