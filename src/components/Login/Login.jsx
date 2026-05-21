import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", formData);
      setSuccess(response.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
      setSuccess("");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit">Login</button>
      </form>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
      
      <Link to="/register">Register</Link>
    </div>
  );
}

export default Login;
