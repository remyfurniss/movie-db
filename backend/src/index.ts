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
  origin: "http://localhost:5174",
  credentials: true,
}));
app.use(express.json());
app.use("/movies", movieRoutes);
app.use("/ratings", ratingRoutes);
app.use("/watchlists", watchlistRoutes);
app.use("/tmdb", tmdbRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
