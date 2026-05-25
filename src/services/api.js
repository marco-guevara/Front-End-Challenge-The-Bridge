import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

const request = async (callback) => {
  try {
    const res = await callback()
    return res.data
  } catch (err) {
    const message = err?.response?.data?.message || 'Ha ocurrido un error'
    throw new Error(message, {cause: err})
  }
}

const loginUser = (payload) => request(() => api.post('/auth/login', payload))
const logoutUser = () => request(() => api.post('/auth/logout'))

export {
  loginUser,
  logoutUser,
};
