// CollectionDetailPage.js
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCollectionItems } from "../api/categoryApi";

export default function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCollectionItems(id)
      .then((res) => {
        setItems(res);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  return (
    <div style={styles.page}>
      {/* HEADER SECTION */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Back
        </button>
        <div style={styles.titleGroup}>
          <h2 style={styles.title}>Collection Details</h2>
          <p style={styles.subtitle}>
            {items.length} {items.length === 1 ? "Movie" : "Movies"} in this list
          </p>
        </div>
      </div>

      <hr style={styles.divider} />

      {/* FEEDBACK */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.centered}>Loading collection...</div>
      ) : items.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{ fontSize: "40px" }}>🎬</span>
          <p>This collection is currently empty.</p>
        </div>
      ) : (
        /* MOVIE GRID */
        <div style={styles.grid}>
          {items.map((m) => (
            <div key={m.id} style={styles.movieCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.movieTitle}>{m.title}</h3>
                <span style={styles.yearBadge}>{m.year}</span>
              </div>
              <p style={styles.directorText}>
                <span style={{ color: "#95a5a6" }}>Directed by</span>{" "}
                {m.director || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "'Inter', -apple-system, sans-serif",
    color: "#2d3436",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },
  backBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #dfe6e9",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    color: "#636e72",
    transition: "all 0.2s",
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: 0,
    color: "#b2bec3",
    fontSize: "14px",
    fontWeight: "500",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #eee",
    margin: "20px 0 30px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  movieCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #f1f2f6",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "8px",
  },
  movieTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#2d3436",
    lineHeight: "1.3",
  },
  yearBadge: {
    backgroundColor: "#f1f2f6",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#636e72",
  },
  directorText: {
    margin: 0,
    fontSize: "14px",
    color: "#2d3436",
    fontWeight: "500",
  },
  errorBox: {
    padding: "15px",
    backgroundColor: "#fff5f5",
    color: "#c0392b",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #feb2b2",
  },
  centered: {
    textAlign: "center",
    padding: "50px",
    color: "#b2bec3",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "16px",
    color: "#b2bec3",
    border: "2px dashed #eee",
  },
};