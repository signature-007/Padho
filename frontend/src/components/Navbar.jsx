import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);
  const home = user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/";

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          Padho
        </Link>
        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" end onClick={close}>
            Home
          </NavLink>
          <NavLink to="/courses" onClick={close}>
            Courses
          </NavLink>
          <NavLink to="/about" onClick={close}>
            About
          </NavLink>
          {user ? (
            <>
              <NavLink to={home} onClick={close}>
                {user.role === "admin" ? "Admin" : "My learning"}
              </NavLink>
              {user.role === "student" && (
                <NavLink to="/profile" onClick={close}>
                  Profile
                </NavLink>
              )}
              <button
                className="btn btn-light btn-sm"
                onClick={() => {
                  logout();
                  close();
                  navigate("/");
                }}
              >
                Log out ({user.name.split(" ")[0]})
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>
                Log in
              </NavLink>
              <Link
                to="/register"
                className="btn btn-accent btn-sm"
                onClick={close}
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
