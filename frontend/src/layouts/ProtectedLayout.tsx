import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { searchTmdbMovies } from "../api/api";
import type { Movie } from "../types/movie";

export default function ProtectedLayout() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const data = await searchTmdbMovies(searchValue);
      setSearchResults(data);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchValue]);

  return (
    <>
      <TopBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        results={searchResults}
        onSelectMovie={() => setSearchValue("")}
      />
      <Outlet />
    </>
  );
}