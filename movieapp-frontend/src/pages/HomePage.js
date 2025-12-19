import { useEffect, useMemo, useState } from "react";
import { fetchMovies, createMovie, updateMovie, deleteMovie } from "../api/movieApi";
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
  const [success, setSuccess] = useState("");

  // ✅ Add movie form
  const [newMovie, setNewMovie] = useState({
    title: "",
    director: "",
    year: "",
    posterUrl: "",
  });

  // ✅ Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    title: "",
    director: "",
    year: "",
    posterUrl: "",
  });

  const token = getToken();
  const isLoggedIn = useMemo(() => token && token.startsWith("ey"), [token]);

  const loadAll = async () => {
    setError("");
    try {
      const list = await fetchMovies();
      setMovies(list);
    } catch (e) {
      // In diary mode, /api/movies requires auth
      setMovies([]);
      setError("Filmleri görmek için giriş yapmalısınız.");
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    fetchLikes()
      .then((arr) => setLikes(new Set(arr.map((x) => x.movieId))))
      .catch(() => {});

    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, [isLoggedIn]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 2500);
  };

  // ❤️ like/unlike (same)
  const toggleLike = async (movieId) => {
    if (!isLoggedIn) {
      setError("Beğenmek için giriş yapmalısınız.");
      return;
    }
    try {
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
      setError("İşlem başarısız oldu.");
    }
  };

  // ➕ watchlist (same)
  const addWL = async (movieId) => {
    if (!isLoggedIn) {
      setError("Listeye eklemek için giriş yapmalısınız.");
      return;
    }
    if (!selectedCategoryId) {
      setError("Lütfen önce bir kategori seçin.");
      return;
    }
    try {
      await addToWatchlist(Number(selectedCategoryId), movieId);
      showSuccess("İzleme listesine eklendi! ✅");
    } catch (e) {
      setError("Eklenirken bir hata oluştu.");
    }
  };

  // ✅ CREATE movie
  const submitNewMovie = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLoggedIn) {
      setError("Film eklemek için giriş yapmalısınız.");
      return;
    }

    if (!newMovie.title.trim()) {
      setError("Başlık (title) boş olamaz.");
      return;
    }
    if (!newMovie.year || isNaN(Number(newMovie.year))) {
      setError("Yıl (year) sayısal olmalı.");
      return;
    }

    try {
      await createMovie({
        title: newMovie.title.trim(),
        director: newMovie.director.trim(),
        year: Number(newMovie.year),
        posterUrl: newMovie.posterUrl.trim(),
      });

      setNewMovie({ title: "", director: "", year: "", posterUrl: "" });
      showSuccess("Film eklendi ✅");
      await loadAll();
    } catch (e2) {
      setError(e2.message || "Film eklenemedi.");
    }
  };

  // ✅ START EDIT
  const startEdit = (m) => {
    setEditingId(m.id);
    setEditDraft({
      title: m.title || "",
      director: m.director || "",
      year: m.year ?? "",
      posterUrl: m.posterUrl || "",
    });
    setError("");
  };

  // ✅ CANCEL EDIT
  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ title: "", director: "", year: "", posterUrl: "" });
  };

  // ✅ SAVE EDIT
  const saveEdit = async (id) => {
    setError("");

    if (!editDraft.title.trim()) {
      setError("Başlık (title) boş olamaz.");
      return;
    }
    if (!editDraft.year || isNaN(Number(editDraft.year))) {
      setError("Yıl (year) sayısal olmalı.");
      return;
    }

    try {
      await updateMovie(id, {
        title: editDraft.title.trim(),
        director: editDraft.director.trim(),
        year: Number(editDraft.year),
        posterUrl: editDraft.posterUrl.trim(),
      });

      showSuccess("Film güncellendi ✅");
      cancelEdit();
      await loadAll();
    } catch (e2) {
      setError(e2.message || "Güncelleme başarısız.");
    }
  };

  // ✅ DELETE
  const removeMovie = async (id) => {
    setError("");
    if (!window.confirm("Bu filmi silmek istiyor musunuz?")) return;

    try {
      await deleteMovie(id);
      showSuccess("Film silindi ✅");

      // also remove like from UI state if it existed
      const next = new Set(likes);
      next.delete(id);
      setLikes(next);

      await loadAll();
    } catch (e2) {
      setError(e2.message || "Silme başarısız.");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Movie Diary</h2>
          <p style={styles.subtitle}>
            {isLoggedIn ? "Kendi film arşivin (CRUD + Like + Watchlist)" : "Giriş yaparak filmlerini gör / ekle."}
          </p>
        </div>

        {isLoggedIn && (
          <div style={styles.filterContainer}>
            <label style={styles.label}>İzleme Listesi Kategorisi:</label>
            <select
              style={styles.select}
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="">-- Kategori Seç --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {error && (
        <div style={styles.errorBanner} onClick={() => setError("")}>
          {error}
        </div>
      )}
      {success && <div style={styles.successBanner}>{success}</div>}

      {/* ✅ Add Movie Form */}
      <section style={styles.formCard}>
        <h3 style={styles.sectionTitle}>Yeni Film Ekle</h3>

        {!isLoggedIn ? (
          <div style={styles.notice}>Film eklemek için önce giriş yap.</div>
        ) : (
          <form onSubmit={submitNewMovie} style={styles.formGrid}>
            <input
              style={styles.input}
              value={newMovie.title}
              onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
              placeholder="Title (zorunlu)"
            />
            <input
              style={styles.input}
              value={newMovie.director}
              onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
              placeholder="Director"
            />
            <input
              style={styles.input}
              value={newMovie.year}
              onChange={(e) => setNewMovie({ ...newMovie, year: e.target.value })}
              placeholder="Year (örn. 2024)"
            />
            <input
              style={styles.input}
              value={newMovie.posterUrl}
              onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
              placeholder="Poster URL"
            />
            <button type="submit" style={styles.primaryButton}>
              + Add
            </button>
          </form>
        )}
      </section>

      {/* Movies */}
      <div style={styles.movieGrid}>
        {movies.map((m) => {
          const isEditing = editingId === m.id;

          return (
            <div key={m.id} style={styles.movieCard}>
              <div style={styles.imageWrapper}>
                <img
                  alt={m.title}
                  src={m.posterUrl || "https://via.placeholder.com/400x600?text=No+Poster"}
                  style={styles.poster}
                />

                <button
                  onClick={() => toggleLike(m.id)}
                  style={{
                    ...styles.likeBadge,
                    backgroundColor: likes.has(m.id) ? "#ff4757" : "rgba(0,0,0,0.5)",
                  }}
                  title="Like"
                >
                  {likes.has(m.id) ? "❤️" : "🤍"}
                </button>
              </div>

              <div style={styles.cardContent}>
                {!isEditing ? (
                  <>
                    <h3 style={styles.movieTitle}>{m.title}</h3>
                    <p style={styles.movieInfo}>
                      {m.year} • {m.director || "Bilinmiyor"}
                    </p>

                    <div style={styles.row}>
                      <button onClick={() => addWL(m.id)} style={styles.addButton}>
                        + Watchlist
                      </button>

                      {isLoggedIn && (
                        <button onClick={() => startEdit(m)} style={styles.secondaryButton}>
                          Edit
                        </button>
                      )}
                    </div>

                    {isLoggedIn && (
                      <button onClick={() => removeMovie(m.id)} style={styles.dangerButton}>
                        Delete
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <h3 style={styles.movieTitle}>Edit Movie</h3>
                    <input
                      style={styles.input}
                      value={editDraft.title}
                      onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                      placeholder="Title"
                    />
                    <input
                      style={styles.input}
                      value={editDraft.director}
                      onChange={(e) => setEditDraft({ ...editDraft, director: e.target.value })}
                      placeholder="Director"
                    />
                    <input
                      style={styles.input}
                      value={editDraft.year}
                      onChange={(e) => setEditDraft({ ...editDraft, year: e.target.value })}
                      placeholder="Year"
                    />
                    <input
                      style={styles.input}
                      value={editDraft.posterUrl}
                      onChange={(e) => setEditDraft({ ...editDraft, posterUrl: e.target.value })}
                      placeholder="Poster URL"
                    />

                    <div style={styles.row}>
                      <button onClick={() => saveEdit(m.id)} style={styles.primaryButton}>
                        Save
                      </button>
                      <button onClick={cancelEdit} style={styles.secondaryButton}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "20px",
  },
  title: { fontSize: "2rem", color: "#2d3436", margin: 0 },
  subtitle: { margin: "6px 0 0", color: "#636e72" },

  filterContainer: { display: "flex", alignItems: "center", gap: "10px" },
  label: { color: "#2d3436", fontWeight: 600 },
  select: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #dfe6e9",
    backgroundColor: "white",
    outline: "none",
    cursor: "pointer",
  },

  errorBanner: {
    backgroundColor: "#ff7675",
    color: "white",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    textAlign: "center",
    cursor: "pointer",
  },
  successBanner: {
    backgroundColor: "#55efc4",
    color: "#006d55",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    textAlign: "center",
    fontWeight: "bold",
  },

  formCard: {
    backgroundColor: "white",
    borderRadius: "14px",
    padding: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    marginBottom: "22px",
  },
  sectionTitle: { margin: "0 0 12px", color: "#2d3436" },
  notice: {
    padding: "10px 12px",
    backgroundColor: "#f1f2f6",
    borderRadius: "10px",
    color: "#2d3436",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #dfe6e9",
    outline: "none",
  },

  movieGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "22px",
  },
  movieCard: {
    backgroundColor: "white",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  imageWrapper: { position: "relative", height: "320px" },
  poster: { width: "100%", height: "100%", objectFit: "cover" },
  likeBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    border: "none",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    backdropFilter: "blur(5px)",
  },

  cardContent: { padding: "14px", display: "flex", flexDirection: "column", gap: "8px" },
  movieTitle: {
    margin: 0,
    fontSize: "1.05rem",
    color: "#2d3436",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  movieInfo: { margin: 0, fontSize: "0.9rem", color: "#636e72" },

  row: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },

  addButton: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#0984e3",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryButton: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#00b894",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #dfe6e9",
    backgroundColor: "white",
    color: "#2d3436",
    fontWeight: 700,
    cursor: "pointer",
  },
  dangerButton: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#d63031",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "6px",
  },
};
