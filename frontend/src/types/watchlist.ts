import type { Movie } from "./movie";

export interface Watchlist {
    id: string;
    name: string;
    items: {
        movie: Movie;
    }[];
}