import { useState } from "react";
import { register } from "../api/authApi";
import { useNavigate } from "react-router-dom"; // Added for navigation if needed

export default function RegisterPage({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await register(email, password);
      localStorage.setItem("token", res.token);
      onAuth();
    } catch (e2) {
      setError(e2.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Join the Diary</h2>
          <p style={styles.subtitle}>Create an account to start your collection</p>
        </div>

        {error && (
          <div style={styles.errorBox} onClick={() => setError("")}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              type="password"
              required
            />
          </div>

          <button
            type="submit"
            style={loading ? { ...styles.button, opacity: 0.6 } : styles.button}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <a href="/login" style={styles.link}>Login here</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f0f",
    backgroundImage: "radial-gradient(circle at top right, #1a1a1a, #000)",
    fontFamily: "'Inter', sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    padding: "40px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 8px 0",
    letterSpacing: "-1px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#888",
    margin: 0,
  },
  errorBox: {
    backgroundColor: "rgba(255, 71, 87, 0.1)",
    color: "#ff4757",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "14px",
    textAlign: "center",
    border: "1px solid rgba(255, 71, 87, 0.2)",
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#aaa",
    marginLeft: "4px",
  },
  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "#fff",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    marginTop: "10px",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#00b894", // Fresh green for "Register"
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "14px",
    color: "#666",
  },
  link: {
    color: "#00b894",
    textDecoration: "none",
    fontWeight: "600",
  },
};