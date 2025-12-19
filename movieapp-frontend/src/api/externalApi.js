import { apiFetch } from "./http";

export function externalSearch(query) {
  const q = encodeURIComponent(query);
  return apiFetch(`/api/external/search?query=${q}`);
}

export function importFromOmdb(imdbId) {
  return apiFetch("/api/external/import", {
    method: "POST",
    body: JSON.stringify({ imdbId }),
  });
}
