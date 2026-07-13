"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { api } from "@/lib/api";
import { Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginScreen() {
  const router = useRouter();
  const { token, loginWithCredentials } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      router.push("/");
    }
  }, [token, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Maaloo username fi password guutaa.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.credentialLogin(username, password);
      loginWithCredentials(response.token, response.user);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Username ykn password dogoggora.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen bg-slate-50 px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shadow-sm mb-4">
            🔑
          </div>
          <h2 className="text-xl font-black text-slate-900 text-center">Seensa Ace-Ifa-Boru</h2>
          <p className="text-xs text-slate-400 mt-1 text-center max-w-[240px]">
            Koodii seensaa (Username fi Password) botii Telegram irraa argattan galchaa.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-55 px-4 py-3 rounded-xl text-xs text-red-600 font-medium border border-red-100 mb-5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
              Username
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ifaboru_abc123"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-800"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="IFA-1234"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-800"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Seeni Galchi <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-450 leading-relaxed">
            Koodii seensaa hin qabdan taanaan, Telegram botii keenya qunnamaa:<br />
            <a
              href="https://t.me/Lamifd"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 font-semibold hover:underline"
            >
              @Lamifd
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
