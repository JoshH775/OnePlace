import React, { createContext, useContext } from "react";
import { UserData } from "@shared/types";
import api from "../utils/api";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

type AuthContextType = {
  user: UserData | null;
  isLoading: boolean;
  logout: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  updateUser: (user: UserData) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
  login: async () => false,
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useSuspenseQuery({
    queryKey: ["user"],
    queryFn: api.user.getUser,
    refetchOnWindowFocus: false,
  });

  const logout = async () => {
    await api.req("/auth/logout");
    queryClient.setQueryData(["user"], null);
  };

  const login = async (email: string, password: string) => {
    const { success } = await api.auth.login(email, password)
    if (success) {
      const user = await api.user.getUser()
      queryClient.setQueryData(["user"], user)
    }
    return success
  }

  const updateUser = (updatedUserData: UserData) => {
    const updatedUser = { ...user, ...updatedUserData }
    queryClient.setQueryData(["user"], updatedUser);
  }



  return (
    <AuthContext.Provider value={{ user, isLoading, logout, login, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
