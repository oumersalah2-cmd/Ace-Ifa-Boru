// src/app/providers.tsx
"use client";

import React, { useEffect, useState, createContext, useContext, ReactNode, Component, ErrorInfo } from "react";
import { SDKProvider, useLaunchParams } from "@telegram-apps/sdk-react";
import { exchangeInitDataForToken } from "@/lib/api";

interface AuthState {
  token: string | null;
  isPremium: boolean;
  loading: boolean;
  error: string | null;
  user: { telegramId: string; username: string; firstName: string } | null;
  refreshPremiumStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  token: null,
  isPremium: false,
  loading: true,
  error: null,
  user: null,
  refreshPremiumStatus: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function AuthBridge({ children }: { children: ReactNode }) {
  const launchParams = useLaunchParams();
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
    const rawInitData = launchParams?.initDataRaw;
    if (!rawInitData) {
      // Fallback for development/browser environments
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
      }
    } catch (e) {
      console.error("Failed to refresh premium status", e);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, refreshPremiumStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

// Fallback Provider that runs when not in Telegram and SDK throws an exception
function MockAuthProvider({ children }: { children: ReactNode }) {
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
      }
    } catch (e) {
      console.error("Failed to refresh premium status", e);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, refreshPremiumStatus }}>
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-400">Initializing...</div>;
  }

  return (
    <SafeSDKProvider fallback={<MockAuthProvider>{children}</MockAuthProvider>}>
      <SDKProvider acceptCustomStyles debug={process.env.NODE_ENV === "development"}>
        <AuthBridge>{children}</AuthBridge>
      </SDKProvider>
    </SafeSDKProvider>
  );
}
