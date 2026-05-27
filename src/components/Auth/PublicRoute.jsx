import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../../context/useAuth";

function PublicRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return <p>Loading session...</p>;
  }

  if (user) {
    return <Navigate replace to="/dashboard" />;
  }

  return <Outlet />;
}

export default PublicRoute;
