import './App.css'
import { Routes, Route } from "react-router-dom";

import { useAuth, AuthProvider } from "./context/authContext";
import { WatchlistProvider } from "./context/watchlistContext";

import TopBar from './components/TopBar'; 
import ProtectedRoute from "./components/ProtectedRoute";

import ProtectedLayout from "./layouts/ProtectedLayout";
import PublicLayout from "./layouts/PublicLayout";

import Home from './pages/Home'; 
import MovieDetail from "./pages/MovieDetail";
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
      <Route element={
        <ProtectedRoute>
          <WatchlistProvider>
            <ProtectedLayout />
          </WatchlistProvider>
        </ProtectedRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/movies/tmdb/:tmdbId" element={<MovieDetail />} />
        <Route path="/watchlists/:id" element={<WatchlistDetail />} />
      </Route>

    </Routes>
  );
}

function InnerApp() {
  const { user } = useAuth();

  return (
    <div className='app'>
      {user && <TopBar />}
      <AppRoutes />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

export default App;
