import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { ErrorBox } from "../components/UI";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user)
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
    );
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Enter your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError("Enter a valid email address");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    if (form.password !== form.confirm)
      return setError("Passwords do not match");
    setBusy(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container page">
      <div className="panel auth-card">
        <h1>Create your account</h1>
        <ErrorBox message={error} />
        <form className="form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
            />
            <span className="hint">At least 6 characters</span>
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={set("confirm")}
            />
          </div>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p style={{ marginTop: "1rem" }} className="muted">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
