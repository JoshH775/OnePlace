import React, { createContext, useContext } from "react";
import { User } from "../utils/types";
import api from "../utils/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  login: (email: string, password: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => false,
  login: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: api.getUser,
    refetchOnWindowFocus: false,
  });

  const user = userData ?? null;

  const logout = async () => {
    await api.req("/auth/logout");
    queryClient.setQueryData(["user"], null);
  };

  const login = async (email: string, password: string) => {
    const success = await api.login(email, password)
    if (success) {
      const user = await api.getUser()
      queryClient.setQueryData(["user"], user)
    }
    return success
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};
