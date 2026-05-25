import { useContext } from "react";
import { AuthContext } from "./authContext";

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}

export default useAuth;
