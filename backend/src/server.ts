import "dotenv/config";
import app from "./app";
import { startCleanupJob } from "./jobs/cleanupMovies";

startCleanupJob();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});