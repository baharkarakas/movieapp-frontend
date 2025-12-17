import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { getToken } from "./api/http";
import { me } from "./api/authApi";

function Navbar({ authed, onLogout }) {
  return (
    <div style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", gap: 12 }}>
      <Link to="/">Home</Link>
      <a href="http://localhost:8080/how-to-use" target="_blank" rel="noreferrer">How to use (Thymeleaf)</a>
      {authed ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <button onClick={onLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </div>
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
      await me(); // verify token
      setAuthed(true);
      navigate("/dashboard");
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
    <>
      <Navbar authed={authed} onLogout={logout} />
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
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
