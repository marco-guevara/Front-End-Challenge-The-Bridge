import { useState } from "react";
import { loginUser, logoutUser } from "../services/api";
import { AuthContext } from './authContext'

function AuthProvider ({children}) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  const login = async (credentials) => {
    try {
      const data = await loginUser(credentials)
      setError('')
      setUser(data.user)
      return data
    } catch (err) {
      setError(err.message)
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (err) {
      setError(err.message)
      throw error
    }
  }


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
  )
}

export default AuthProvider
