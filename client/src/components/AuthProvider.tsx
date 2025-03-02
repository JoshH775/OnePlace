import React, { createContext, useContext } from "react";
import { UserData } from "@shared/types";
import api from "../utils/api";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

type AuthContextType = {
  user: UserData | null;
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

  const { data: user, isLoading } = useSuspenseQuery({
    queryKey: ["user"],
    queryFn: api.getUser,
    refetchOnWindowFocus: false,
  });

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
