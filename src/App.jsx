import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import Transactions from "./components/Transactions/Transactions";
import TransactionDetail from "./components/Transactions/TransactionDetail";
import Clients from "./components/Clients/Clients";
import ClientDetail from "./components/Clients/ClientDetail";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicRoute from "./components/Auth/PublicRoute";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence initial={false} mode="wait">
      <Routes key={location.pathname} location={location}>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
        </Route>

        <Route path="*" element={<Navigate replace to="/dashboard" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
