import "dotenv/config"; // <- MUST be first
import express from "express";
import cors from "cors";
import movieRoutes from "./routes/movie";
import ratingRoutes from "./routes/rating";
import watchlistRoutes from "./routes/watchlist";
import tmdbRoutes from "./routes/tmdb";
import authRoutes from "./routes/auth";

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use("/api/movies", movieRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/watchlists", watchlistRoutes);
app.use("/api/tmdb", tmdbRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
