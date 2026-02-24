export interface Movie {
  id: string;             
  tmdbId?: number;        
  title: string;
  releaseDate?: number;  
  posterPath?: string;
  backdropPath?: string;
  overview?: string;
  runtime?: number;       
  genres?: { id: number; name: string }[];
  voteAverage?: number;   
  voteCount?: number;     
  popularity?: number;    
  rating?: number;        
  watched?: boolean;    
}