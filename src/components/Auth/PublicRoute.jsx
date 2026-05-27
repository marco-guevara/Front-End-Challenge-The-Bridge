import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../../context/useAuth";
import { LoadingSession } from "./AuthShell";

function PublicRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return <LoadingSession />;
  }

  if (user) {
    return <Navigate replace to="/dashboard" />;
  }

  return <Outlet />;
}

export default PublicRoute;
