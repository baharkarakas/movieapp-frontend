import { apiFetch } from "./http";

export function fetchLikes() {
  return apiFetch("/api/likes");
}

export function likeMovie(movieId) {
  return apiFetch(`/api/likes/${movieId}`, { method: "POST" });
}

export function unlikeMovie(movieId) {
  return apiFetch(`/api/likes/${movieId}`, { method: "DELETE" });
}
