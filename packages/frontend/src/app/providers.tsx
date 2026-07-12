// src/app/providers.tsx
"use client";

import React, { useEffect, useState, createContext, useContext, ReactNode, Component, ErrorInfo } from "react";
import { SDKProvider, useLaunchParams } from "@telegram-apps/sdk-react";
import { exchangeInitDataForToken } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthState {
  token: string | null;
  isPremium: boolean;
  loading: boolean;
  error: string | null;
  user: { telegramId: string; username: string; firstName: string } | null;
  refreshPremiumStatus: () => Promise<void>;
  loginWithCredentials: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  token: null,
  isPremium: false,
  loading: true,
  error: null,
  user: null,
  refreshPremiumStatus: async () => {},
  loginWithCredentials: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Beautiful animated splash/loading screen shown while auth is in progress
function SplashScreen() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Animated logo ring */}
      <div style={{ position: "relative", width: 96, height: 96, marginBottom: 28 }}>
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.15)",
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "3px solid transparent",
          borderTopColor: "#f59e0b",
        }} />
        <div style={{
          position: "absolute",
          inset: 8,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
        }}>
          📚
        </div>
      </div>

      {/* App name */}
      <h1 style={{
        color: "#ffffff",
        fontSize: 22,
        fontWeight: 700,
        margin: 0,
        letterSpacing: 0.5,
      }}>Ace Ifa Boru</h1>

      {/* Subtitle */}
      <p style={{
        color: "rgba(255,255,255,0.6)",
        fontSize: 13,
        margin: "6px 0 0",
        letterSpacing: 0.3,
      }}>Boarding Secondary School</p>

      {/* Static dots */}
      <div style={{ display: "flex", gap: 6, marginTop: 32 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#f59e0b",
          }} />
        ))}
      </div>
    </div>
  );
}

function AuthBridge({ children }: { children: ReactNode }) {
  const launchParams = useLaunchParams();
  const router = useRouter();
  const [state, setState] = useState<{
    token: string | null;
    isPremium: boolean;
    loading: boolean;
    error: string | null;
    user: AuthState["user"];
  }>({
    token: null,
    isPremium: false,
    loading: true,
    error: null,
    user: null,
  });

  const loadAuth = async (initData: string) => {
    try {
      const { token, user } = await exchangeInitDataForToken(initData);
      setState({
        token,
        isPremium: user.isPremium,
        loading: false,
        error: null,
        user: {
          telegramId: user.telegramId,
          username: user.username || "user",
          firstName: user.firstName || user.username || "User",
        },
      });
    } catch (err: any) {
      setState({
        token: null,
        isPremium: false,
        loading: false,
        error: err.message || "Authentication failed",
        user: null,
      });
    }
  };

  useEffect(() => {
    // Check for credential login first
    const credToken = sessionStorage.getItem("credential_token");
    const credUserStr = sessionStorage.getItem("credential_user");

    if (credToken && credUserStr) {
      try {
        const credUser = JSON.parse(credUserStr);
        setState({
          token: credToken,
          isPremium: credUser.isPremium,
          loading: false,
          error: null,
          user: {
            telegramId: "",
            username: credUser.username,
            firstName: credUser.firstName || credUser.username,
          },
        });
        return;
      } catch (e) {
        console.error("Failed to parse stored credential user", e);
      }
    }

    const rawInitData = launchParams?.initDataRaw;
    if (!rawInitData) {
      loadAuth("mock_development_mode");
      return;
    }
    loadAuth(rawInitData);
  }, [launchParams]);

  const refreshPremiumStatus = async () => {
    if (!state.token) return;
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${base}/paywall/check`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({ ...prev, isPremium: data.isPremium }));

        // Sync with session storage if credential login
        if (sessionStorage.getItem("credential_token")) {
          const credUserStr = sessionStorage.getItem("credential_user");
          if (credUserStr) {
            const credUser = JSON.parse(credUserStr);
            credUser.isPremium = data.isPremium;
            sessionStorage.setItem("credential_user", JSON.stringify(credUser));
          }
        }
      }
    } catch (e) {
      console.error("Failed to refresh premium status", e);
    }
  };

  const loginWithCredentials = (token: string, user: any) => {
    sessionStorage.setItem("credential_token", token);
    sessionStorage.setItem("credential_user", JSON.stringify(user));
    setState({
      token,
      isPremium: user.isPremium,
      loading: false,
      error: null,
      user: {
        telegramId: "",
        username: user.username,
        firstName: user.firstName || user.username,
      },
    });
  };

  const logout = () => {
    sessionStorage.removeItem("credential_token");
    sessionStorage.removeItem("credential_user");
    setState({
      token: null,
      isPremium: false,
      loading: false,
      error: null,
      user: null,
    });
    router.push("/login");
  };

  // Show splash while loading
  if (state.loading) return <SplashScreen />;

  return (
    <AuthContext.Provider value={{ ...state, refreshPremiumStatus, loginWithCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Fallback Provider that runs when not in Telegram
function MockAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<{
    token: string | null;
    isPremium: boolean;
    loading: boolean;
    error: string | null;
    user: AuthState["user"];
  }>({
    token: null,
    isPremium: false,
    loading: true,
    error: null,
    user: null,
  });

  useEffect(() => {
    // Check for credential login first
    const credToken = sessionStorage.getItem("credential_token");
    const credUserStr = sessionStorage.getItem("credential_user");

    if (credToken && credUserStr) {
      try {
        const credUser = JSON.parse(credUserStr);
        setState({
          token: credToken,
          isPremium: credUser.isPremium,
          loading: false,
          error: null,
          user: {
            telegramId: "",
            username: credUser.username,
            firstName: credUser.firstName || credUser.username,
          },
        });
        return;
      } catch (e) {
        console.error("Failed to parse stored credential user", e);
      }
    }

    exchangeInitDataForToken("mock_development_mode")
      .then(({ token, user }) => {
        setState({
          token,
          isPremium: user.isPremium,
          loading: false,
          error: null,
          user: {
            telegramId: user.telegramId,
            username: user.username || "mock_dev",
            firstName: user.firstName || user.username || "Developer",
          },
        });
      })
      .catch((err) => {
        setState({
          token: null,
          isPremium: false,
          loading: false,
          error: err.message,
          user: null,
        });
      });
  }, []);

  const refreshPremiumStatus = async () => {
    if (!state.token) return;
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${base}/paywall/check`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({ ...prev, isPremium: data.isPremium }));

        // Sync with session storage if credential login
        if (sessionStorage.getItem("credential_token")) {
          const credUserStr = sessionStorage.getItem("credential_user");
          if (credUserStr) {
            const credUser = JSON.parse(credUserStr);
            credUser.isPremium = data.isPremium;
            sessionStorage.setItem("credential_user", JSON.stringify(credUser));
          }
        }
      }
    } catch (e) {
      console.error("Failed to refresh premium status", e);
    }
  };

  const loginWithCredentials = (token: string, user: any) => {
    sessionStorage.setItem("credential_token", token);
    sessionStorage.setItem("credential_user", JSON.stringify(user));
    setState({
      token,
      isPremium: user.isPremium,
      loading: false,
      error: null,
      user: {
        telegramId: "",
        username: user.username,
        firstName: user.firstName || user.username,
      },
    });
  };

  const logout = () => {
    sessionStorage.removeItem("credential_token");
    sessionStorage.removeItem("credential_user");
    setState({
      token: null,
      isPremium: false,
      loading: false,
      error: null,
      user: null,
    });
    router.push("/login");
  };

  if (state.loading) return <SplashScreen />;

  return (
    <AuthContext.Provider value={{ ...state, refreshPremiumStatus, loginWithCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

class SafeSDKProvider extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.warn("Telegram SDK failed to load, falling back to mock provider:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SafeSDKProvider fallback={<MockAuthProvider>{children}</MockAuthProvider>}>
      <SDKProvider acceptCustomStyles debug={process.env.NODE_ENV === "development"}>
        <AuthBridge>{children}</AuthBridge>
      </SDKProvider>
    </SafeSDKProvider>
  );
}
