import { useState } from "react";
import { loginUser, logoutUser } from "../services/api";
import { AuthContext } from "./authContext";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const login = async (credentials) => {
    try {
      const data = await loginUser(credentials);

      setUser(data.user);
      setError("");

      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();

      setUser(null);
      setError("");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        setError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
