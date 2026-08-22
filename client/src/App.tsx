import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dasboard"
import AddStock from "./pages/AddStock"
import ProtectedRoute from "./components/ProtectedRoutes"
import AddPHC from "./pages/AddPHC"


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-stock"
        element={
          <ProtectedRoute requiredRole="regional_admin">
            <AddStock />
          </ProtectedRoute>
        }
      />
      <Route
  path="/add-phc"
  element={
    <ProtectedRoute requiredRole="regional_admin">
      <AddPHC />
    </ProtectedRoute>
  }
/>
      <Route path="/" element={<Login />} />
    </Routes>
  )
}

export default App