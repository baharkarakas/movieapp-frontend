import { useEffect, useMemo, useState } from "react";
import { fetchMovies, createMovie, updateMovie, deleteMovie } from "../api/movieApi";
import { likeMovie, unlikeMovie, fetchLikes } from "../api/likeApi";
import { fetchCategories } from "../api/categoryApi";
import { addToWatchlist } from "../api/watchlistApi";
import { getToken } from "../api/http";
import { externalSearch, importFromOmdb } from "../api/externalApi";

export default function HomePage() {
  // --- 1. AUTH & DATA LOGIC (The missing part) ---
  const token = getToken();
  const isLoggedIn = useMemo(() => token && token.startsWith("ey"), [token]);

  const [movies, setMovies] = useState([]);
  const [likes, setLikes] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newMovie, setNewMovie] = useState({ title: "", director: "", year: "", posterUrl: "" });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: "", director: "", year: "", posterUrl: "" });

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // --- 2. HELPER FUNCTIONS ---
  const toast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 2500);
  };
  const clearError = () => setError("");

  const loadMovies = async () => {
    setError("");
    try {
      const list = await fetchMovies();
      setMovies(Array.isArray(list) ? list : []);
    } catch (e) {
      setMovies([]);
      if (isLoggedIn) setError(e?.message || "Filmler yüklenemedi.");
    }
  };

  const loadExtras = async () => {
    if (!isLoggedIn) return;
    try {
      const [lk, cats] = await Promise.all([fetchLikes(), fetchCategories()]);
      setLikes(new Set((lk || []).map((x) => x.movieId)));
      setCategories(Array.isArray(cats) ? cats : []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadMovies();
    loadExtras();
  }, [isLoggedIn]);

  // --- 3. CRUD & ACTIONS ---
  const submitNewMovie = async (e) => {
    e.preventDefault();
    if (!newMovie.title.trim()) return setError("Title is required.");
    try {
      await createMovie({ ...newMovie, year: Number(newMovie.year) });
      setNewMovie({ title: "", director: "", year: "", posterUrl: "" });
      toast("Movie added! ✅");
      loadMovies();
    } catch (e) { setError(e.message); }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditDraft({ title: m.title, director: m.director, year: m.year, posterUrl: m.posterUrl });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id) => {
    try {
      await updateMovie(id, { ...editDraft, year: Number(editDraft.year) });
      toast("Updated! ✅");
      setEditingId(null);
      loadMovies();
    } catch (e) { setError(e.message); }
  };

  const removeMovie = async (id) => {
    if (!window.confirm("Delete this movie?")) return;
    try {
      await deleteMovie(id);
      toast("Deleted! ✅");
      loadMovies();
    } catch (e) { setError(e.message); }
  };

  const toggleLike = async (movieId) => {
    if (!isLoggedIn) return setError("Please login to like.");
    try {
      if (likes.has(movieId)) {
        await unlikeMovie(movieId);
        setLikes(prev => { const n = new Set(prev); n.delete(movieId); return n; });
      } else {
        await likeMovie(movieId);
        setLikes(prev => { const n = new Set(prev); n.add(movieId); return n; });
      }
    } catch { setError("Action failed."); }
  };

  const addWL = async (movieId) => {
    if (!selectedCategoryId) return setError("Select a category first.");
    try {
      await addToWatchlist(Number(selectedCategoryId), movieId);
      toast("Added to watchlist! ✅");
    } catch { setError("Failed to add."); }
  };

  const runSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const res = await externalSearch(searchQuery);
      setSearchResults(res || []);
    } catch { setError("Search failed."); }
    finally { setSearching(false); }
  };

  const importMovie = async (imdbId) => {
    try {
      await importFromOmdb(imdbId);
      toast("Imported! ✅");
      loadMovies();
    } catch { setError("Import failed."); }
  };

  // --- 4. PRETTY RENDER ---
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.brand}>MOVIE<span style={{color: '#e50914'}}>DIARY</span></h1>
            <p style={styles.subtitle}>
              {isLoggedIn ? "Your cinematic collection." : "Sign in to curate your archive."}
            </p>
          </div>

          {isLoggedIn && (
            <div style={styles.categoryPicker}>
              <span style={styles.label}>Add to List:</span>
              <select
                style={styles.select}
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </header>

        {error && <div style={styles.errorBanner} onClick={clearError}>{error}</div>}
        {success && <div style={styles.successBanner}>{success}</div>}

        <div style={styles.mainLayout}>
          <aside style={styles.sidebar}>
            <section style={styles.glassCard}>
              <h3 style={styles.sectionTitle}>Quick Add</h3>
              {!isLoggedIn ? <p style={{color: '#888'}}>Login to add movies</p> : (
                <form onSubmit={submitNewMovie} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  <input style={styles.input} value={newMovie.title} onChange={(e) => setNewMovie({...newMovie, title: e.target.value})} placeholder="Title" />
                  <input style={styles.input} value={newMovie.director} onChange={(e) => setNewMovie({...newMovie, director: e.target.value})} placeholder="Director" />
                  <input style={styles.input} value={newMovie.year} onChange={(e) => setNewMovie({...newMovie, year: e.target.value})} placeholder="Year" />
                  <input style={styles.input} value={newMovie.posterUrl} onChange={(e) => setNewMovie({...newMovie, posterUrl: e.target.value})} placeholder="Poster URL" />
                  <button type="submit" style={styles.primaryButton}>Add Movie</button>
                </form>
              )}
            </section>

            <section style={styles.glassCard}>
              <h3 style={styles.sectionTitle}>Global Search</h3>
              <div style={{display: 'flex', gap: '5px'}}>
                <input style={styles.input} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search OMDb..." />
                <button onClick={runSearch} style={styles.primaryButton} disabled={searching}>{searching ? "..." : "🔍"}</button>
              </div>
              {searchResults.slice(0, 3).map(r => (
                <div key={r.imdbID} style={{display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center'}}>
                  <img src={r.Poster} style={{width: '40px', borderRadius: '4px'}} alt="" />
                  <div style={{flex: 1, fontSize: '0.8rem'}}>{r.Title}</div>
                  <button onClick={() => importMovie(r.imdbID)} style={styles.importBtn}>Import</button>
                </div>
              ))}
            </section>
          </aside>

          <main style={styles.movieGrid}>
            {movies.map((m) => {
              const isEditing = editingId === m.id;
              return (
                <div key={m.id} style={styles.movieCard}>
                  <div style={styles.posterContainer}>
                    <img alt={m.title} src={m.posterUrl || "https://via.placeholder.com/400x600?text=No+Poster"} style={styles.poster} />
                    <button onClick={() => toggleLike(m.id)} style={styles.likeIcon}>
                        {likes.has(m.id) ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div style={styles.cardInfo}>
                    {!isEditing ? (
                      <>
                        <h4 style={styles.mTitle}>{m.title}</h4>
                        <p style={styles.mMeta}>{m.year} • {m.director}</p>
                        <button onClick={() => addWL(m.id)} style={styles.wlBtn}>+ Watchlist</button>
                        <div style={{marginTop: '8px'}}>
                           <span onClick={() => startEdit(m)} style={styles.textLink}>Edit</span>
                           <span onClick={() => removeMovie(m.id)} style={{...styles.textLink, color: '#ff4d4d'}}>Delete</span>
                        </div>
                      </>
                    ) : (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <input style={styles.input} value={editDraft.title} onChange={(e) => setEditDraft({...editDraft, title: e.target.value})} />
                        <button onClick={() => saveEdit(m.id)} style={styles.primaryButton}>Save</button>
                        <button onClick={cancelEdit} style={{background: 'none', color: '#fff', border: 'none', cursor: 'pointer'}}>Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </main>
        </div>
      </div>
    </div>
  );
}

// --- 5. STYLES ---
const styles = {
  pageWrapper: { minHeight: "100vh", backgroundColor: "#0f0f0f", color: "#fff", fontFamily: 'Inter, sans-serif' },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "40px" },
  brand: { fontSize: "2rem", fontWeight: "900" },
  subtitle: { color: "#888" },
  mainLayout: { display: "grid", gridTemplateColumns: "300px 1fr", gap: "30px" },
  glassCard: { background: "rgba(255,255,255,0.05)", borderRadius: "15px", padding: "20px", marginBottom: "20px" },
  input: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #333", background: "#000", color: "#fff" },
  primaryButton: { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#e50914", color: "#fff", cursor: "pointer" },
  movieGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" },
  movieCard: { background: "#1a1a1a", borderRadius: "10px", overflow: "hidden" },
  posterContainer: { position: "relative", width: "100%", paddingTop: "150%" },
  poster: { position: "absolute", top: 0, width: "100%", height: "100%", objectFit: "cover" },
  likeIcon: { position: "absolute", top: "10px", right: "10px", background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" },
  cardInfo: { padding: "12px" },
  mTitle: { margin: "0 0 5px", fontSize: "0.95rem" },
  mMeta: { fontSize: "0.8rem", color: "#888" },
  wlBtn: { width: "100%", marginTop: "10px", padding: "6px", background: "#333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  textLink: { fontSize: "0.75rem", marginRight: "10px", cursor: "pointer", textDecoration: "underline" },
  importBtn: { padding: "4px 8px", background: "#00b894", border: "none", borderRadius: "4px", color: "#fff", fontSize: "0.7rem" },
  errorBanner: { background: "#ff4d4d", padding: "10px", borderRadius: "8px", marginBottom: "15px" },
  successBanner: { background: "#00b894", padding: "10px", borderRadius: "8px", marginBottom: "15px" },
};