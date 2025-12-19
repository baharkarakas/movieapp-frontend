import { useState } from "react";
import { login } from "../api/authApi";

export default function LoginPage({ onAuth }) {
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.token);
      onAuth();
    } catch (e2) {
      setError(e2.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Log in to manage your movie diary</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              required
            />
          </div>

          <button
            type="submit"
            style={isLoading ? {...styles.button, opacity: 0.7} : styles.button}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <span style={styles.link}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f0f", // Dark cinematic background
    backgroundImage: "radial-gradient(circle at 20% 30%, #2c3e50 0%, #000000 100%)",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  loginCard: {
    width: "100%",
    maxWidth: "400px",
    padding: "40px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    color: "#fff",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: 0,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "20px",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#d1d5db",
    marginLeft: "4px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  button: {
    marginTop: "10px",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#e50914", // Netflix Red
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.1s ease, background-color 0.2s ease",
  },
  footerText: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "14px",
    color: "#9ca3af",
  },
  link: {
    color: "#e50914",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },
};