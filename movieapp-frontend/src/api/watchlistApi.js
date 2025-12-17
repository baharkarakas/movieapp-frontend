import { apiFetch } from "./http";

export function fetchWatchlist() {
  return apiFetch("/api/watchlist");
}

export function fetchWatchlistByCategory(categoryId) {
  return apiFetch(`/api/watchlist/category/${categoryId}`);
}

export function addToWatchlist(categoryId, movieId) {
  return apiFetch("/api/watchlist", {
    method: "POST",
    body: JSON.stringify({ categoryId, movieId }),
  });
}

export function deleteWatchlistItem(itemId) {
  return apiFetch(`/api/watchlist/${itemId}`, { method: "DELETE" });
}
