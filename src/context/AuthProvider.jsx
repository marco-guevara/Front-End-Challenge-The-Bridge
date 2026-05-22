import { useState } from "react";
import { loginUser, logoutUser, registerUser } from "../services/api";
import { AuthContext } from './authContext'

function AuthProvider ({children}) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  // const refreshSession = async () => {
  //   try {
  //     const data = await 
  //   } catch (err) {

  //   }
  // }

  const login = async (credentials) => {
    try {
      const data = await loginUser(credentials)
      setError('')
      setUser(data.user)
      return data
    } catch (err) {
      setError(err.message)
      // throw error
    }
  }

  const register = async (credentials) => {
    try {
      const data = await registerUser(credentials)
      setError('')
      return data
    } catch (err) {
      setError(err.message)
      throw error
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
        register,
        // changePassword,
        logout,
        // refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider