import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  role: "phc_staff" | "regional_admin";
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);