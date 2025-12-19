const BASE_URL = "http://localhost:8080";

export function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // ✅ Only attach token for NON-auth endpoints
  const isAuthEndpoint = path.startsWith("/api/auth/");
  if (token && !isAuthEndpoint) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("REQ", path, headers);

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  let data = null;
  if (text) {
    if (contentType.includes("application/json")) {
      try { data = JSON.parse(text); } catch { data = text; }
    } else {
      data = text;
    }
  }

  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  }

  return data;
}
