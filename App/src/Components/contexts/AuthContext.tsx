"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  role: "student" | "company" | "admin" | "superadmin" | "university";
  firstName?: string;
  lastName?: string;
  university?: string;
  companyName?: string;
  universityName?: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  university: string;
}

interface RegisterCompanyData {
  email: string;
  password: string;
  companyName: string;
  contactPerson?: string;
  industry?: string;
  location?: string;
  verificationDocument?: File;
}

interface RegisterUniversityData {
  email: string;
  password: string;
  universityName: string;
  domain: string;
  website?: string;
  location?: string;
}

type AuthResponse =
  | { token: string; user: AuthUser }
  | { requiresVerification: true; email: string };

function isVerificationResponse(
  r: AuthResponse
): r is { requiresVerification: true; email: string } {
  return "requiresVerification" in r;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  pendingVerificationEmail: string | null;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  register: (data: RegisterData) => Promise<AuthUser | null>;
  registerCompany: (data: RegisterCompanyData) => Promise<AuthUser | null>;
  registerUniversity: (data: RegisterUniversityData) => Promise<AuthUser | null>;
  verifyEmail: (email: string, code: string) => Promise<AuthUser>;
  resendCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: AuthUser) => void;
  clearPendingVerification: () => void;
}

const TOKEN_KEY = "stag-token";
const USER_KEY = "stag-user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const persist = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const login = useCallback(async (email: string, password: string): Promise<AuthUser | null> => {
    const { data } = await api.post<{ success: true; data: AuthResponse }>("/api/auth/login", { email, password });
    if (isVerificationResponse(data.data)) {
      setPendingVerificationEmail(data.data.email);
      return null; // signals: redirect to verify-email
    }
    persist(data.data.token, data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (payload: RegisterData): Promise<AuthUser | null> => {
    const { data } = await api.post<{ success: true; data: AuthResponse }>("/api/auth/register", payload);
    if (isVerificationResponse(data.data)) {
      setPendingVerificationEmail(data.data.email);
      return null;
    }
    persist(data.data.token, data.data.user);
    return data.data.user;
  }, []);

  const registerCompany = useCallback(async (payload: RegisterCompanyData): Promise<AuthUser | null> => {
    const formData = new FormData();
    formData.append("email", payload.email);
    formData.append("password", payload.password);
    formData.append("companyName", payload.companyName);
    if (payload.contactPerson) formData.append("contactPerson", payload.contactPerson);
    if (payload.industry) formData.append("industry", payload.industry);
    if (payload.location) formData.append("location", payload.location);
    if (payload.verificationDocument) formData.append("verificationDocument", payload.verificationDocument);

    const { data } = await api.post<{ success: true; data: AuthResponse }>("/api/auth/register/company", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (isVerificationResponse(data.data)) {
      setPendingVerificationEmail(data.data.email);
      return null;
    }
    persist(data.data.token, data.data.user);
    return data.data.user;
  }, []);

  const registerUniversity = useCallback(async (payload: RegisterUniversityData): Promise<AuthUser | null> => {
    const { data } = await api.post<{ success: true; data: AuthResponse }>("/api/auth/register/university", payload);
    if (isVerificationResponse(data.data)) {
      setPendingVerificationEmail(data.data.email);
      return null;
    }
    persist(data.data.token, data.data.user);
    return data.data.user;
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string): Promise<AuthUser> => {
    const { data } = await api.post<{
      success: true;
      data: { token: string; user: AuthUser };
    }>("/api/auth/verify-email", { email, code });
    persist(data.data.token, data.data.user);
    setPendingVerificationEmail(null);
    return data.data.user;
  }, []);

  const resendCode = useCallback(async (email: string): Promise<void> => {
    await api.post("/api/auth/resend-verification", { email });
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    await api.post("/api/auth/forgot-password", { email });
  }, []);

  const resetPasswordFn = useCallback(async (resetToken: string, password: string): Promise<void> => {
    await api.post("/api/auth/reset-password", { token: resetToken, password });
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const clearPendingVerification = useCallback(() => {
    setPendingVerificationEmail(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setPendingVerificationEmail(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        pendingVerificationEmail,
        login,
        register,
        registerCompany,
        registerUniversity,
        verifyEmail,
        resendCode,
        forgotPassword,
        resetPassword: resetPasswordFn,
        logout,
        updateUser,
        clearPendingVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
