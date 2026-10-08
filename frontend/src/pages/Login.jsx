import { secureFetch } from "../services/api";
import { useState } from "react";

function Login({ onNavigate, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await secureFetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (response.ok) {
        setPassword("");
        onLogin(email);
      } else {
        setMessage("Invalid email or password.");
      }
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">

        <h2>Welcome Back</h2>
        <p>Login to your JENSENOnline account.</p>

        <form onSubmit={handleLogin}>

          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {message && <p role="status">{message}</p>}

        <p>
          Don't have an account?{" "}
          <button
            type="button"
            className="auth-link"
            onClick={() => onNavigate("register")}
          >
            Register here
          </button>
        </p>

      </div>
    </section>
  );
}

export default Login;
