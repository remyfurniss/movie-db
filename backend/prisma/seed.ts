import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up existing data (optional, safe for dev only)
  await prisma.rating.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.movieGenre.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  // Seed genres
  const genres = await prisma.genre.createMany({
    data: [
      { name: 'Action' },
      { name: 'Comedy' },
      { name: 'Sci-Fi' },
      { name: 'Drama' },
      { name: 'Horror' },
    ],
  });
  console.log('Seeded genres');

  // Seed a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'password', // Ideally hashed in real apps
      role: 'USER',
    },
  });
  console.log('Seeded user');

  // Seed movies
  const movie1 = await prisma.movie.create({
    data: {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through dream-sharing technology.',
      releaseYear: 2010,
    },
  });

  const movie2 = await prisma.movie.create({
    data: {
      title: 'The Dark Knight',
      description: 'Batman faces the Joker in Gotham City.',
      releaseYear: 2008,
    },
  });

  console.log('Seeded movies');

  // Link movies and genres
  const allGenres = await prisma.genre.findMany();

  await prisma.movieGenre.createMany({
    data: [
      { movieId: movie1.id, genreId: allGenres.find(g => g.name === 'Action')!.id },
      { movieId: movie1.id, genreId: allGenres.find(g => g.name === 'Sci-Fi')!.id },
      { movieId: movie2.id, genreId: allGenres.find(g => g.name === 'Action')!.id },
      { movieId: movie2.id, genreId: allGenres.find(g => g.name === 'Drama')!.id },
    ],
  });
  console.log('Linked movies to genres');

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
