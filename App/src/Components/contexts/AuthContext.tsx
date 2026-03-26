"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api, setAccessToken, getAccessToken } from "@/lib/api";

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
  login: (email: string, password: string, turnstileToken?: string) => Promise<AuthUser | null>;
  register: (data: RegisterData, turnstileToken?: string) => Promise<AuthUser | null>;
  registerCompany: (data: RegisterCompanyData, turnstileToken?: string) => Promise<AuthUser | null>;
  registerUniversity: (data: RegisterUniversityData, turnstileToken?: string) => Promise<AuthUser | null>;
  verifyEmail: (email: string, code: string) => Promise<AuthUser>;
  resendCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: AuthUser) => void;
  clearPendingVerification: () => void;
}

const USER_KEY = "stag-user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  // On mount: try to restore session via refresh token cookie
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);

    // Attempt a silent refresh to get a new access token from httpOnly cookie
    api.post<{ success: true; data: { token: string } }>("/api/auth/refresh")
      .then((res) => {
        const newToken = res.data.data.token;
        setAccessToken(newToken);
        // If we have cached user data, use it; otherwise we're logged in but need profile
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem(USER_KEY);
          }
        }
      })
      .catch(() => {
        // No valid refresh token — clear stale data
        setAccessToken(null);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const persist = (newToken: string, newUser: AuthUser) => {
    // Token stays in memory only — never in localStorage
    setAccessToken(newToken);
    // User display data in localStorage (non-sensitive, for hydration)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = useCallback(async (email: string, password: string, turnstileToken?: string): Promise<AuthUser | null> => {
    const { data } = await api.post<{ success: true; data: AuthResponse }>("/api/auth/login", { email, password, turnstileToken });
    if (isVerificationResponse(data.data)) {
      setPendingVerificationEmail(data.data.email);
      return null;
    }
    persist(data.data.token, data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (payload: RegisterData, turnstileToken?: string): Promise<AuthUser | null> => {
    const { data } = await api.post<{ success: true; data: AuthResponse }>("/api/auth/register", { ...payload, turnstileToken });
    if (isVerificationResponse(data.data)) {
      setPendingVerificationEmail(data.data.email);
      return null;
    }
    persist(data.data.token, data.data.user);
    return data.data.user;
  }, []);

  const registerCompany = useCallback(async (payload: RegisterCompanyData, turnstileToken?: string): Promise<AuthUser | null> => {
    const formData = new FormData();
    formData.append("email", payload.email);
    formData.append("password", payload.password);
    formData.append("companyName", payload.companyName);
    if (payload.contactPerson) formData.append("contactPerson", payload.contactPerson);
    if (payload.industry) formData.append("industry", payload.industry);
    if (payload.location) formData.append("location", payload.location);
    if (payload.verificationDocument) formData.append("verificationDocument", payload.verificationDocument);
    if (turnstileToken) formData.append("turnstileToken", turnstileToken);

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

  const registerUniversity = useCallback(async (payload: RegisterUniversityData, turnstileToken?: string): Promise<AuthUser | null> => {
    const { data } = await api.post<{ success: true; data: AuthResponse }>("/api/auth/register/university", { ...payload, turnstileToken });
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
    api.post("/api/auth/logout").catch(() => {});
    setAccessToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setPendingVerificationEmail(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: getAccessToken(),
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
