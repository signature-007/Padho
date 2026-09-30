import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { ErrorBox } from "../components/UI";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user)
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
    );

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password)
      return setError("Enter your email and password");
    setBusy(true);
    try {
      const u = await login(form.email.trim(), form.password);
      navigate(
        location.state?.from || (u.role === "admin" ? "/admin" : "/dashboard"),
        { replace: true },
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container page">
      <div className="panel auth-card">
        <h1>Log in</h1>
        <p className="muted">Students and instructors log in here.</p>
        <ErrorBox message={error} />
        <form className="form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p style={{ marginTop: "1rem" }} className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
