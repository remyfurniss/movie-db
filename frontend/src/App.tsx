import './App.css'
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  fetchWatchlists,
  createWatchlist,
  addMovieToWatchlist,
  searchTmdbMovies
} from "./api/api";

import { useAuth, AuthProvider } from "./context/authContext";
import { WatchlistProvider } from "./context/watchlistContext";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./layouts/ProtectedLayout";
import PublicLayout from "./layouts/PublicLayout";

import Home from './pages/Home'; 
import MovieDetail from "./pages/MovieDetail";
import TopBar from './components/TopBar'; 
import WatchlistDetail from './pages/WatchlistDetail';
import Login from "./pages/Login";
import Register from "./pages/Register";

function AppRoutes() {

  return (
    <Routes>
      {/* public */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* protected */}
      <Route
  element={
    <ProtectedRoute>
      <WatchlistProvider>
        <ProtectedLayout />
      </WatchlistProvider>
    </ProtectedRoute>
  }
>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/movies/tmdb/:tmdbId" element={<MovieDetail />} />
        <Route path="/watchlists/:id" element={<WatchlistDetail />} />
      </Route>
    </Routes>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {

  const { user } = useAuth();

  return (
    <div className='app'>
      {user && (  // only render TopBar if logged in
    <TopBar/>
  )}
      <AppRoutes/>
    </div>
  );
}

export default AppWrapper;
//export default App
