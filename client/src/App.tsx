import type { ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dasboard";
import AddStock from "./pages/AddStock";
import AddPHC from "./pages/AddPHC";
import AddAttendance from "./pages/AddAttendance";
import ProtectedRoute from "./components/ProtectedRoutes";

const adminOnly = (page: ReactNode) => (
  <ProtectedRoute requiredRole="regional_admin">{page}</ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/add-stock" element={adminOnly(<AddStock />)} />
      <Route path="/add-phc" element={adminOnly(<AddPHC />)} />
      <Route path="/add-attendance" element={adminOnly(<AddAttendance />)} />
    </Routes>
  );
}