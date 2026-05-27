import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../../context/useAuth";
import { LoadingSession } from "./AuthShell";

function ProtectedRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return <LoadingSession />;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
