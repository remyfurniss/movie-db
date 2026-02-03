import "dotenv/config"; // <- MUST be first
import express from "express";
import movieRoutes from "./routes/movie";

const app = express();
app.use(express.json());
app.use("/movies", movieRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
