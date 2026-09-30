import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import SubNav from "./SubNav";
import { Loader } from "./UI";

// Blocks access unless the user is logged in with one of the allowed roles.
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role)
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
    );
  return (
    <>
      <SubNav role={user.role} />
      <main className="container page">
        <Outlet />
      </main>
    </>
  );
}
