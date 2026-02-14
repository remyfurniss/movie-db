import express from "express";
import cors from "cors";
import movieRoutes from "./routes/movie";
import genreRoutes from "./routes/genre";
import ratingRoutes from "./routes/rating";
import watchlistRoutes from "./routes/watchlist";
import tmdbRoutes from "./routes/tmdb";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/movies", movieRoutes);  // mount movie routes
app.use("/genres", genreRoutes);
app.use("/ratings", ratingRoutes);
app.use("/watchlists", watchlistRoutes);
app.use("/tmdb", tmdbRoutes);


app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
