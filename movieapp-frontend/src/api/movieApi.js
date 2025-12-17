import { apiFetch } from "./http";

export function fetchMovies() {
  return apiFetch("/api/movies");
}
