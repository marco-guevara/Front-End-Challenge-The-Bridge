import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function Register () {
  const [formData, setFormData] = useState({email: '', name: '', password: '', password2: ''})

  const handleRegister = (e) => {
    e.preventDefault()

    setFormData({email: '', name: '', password: '', password2: ''})
  }

  return (
    <div>
      <form>
        <input type="email" name="email" 
        value={formData.email}
        onChange={(e) => setFormData((prev) => { return {...prev, email: e.target.value}})}/>
        <input type="text" name="name" 
        value={formData.name}
        onChange={(e) => setFormData((prev) => { return {...prev, name: e.target.value}})}/>
        <input type="password" 
        value={formData.password}
        onChange={(e) => setFormData((prev) => { return {...prev, password: e.target.value}})}/>
        <input type="password" 
        value={formData.password2}
        onChange={(e) => setFormData((prev) => { return {...prev, password2: e.target.value}})}/>
        <button type="submit" onClick={(e) => handleRegister(e)}>Register</button>
      </form>
      <Link to='/login'>Login</Link>
    </div>
  )
}

export default Register