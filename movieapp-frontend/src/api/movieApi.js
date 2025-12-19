import { apiFetch } from "./http";

export function fetchMovies() {
  return apiFetch("/api/movies"); // now returns MY movies only (requires login)
}

export function createMovie(movie) {
  return apiFetch("/api/movies", {
    method: "POST",
    body: JSON.stringify(movie),
  });
}

export function updateMovie(id, movie) {
  return apiFetch(`/api/movies/${id}`, {
    method: "PUT",
    body: JSON.stringify(movie),
  });
}

export function deleteMovie(id) {
  return apiFetch(`/api/movies/${id}`, { method: "DELETE" });
}
