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
  const [success, setSuccess] = useState("");

  const token = getToken();
  const isLoggedIn = token && token.startsWith("ey");

  useEffect(() => {
    fetchMovies()
      .then(setMovies)
      .catch((e) => setError("Filmler yüklenirken bir hata oluştu."));
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
      setSuccess("İzleme listesine eklendi! ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError("Eklenirken bir hata oluştu.");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Keşfet</h2>
        {isLoggedIn && (
          <div style={styles.filterContainer}>
            <label style={styles.label}>İzleme Listesi Kategorisi: </label>
            <select
              style={styles.select}
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="">-- Kategori Seç --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {error && <div style={styles.errorBanner} onClick={() => setError("")}>{error}</div>}
      {success && <div style={styles.successBanner}>{success}</div>}

      <div style={styles.movieGrid}>
        {movies.map((m) => (
          <div key={m.id} style={styles.movieCard}>
            <div style={styles.imageWrapper}>
              <img alt={m.title} src={m.posterUrl} style={styles.poster} />
              <button
                onClick={() => toggleLike(m.id)}
                style={{
                    ...styles.likeBadge,
                    backgroundColor: likes.has(m.id) ? "#ff4757" : "rgba(0,0,0,0.5)"
                }}
              >
                {likes.has(m.id) ? "❤️" : "🤍"}
              </button>
            </div>

            <div style={styles.cardContent}>
              <h3 style={styles.movieTitle}>{m.title}</h3>
              <p style={styles.movieInfo}>{m.year} • {m.director || "Bilinmiyor"}</p>

              <button onClick={() => addWL(m.id)} style={styles.addButton}>
                + Listeye Ekle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  title: {
    fontSize: '2rem',
    color: '#2d3436',
    margin: 0
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  select: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #dfe6e9',
    backgroundColor: 'white',
    outline: 'none',
    cursor: 'pointer'
  },
  movieGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '25px'
  },
  movieCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease',
    display: 'flex',
    flexDirection: 'column'
  },
  imageWrapper: {
    position: 'relative',
    height: '320px'
  },
  poster: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  likeBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    border: 'none',
    borderRadius: '50%',
    width: '35px',
    height: '35px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.2s'
  },
  cardContent: {
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  movieTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#2d3436',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  movieInfo: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#636e72'
  },
  addButton: {
    marginTop: '10px',
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0984e3',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  errorBanner: {
    backgroundColor: '#ff7675',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  successBanner: {
    backgroundColor: '#55efc4',
    color: '#00b894',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold'
  }
};