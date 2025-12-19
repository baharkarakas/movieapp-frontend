import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { getToken } from "./api/http";
import { me } from "./api/authApi";

// --- PRETTY NAVBAR ---
function Navbar({ authed, onLogout }) {
  // Utility for active link styling
  const activeStyle = ({ isActive }) => ({
    ...styles.navLink,
    color: isActive ? "#e50914" : "#fff",
    borderBottom: isActive ? "2px solid #e50914" : "2px solid transparent",
  });

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>
        <div style={styles.brandGroup}>
          <NavLink to="/" style={{ textDecoration: 'none' }}>
            <h1 style={styles.logo}>MOVIE<span style={{ color: '#e50914' }}>DIARY</span></h1>
          </NavLink>
          <a
            href="http://localhost:8080/how-to-use"
            target="_blank"
            rel="noreferrer"
            style={styles.externalLink}
          >
            Docs ↗
          </a>
        </div>

        <div style={styles.navLinks}>
          <NavLink to="/" style={activeStyle}>Home</NavLink>

          {authed ? (
            <>
              <NavLink to="/dashboard" style={activeStyle}>Dashboard</NavLink>
              <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" style={activeStyle}>Login</NavLink>
              <NavLink to="/register" style={styles.registerCta}>Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AppInner() {
  const [authed, setAuthed] = useState(!!getToken());
  const navigate = useNavigate();

  const refreshAuth = async () => {
    const token = getToken();
    if (!token) {
      setAuthed(false);
      return;
    }
    try {
      await me();
      setAuthed(true);
      // Only navigate to dashboard if on login/register pages
      if (window.location.pathname === "/login" || window.location.pathname === "/register") {
        navigate("/dashboard");
      }
    } catch {
      localStorage.removeItem("token");
      setAuthed(false);
    }
  };

  useEffect(() => { refreshAuth(); }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setAuthed(false);
    navigate("/");
  };

  return (
    <div style={styles.appWrapper}>
      <Navbar authed={authed} onLogout={logout} />
      <div style={styles.contentArea}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onAuth={refreshAuth} />} />
          <Route path="/register" element={<RegisterPage onAuth={refreshAuth} />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

// --- STYLES ---
const styles = {
  appWrapper: {
    backgroundColor: "#0f0f0f", // Matches your other pages
    minHeight: "100vh",
    color: "#fff",
  },
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "70px",
    backgroundColor: "rgba(15, 15, 15, 0.8)",
    backdropFilter: "blur(15px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
  },
  navContainer: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandGroup: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "900",
    margin: 0,
    color: "#fff",
    letterSpacing: "-1px",
  },
  externalLink: {
    fontSize: "13px",
    color: "#666",
    textDecoration: "none",
    border: "1px solid #333",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
  },
  navLink: {
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    padding: "5px 0",
    transition: "color 0.2s ease",
  },
  registerCta: {
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "700",
    backgroundColor: "#e50914",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "8px",
  },
  logoutBtn: {
    background: "none",
    border: "1px solid #444",
    color: "#eee",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  contentArea: {
    paddingTop: "70px", // Pushes content below the fixed navbar
  }
};