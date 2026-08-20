import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-800">
          Smart Health & Supply Chain Resilience
        </h1>
        <p className="text-slate-500 mt-2">
          Routing is live — pages coming next.
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App