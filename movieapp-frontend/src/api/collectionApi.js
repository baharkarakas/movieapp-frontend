import { apiFetch } from "./http";

export const fetchMyCollections = () => apiFetch("/api/collections/me");
export const fetchPublicCollections = () => apiFetch("/api/collections/public");

export const createCollection = (name, description, isPublic) =>
  apiFetch("/api/collections", {
    method: "POST",
    body: JSON.stringify({ name, description, isPublic }),
  });

export const updateCollection = (id, name, description, isPublic) =>
  apiFetch(`/api/collections/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, description, isPublic }),
  });

export const deleteCollection = (id) =>
  apiFetch(`/api/collections/${id}`, { method: "DELETE" });
