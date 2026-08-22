import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dasboard"
import AddStock from "./pages/AddStock"
import ProtectedRoute from "./components/ProtectedRoutes"
import AddPHC from "./pages/AddPHC"
import AddAttendance from "./pages/AddAttendance"

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
          <ProtectedRoute>
            <AddStock />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-phc"
        element={
          <ProtectedRoute>
            <AddPHC />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-attendance"
        element={
          <ProtectedRoute>
            <AddAttendance />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Login />} />
    </Routes>
  )
}

export default App