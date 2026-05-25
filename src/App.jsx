import { Route, Routes } from "react-router-dom"

import Login from "./components/Login/Login"
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  return (
  <>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
    </Routes>
  </>
  )
}

export default App
