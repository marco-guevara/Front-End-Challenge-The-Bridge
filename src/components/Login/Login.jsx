import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function Login () {
  const [formData, setFormData] = useState({email: '', password: ''})


  const handleLogin = (e) => {
    e.preventDefault()
    
    setFormData({email: '', password: ''})
  }

  return (
    <div>
      <form>
        <input type="email" 
        value={formData.email}
        onChange={(e) => setFormData((prev) => { return {...prev, email: e.target.value}})}/>
        <input type="password" 
        value={formData.password}
        onChange={(e) => setFormData((prev) => { return {...prev, password: e.target.value}})}/>
        <button type="submit" onClick={(e) => handleLogin(e)}>Login</button>
      </form>
      <Link to='/register'>Register</Link>
    </div>
  )
}

export default Login