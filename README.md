# Movie-DB

Movie-DB is a full-stack movie tracking application where users can search movies, rate them, mark them as watched, and organize them into watchlists.

Movie data is fetched from the TMDB API and cached in a PostgreSQL database.

---

## Features

- User authentication (JWT)
- Search movies from TMDB
- View detailed movie information
- Rate movies
- Mark movies as watched
- Create and manage watchlists
- Add movies to watchlists
- Cached movie data to reduce API calls

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router

### Backend
- Node.js
- Express
- Prisma ORM
- Zod validation
- JWT authentication

### Database
- PostgreSQL

### Infrastructure
- Docker
- Docker Compose

### External API
- TMDB (The Movie Database)

---

## Installation

Clone the repository:

```bash
git clone https://github.com/remyfurniss/movie-db.git
cd movie-db
```

---

## Environment Variables

Create environment files using the provided examples.

### Backend `.env`

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/moviedb?schema=public
TMDB_API_KEY=your_tmdb_api_key
TMDB_TOKEN=your_tmdb_token
JWT_SECRET=your_secret_key
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:4000
```
---

## Generating a JWT Secret

Generate a secure secret using:

```bash
openssl rand -base64 32
```
---

## TMDB API Setup

Movie data is fetched from **The Movie Database (TMDB)**.

To obtain API credentials:

1. Create a free account at  
   https://www.themoviedb.org/

2. Go to **Settings → API**

3. Generate:
   - **API Key**
   - **Read Access Token**

4. Add them to your backend `.env` file:

```env
TMDB_API_KEY=your_tmdb_api_key
TMDB_TOKEN=your_tmdb_read_access_token
```

---

## Running the Application

The project uses Docker to run the frontend, backend, and PostgreSQL database.

Start the application:

```bash
docker compose up --build
```

Services will start at:

Frontend  
http://localhost:5173

Backend API  
http://localhost:4000

PostgreSQL  
localhost:5432

---

## Database

Prisma is used as the ORM.

If migrations are needed:

```bash
docker compose exec backend npx prisma migrate dev
```

## License

MIT License

