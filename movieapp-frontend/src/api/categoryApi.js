import { apiFetch } from "./http";

// ✅ my collections (login required)
export function fetchCategories() {
  return apiFetch("/api/collections/me");
}

// ✅ create collection (payload: {name, description, isPublic})
export function createCategory(payload) {
  return apiFetch("/api/collections", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      description: payload.description || "",
      isPublic: !!payload.isPublic,
    }),
  });
}

// ✅ update collection (payload: {name, description, isPublic})
export function updateCategory(id, payload) {
  return apiFetch(`/api/collections/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: payload.name,
      description: payload.description || "",
      isPublic: !!payload.isPublic,
    }),
  });
}

// ✅ delete collection
export function deleteCategory(id) {
  return apiFetch(`/api/collections/${id}`, { method: "DELETE" });
}

// ✅ public collections
export function fetchPublicCollections() {
  return apiFetch("/api/collections/public");
}

// ✅ public collection items
export function fetchCollectionItems(id) {
  return apiFetch(`/api/collections/${id}/items`);
}
