import { ActorInfo } from "./actorInfo";
import { MovieInfo } from "./movieInfo";
import { TvInfo } from "./tvInfo";

export interface DbResponse {
  // For search
  page: number;
  results: [MovieInfo | TvInfo];
  total_pages: number;
  total_results: number;

  // For credits
  id: number;
  cast: [ActorInfo];
}
