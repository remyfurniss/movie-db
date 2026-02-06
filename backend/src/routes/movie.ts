import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

// Create a movie
router.post("/", async (req, res) => {
  const { title, director, releaseYear } = req.body;
  try {
    const movie = await prisma.movie.create({
      data: { title, director, releaseYear },
    });
    res.json(movie);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all movies
router.get("/", async (req, res) => {

  const search = req.query.search as string | undefined;

  const movies = await prisma.movie.findMany({
    where: search
      ? {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy: {
      title: "asc",
    },
    take: 50, // safety limit
  });

  res.json(movies);
});

router.get("/search", async (req, res) => {
  const q = req.query.q as string;

  if (!q) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const movies = await prisma.movie.findMany({
      where: {
        title: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 20,
    });

    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

// Get a movie by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
    
  if (!id) {
    return res.status(400).json({ error: "Movie id is required" });
  }

  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.json(movie);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update a movie
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, director, releaseYear } = req.body;
  try {
    const movie = await prisma.movie.update({
      where: { id },
      data: { title, director, releaseYear },
    });
    res.json(movie);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a movie
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.movie.delete({ where: { id: Number(id) } });
    res.json({ message: "Movie deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
