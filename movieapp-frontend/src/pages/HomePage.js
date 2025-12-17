import { useEffect, useState } from "react";
import { fetchMovies } from "../api/movieApi";
import { likeMovie, unlikeMovie, fetchLikes } from "../api/likeApi";
import { fetchCategories } from "../api/categoryApi";
import { addToWatchlist } from "../api/watchlistApi";
import { getToken } from "../api/http";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [likes, setLikes] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [error, setError] = useState("");

  const token = getToken();
  const isLoggedIn = token && token.startsWith("ey");


  useEffect(() => {
    fetchMovies()
      .then(setMovies)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    fetchLikes()
      .then((arr) => setLikes(new Set(arr.map((x) => x.movieId))))
      .catch(() => {});
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, [isLoggedIn]);

  const toggleLike = async (movieId) => {
    try {
      if (!isLoggedIn) {
        setError("Please login to like movies.");
        return;
      }
      if (likes.has(movieId)) {
        await unlikeMovie(movieId);
        const next = new Set(likes);
        next.delete(movieId);
        setLikes(next);
      } else {
        await likeMovie(movieId);
        const next = new Set(likes);
        next.add(movieId);
        setLikes(next);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const addWL = async (movieId) => {
    try {
      if (!isLoggedIn) {
        setError("Please login to add to watchlist.");
        return;
      }
      if (!selectedCategoryId) {
        setError("Select a category first.");
        return;
      }
      await addToWatchlist(Number(selectedCategoryId), movieId);
      setError("Added to watchlist ✅");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Home</h2>

      {isLoggedIn && (
        <div style={{ marginBottom: 12 }}>
          <label>Watchlist category: </label>
          <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
            <option value="">-- select --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {movies.map((m) => (
        <div key={m.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <img alt={m.title} src={m.posterUrl} style={{ width: 80, height: 110, objectFit: "cover" }} />
            <div>
              <h3 style={{ margin: 0 }}>{m.title} ({m.year})</h3>
              <p style={{ margin: "6px 0" }}>Director: {m.director || "-"}</p>

              <button onClick={() => toggleLike(m.id)}>
                {likes.has(m.id) ? "Unlike" : "Like"}
              </button>

              {" "}

              <button onClick={() => addWL(m.id)}>
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
