import { apiFetch } from "./http";

export function fetchCategories() {
  return apiFetch("/api/categories");
}

export function createCategory(name) {
  return apiFetch("/api/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function updateCategory(id, name) {
  return apiFetch(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export function deleteCategory(id) {
  return apiFetch(`/api/categories/${id}`, { method: "DELETE" });
}
