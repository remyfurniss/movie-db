import type { Movie } from "./movie";

export interface Watchlist {
    id: string;
    name: string;
    //Change to movies
    items?: { 
        movie: Movie;
    }[];
}