import { useEffect, useState } from "react";
import { fetchCategories, createCategory, deleteCategory } from "../api/categoryApi";
import { fetchWatchlist, deleteWatchlistItem } from "../api/watchlistApi";
import { fetchLikes } from "../api/likeApi";

export default function DashboardPage() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [likes, setLikes] = useState([]);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      setError("");
      setCategories(await fetchCategories());
      setWatchlist(await fetchWatchlist());
      setLikes(await fetchLikes());
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { refresh(); }, []);

  const addCategory = async () => {
    try {
      await createCategory(newCat);
      setNewCat("");
      refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  const delWL = async (id) => {
    await deleteWatchlistItem(id);
    refresh();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <h3>Categories</h3>
      <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category name" />
      <button onClick={addCategory}>Add</button>

      <ul>
        {categories.map((c) => (
          <li key={c.id}>
            {c.name}{" "}
            <button onClick={() => deleteCategory(c.id).then(refresh)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Watchlist Items</h3>
      <ul>
        {watchlist.map((w) => (
          <li key={w.id}>
            [{w.categoryName}] {w.title}{" "}
            <button onClick={() => delWL(w.id)}>Remove</button>
          </li>
        ))}
      </ul>

      <h3>Liked Movies</h3>
      <ul>
        {likes.map((m) => (
          <li key={m.movieId}>{m.title} ({m.year})</li>
        ))}
      </ul>
    </div>
  );
}
