import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "./Spinner.jsx";

function FullScreenLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner className="h-8 w-8 text-indigo-600" />
    </div>
  );
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
