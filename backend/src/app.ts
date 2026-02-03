import express from "express";
import cors from "cors";
import movieRoutes from "./routes/movie";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/movies", movieRoutes);  // mount movie routes


app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
