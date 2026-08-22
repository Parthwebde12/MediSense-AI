import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/Authcontext";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: "regional_admin" | "phc_staff";
}) {
  const { token, user } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}