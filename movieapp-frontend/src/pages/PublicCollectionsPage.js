// PublicCollectionsPage.js
import { useEffect, useState } from "react";
import { fetchPublicCollections } from "../api/categoryApi";
import { Link } from "react-router-dom";

export default function PublicCollectionsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicCollections()
      .then((res) => {
        setItems(res);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h2 style={styles.title}>Community Collections</h2>
        <p style={styles.subtitle}>Explore curated movie lists from other film enthusiasts.</p>
      </header>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {loading ? (
        <div style={styles.loader}>Loading curated lists...</div>
      ) : (
        <div style={styles.grid}>
          {items.map((c) => (
            <div key={c.id} style={styles.card}>
              <div style={styles.iconArea}>📂</div>
              <div style={styles.cardContent}>
                <h3 style={styles.collectionName}>{c.name}</h3>
                <p style={styles.description}>
                  {c.description || "No description provided for this collection."}
                </p>
                <Link to={`/collections/${c.id}`} style={styles.exploreBtn}>
                  View Collection
                  <span style={{marginLeft: '8px'}}>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div style={styles.empty}>No public collections found.</div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "'Inter', sans-serif",
    minHeight: "100vh",
    backgroundColor: "#fcfcfc",
  },
  header: {
    marginBottom: "40px",
    textAlign: "center",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1a1a1a",
    margin: "0 0 10px 0",
    letterSpacing: "-1px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#636e72",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #edf2f7",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
    display: "flex",
    gap: "20px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
    alignItems: "flex-start",
  },
  iconArea: {
    fontSize: "32px",
    background: "#f7f9fc",
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  collectionName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#2d3436",
    margin: "0 0 8px 0",
  },
  description: {
    fontSize: "14px",
    color: "#636e72",
    lineHeight: "1.5",
    margin: "0 0 16px 0",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  exploreBtn: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0984e3",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    marginTop: "auto",
  },
  errorBanner: {
    padding: "16px",
    backgroundColor: "#fff5f5",
    color: "#c0392b",
    borderRadius: "12px",
    marginBottom: "30px",
    border: "1px solid #feb2b2",
    textAlign: "center",
  },
  loader: {
    textAlign: "center",
    padding: "100px",
    color: "#b2bec3",
    fontSize: "18px",
  },
  empty: {
    textAlign: "center",
    padding: "100px",
    color: "#b2bec3",
  },
};