import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../../context/useAuth";

function ProtectedRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return <p>Loading session...</p>;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
