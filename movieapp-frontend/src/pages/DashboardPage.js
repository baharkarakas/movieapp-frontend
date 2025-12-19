import { useEffect, useState } from "react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchPublicCollections,
  fetchCollectionItems,
} from "../api/categoryApi";
import { fetchWatchlist, deleteWatchlistItem } from "../api/watchlistApi";
import { fetchLikes } from "../api/likeApi";

export default function DashboardPage() {
  // ... [Logic remains identical to your original code] ...
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPublic, setNewPublic] = useState(false);
  const [selectedMyCollectionId, setSelectedMyCollectionId] = useState("");
  const [myCollectionItems, setMyCollectionItems] = useState([]);
  const [editing, setEditing] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [likes, setLikes] = useState([]);
  const [publicCollections, setPublicCollections] = useState([]);
  const [selectedPublicId, setSelectedPublicId] = useState("");
  const [selectedPublicItems, setSelectedPublicItems] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 2500);
  };

  const isPublicField = (c) => {
    if (typeof c.isPublic === "boolean") return c.isPublic;
    if (typeof c.public === "boolean") return c.public;
    return false;
  };

  const refresh = async () => {
    try {
      setError("");
      const [cats, wl, lk, pubs] = await Promise.all([
        fetchCategories(),
        fetchWatchlist(),
        fetchLikes(),
        fetchPublicCollections(),
      ]);
      setCategories(cats);
      setWatchlist(wl);
      setLikes(lk);
      setPublicCollections(pubs);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (!selectedMyCollectionId) return setMyCollectionItems([]);
    fetchCollectionItems(selectedMyCollectionId).then(setMyCollectionItems).catch((e) => setError(e.message));
  }, [selectedMyCollectionId]);

  useEffect(() => {
    if (!selectedPublicId) return setSelectedPublicItems([]);
    fetchCollectionItems(selectedPublicId).then(setSelectedPublicItems).catch((e) => setError(e.message));
  }, [selectedPublicId]);

  const addCategory = async () => {
    if (!newName.trim()) return setError("Name is required.");
    try {
      await createCategory({ name: newName.trim(), description: newDesc.trim(), isPublic: newPublic });
      setNewName(""); setNewDesc(""); setNewPublic(false);
      toast("Collection created ✅"); refresh();
    } catch (e) { setError(e.message); }
  };

  const removeCategory = async (id) => {
    if (!window.confirm("Delete this collection?")) return;
    try {
      await deleteCategory(id);
      toast("Deleted ✅");
      if (String(selectedMyCollectionId) === String(id)) setSelectedMyCollectionId("");
      refresh();
    } catch (e) { setError(e.message); }
  };

  const startEdit = (c) => setEditing({ [c.id]: { name: c.name, description: c.description, isPublic: isPublicField(c) } });
  const cancelEdit = () => setEditing({});
  const saveEdit = async (id) => {
    try {
      await updateCategory(id, editing[id]);
      cancelEdit(); toast("Updated ✅"); refresh();
    } catch (e) { setError(e.message); }
  };

  const delWL = async (id) => {
    try { await deleteWatchlistItem(id); toast("Removed ✅"); refresh(); } catch (e) { setError(e.message); }
  };

  // --- RENDER ---
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>User Dashboard</h1>
        <div style={styles.stats}>
          <span><b>{categories.length}</b> Collections</span>
          <span><b>{likes.length}</b> Likes</span>
        </div>
      </div>

      {error && <div style={styles.error} onClick={() => setError("")}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.grid}>
        {/* LEFT COLUMN */}
        <div style={styles.column}>
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Create New Collection</h3>
            <div style={styles.form}>
              <input style={styles.input} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Collection Name" />
              <input style={styles.input} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Short Description" />
              <label style={styles.checkboxLabel}>
                <input type="checkbox" checked={newPublic} onChange={(e) => setNewPublic(e.target.checked)} />
                Public Collection
              </label>
              <button style={styles.primaryBtn} onClick={addCategory}>Create</button>
            </div>
          </section>

          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Watchlist</h3>
            <div style={styles.list}>
              {watchlist.map(w => (
                <div key={w.id} style={styles.listItem}>
                  <div>
                    <div style={styles.movieTitle}>{w.title}</div>
                    <div style={styles.meta}>{w.categoryName}</div>
                  </div>
                  <button style={styles.ghostBtnRed} onClick={() => delWL(w.id)}>✕</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={styles.column}>
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>My Collections</h3>
            <div style={styles.list}>
              {categories.map(c => {
                const edit = editing[c.id];
                const isSelected = String(selectedMyCollectionId) === String(c.id);
                return (
                  <div key={c.id} style={{ ...styles.collectionItem, borderLeft: isSelected ? '4px solid #3498db' : '4px solid transparent' }}>
                    {!edit ? (
                      <div style={styles.collectionInfo}>
                        <div style={styles.clickable} onClick={() => setSelectedMyCollectionId(String(c.id))}>
                          <span style={styles.movieTitle}>{c.name} {isPublicField(c) ? "🌍" : "🔒"}</span>
                          <div style={styles.meta}>{c.description || "No description"}</div>
                        </div>
                        <div style={styles.actions}>
                          <button style={styles.smallBtn} onClick={() => startEdit(c)}>Edit</button>
                          <button style={styles.smallBtnRed} onClick={() => removeCategory(c.id)}>Delete</button>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.form}>
                        <input style={styles.input} value={edit.name} onChange={e => setEditing({[c.id]: {...edit, name: e.target.value}})} />
                        <div style={styles.row}>
                          <button style={styles.smallBtn} onClick={() => saveEdit(c.id)}>Save</button>
                          <button style={styles.ghostBtn} onClick={cancelEdit}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {selectedMyCollectionId && (
            <section style={{...styles.card, border: '1px solid #3498db'}}>
              <h4 style={styles.cardTitle}>Items in Collection</h4>
              <div style={styles.list}>
                {myCollectionItems.length === 0 && <p style={styles.meta}>No movies added yet.</p>}
                {myCollectionItems.map(m => (
                  <div key={m.id} style={styles.movieInline}>
                    🎬 <b>{m.title}</b> <span style={styles.meta}>({m.year})</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Explore Public</h3>
            <div style={styles.row}>
              <select style={styles.select} value={selectedPublicId} onChange={(e) => setSelectedPublicId(e.target.value)}>
                <option value="">-- Choose a collection --</option>
                {publicCollections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button style={styles.smallBtn} onClick={refresh}>↻</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "40px 20px", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', Roboto, sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "15px" },
  title: { margin: 0, color: "#2c3e50", fontSize: "28px" },
  stats: { display: "flex", gap: "20px", color: "#7f8c8d" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "25px" },
  column: { display: "flex", flexDirection: "column", gap: "25px" },
  card: { backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" },
  cardTitle: { marginTop: 0, marginBottom: "20px", fontSize: "18px", color: "#34495e", borderLeft: "4px solid #3498db", paddingLeft: "10px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
  select: { flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ddd" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#7f8c8d" },
  primaryBtn: { padding: "12px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
  smallBtn: { padding: "5px 10px", backgroundColor: "#ecf0f1", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", color: "#2c3e50" },
  smallBtnRed: { padding: "5px 10px", backgroundColor: "#fadbd8", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", color: "#e74c3c" },
  ghostBtn: { background: "none", border: "none", color: "#95a5a6", cursor: "pointer", fontSize: "12px" },
  ghostBtnRed: { background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: "16px" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#fdfdfd", borderBottom: "1px solid #eee" },
  collectionItem: { padding: "10px", backgroundColor: "#fdfdfd", borderRadius: "8px", transition: "all 0.2s" },
  collectionInfo: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  movieTitle: { fontWeight: "bold", fontSize: "15px", color: "#2c3e50" },
  meta: { fontSize: "12px", color: "#95a5a6", marginTop: "2px" },
  clickable: { cursor: "pointer", flex: 1 },
  actions: { display: "flex", gap: "5px" },
  row: { display: "flex", gap: "10px", alignItems: "center" },
  movieInline: { padding: "8px 0", borderBottom: "1px solid #f1f1f1", fontSize: "14px" },
  error: { backgroundColor: "#fadbd8", color: "#e74c3c", padding: "12px", borderRadius: "8px", marginBottom: "20px", cursor: "pointer" },
  success: { backgroundColor: "#d4efdf", color: "#27ae60", padding: "12px", borderRadius: "8px", marginBottom: "20px" },
};