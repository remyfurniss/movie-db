import "dotenv/config"; // <- MUST be first
import express from "express";
import movieRoutes from "./routes/movie";
import genreRoutes from "./routes/genre";
import ratingRoutes from "./routes/rating";
import watchlistRoutes from "./routes/watchlist";

const app = express();
app.use(express.json());
app.use("/movies", movieRoutes);
app.use("/genres", genreRoutes);
app.use("/ratings", ratingRoutes);
app.use("/watchlists", watchlistRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
