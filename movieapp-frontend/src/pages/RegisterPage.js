import { useState } from "react";
import { register } from "../api/authApi";

export default function RegisterPage({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await register(email, password);
      localStorage.setItem("token", res.token);
      onAuth();
    } catch (e2) {
      setError(e2.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <form onSubmit={submit}>
        <div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        </div>
        <div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
