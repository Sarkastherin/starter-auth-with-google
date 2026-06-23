import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import type {
  RegisterInput,
  User,
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
} from "../types/auth";
import type { LoginInput } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  registerUser: (data: RegisterInput) => Promise<any>;
  forgotPassword: (data: ForgotPassword) => Promise<{ message: string }>;
  resetPassword: (data: ResetPassword) => Promise<{ message: string }>;
  verifyEmail: (data: VerifyEmail) => Promise<{ message: string }>;
  loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("No autorizado");
      }
      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginInput) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      await checkSession();
    } catch (error: any) {
      throw new Error(error.message || "Error al iniciar sesión");
    }
  };

  const logout = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cerrar sesión");
      }
      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      throw new Error(error.message || "Error al cerrar sesión");
    }
  }, []);

  const registerUser = useCallback(async (data: RegisterInput) => {
    const { email, password } = data;
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      const responseData = await response.json();
      return responseData;
    } catch (error: any) {
      throw new Error(error.message || "Error al iniciar sesión");
    }
  }, []);

  const forgotPassword = useCallback(async (data: ForgotPassword) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      console.log(response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      const responseData = await response.json();
      return responseData;
    } catch (error: any) {
      console.log(error);
      throw new Error(
        error.message || "Error al solicitar la recuperación de contraseña",
      );
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPassword) => {
    const { token, newPassword } = data;
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      const responseData = await response.json();
      return responseData;
    } catch (error: any) {
      throw new Error(error.message || "Error al crean nueva contraseña");
    }
  }, []);

  const verifyEmail = useCallback(async (data: VerifyEmail) => {
    const { token } = data;
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      const responseData = await response.json();
      console.log(responseData);
      return responseData;
    } catch (error: any) {
      console.log(error);
      throw new Error(error.message || "Error al verificar email");
    }
  }, []);

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        registerUser,
        forgotPassword,
        resetPassword,
        verifyEmail,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
