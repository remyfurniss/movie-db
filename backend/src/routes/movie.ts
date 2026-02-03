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
  const movies = await prisma.movie.findMany();
  res.json(movies);
});

// Get a movie by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: Number(id) },
    });
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
      where: { id: Number(id) },
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
