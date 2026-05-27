import { Route, Routes } from "react-router-dom";

import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import Transactions from "./components/Transactions/Transactions";
import Clients from "./components/Clients/Clients";
import ClientDetail from "./components/Clients/ClientDetail";
import Transaction from "./components/Transaction/Transaction"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/transaction" element={<Transaction/>}/>
      <Route path="/clients" element={<Clients />} />
      <Route path="/clients/:id" element={<ClientDetail />} />
    </Routes>
  );
}

export default App;
