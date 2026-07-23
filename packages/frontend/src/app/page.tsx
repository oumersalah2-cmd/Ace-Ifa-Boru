// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./providers";
import { api } from "@/lib/api";
import { BookOpen, Award, Flame, Crown, ChevronRight, BarChart2, Zap, X, MessageCircle, Lock, Unlock, LogOut } from "lucide-react";

interface Subject {
  name: string;
  description: string;
  emoji: string;
  count: number;
  freeCount: number;
  color: string;
}

const SUBJECTS: Subject[] = [
  {
    name: "Herrega",
    emoji: "🔢",
    description: "Qormolee baroota darban Ifa Boruu — herregaan akka ibsaa si wajjiin!",
    count: 0,
    freeCount: 0,
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Saayinsii",
    emoji: "🔬",
    description: "Qormolee baroota darban Ifa Boruu — beekumsi saayinsii akka ibsaa si wajjiin!",
    count: 0,
    freeCount: 0,
    color: "from-purple-500 to-pink-600",
  },
  {
    name: "Afaan Oromoo",
    emoji: "✍️",
    description: "Qormolee baroota darban Ifa Boruu — afaan keetti akka ibsaa si wajjiin!",
    count: 0,
    freeCount: 0,
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "English",
    emoji: "📖",
    description: "Qormolee baroota darban Ifa Boruu — English akka ibsaa si wajjiin!",
    count: 0,
    freeCount: 0,
    color: "from-amber-500 to-orange-600",
  },
];

interface OverviewStats {
  totalExams: number;
  averageScorePct: number;
  streakDays: number;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Dashboard() {
  const router = useRouter();
  const { token, user, isPremium, loading: authLoading, error: authError, logout } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [startingSubject, setStartingSubject] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) {
      const isTg = typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initData;
      if (!isTg) {
        router.push("/login");
      }
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    fetch(`${base}/analytics/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Could not load stats");
      })
      .then((data) => {
        setStats({
          totalExams: data.totalExams,
          averageScorePct: data.averageScorePct,
          streakDays: data.streakDays,
        });
      })
      .catch((err) => console.error("Error loading stats:", err))
      .finally(() => setLoadingStats(false));
  }, [token]);

  const startQuiz = async (subjectName: string) => {
    if (!token || startingSubject) return;
    setStartingSubject(subjectName);
    try {
      const session = await api.createExamSession(token, subjectName, []);
      router.push(`/exam/${session.id}`);
    } catch (err) {
      console.error("Failed to create exam session:", err);
      router.push("/upgrade");
    } finally {
      setStartingSubject(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Telegram waliin wal-qunnamaa jira...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center bg-slate-50">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xl font-bold mb-4">!</div>
        <h3 className="text-base font-semibold text-slate-900">Dogoggora Eenyummeessuu</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-xs">{authError}</p>
      </div>
    );
  }

  const initials = getInitials(user?.firstName || user?.username || "U");

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto px-4 py-6 pb-24 relative">

      {/* ── Profile Popup Overlay ── */}
      {showProfile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center px-6"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex justify-end p-3 pb-0">
              <button
                onClick={() => setShowProfile(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar + name */}
            <div className="flex flex-col items-center px-6 pb-2 pt-1">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3">
                {initials}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{user?.firstName}</h2>
              {user?.username && (
                <p className="text-xs text-slate-400 mt-0.5">@{user.username}</p>
              )}

              {/* Premium / Free badge */}
              <div className="mt-2">
                {isPremium ? (
                  <span className="premium-gradient text-[11px] text-amber-950 font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-amber-300">
                    <Crown className="w-3.5 h-3.5 fill-amber-950" /> Premium
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 text-[11px] font-semibold px-3 py-1 rounded-full">
                    Sagantaa Bilisaa
                  </span>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-100 mx-6 my-4" />

            {/* Actions */}
            <div className="flex flex-col gap-2 px-6 pb-6">
              <button
                onClick={() => {
                  window.open("https://t.me/Lamifd", "_blank");
                  setShowProfile(false);
                }}
                className="w-full py-3 rounded-2xl border border-slate-200 text-slate-700 font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-slate-50"
              >
                <MessageCircle className="w-4 h-4 text-blue-500" />
                Gargaarsa / Deebii Argadhu
              </button>

              {!isPremium && (
                <button
                  onClick={() => {
                    router.push("/upgrade");
                    setShowProfile(false);
                  }}
                  className="w-full py-3 rounded-2xl premium-gradient border border-amber-300 text-amber-950 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <Crown className="w-4 h-4 fill-amber-950" />
                  Premium Saaqi
                </button>
              )}

              {/* Sign Out — always visible */}
              <button
                onClick={() => {
                  setShowProfile(false);
                  if (typeof window !== "undefined" && sessionStorage.getItem("credential_token")) {
                    logout();
                  } else if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
                    (window as any).Telegram.WebApp.close();
                  }
                }}
                className="w-full py-3 rounded-2xl border border-red-100 bg-red-50 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <LogOut className="w-4 h-4" />
                Bahi (Sign Out)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Baga Nagaan Deebite</h2>
          <h1 className="text-xl font-bold text-slate-950 flex items-center gap-1.5 mt-0.5">
            {user?.firstName}
            {isPremium ? (
              <span className="premium-gradient text-[10px] text-amber-950 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-300">
                <Crown className="w-3 h-3 fill-amber-950" /> Premium
              </span>
            ) : (
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Sagantaa Bilisaa
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Analytics button */}
          <button
            onClick={() => router.push("/analytics")}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
          >
            <BarChart2 className="w-5 h-5" />
          </button>
          {/* User Avatar — opens profile popup */}
          <button
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-md active:scale-95 transition-transform border-2 border-white"
          >
            {initials}
          </button>
        </div>
      </div>

      {/* ── Stats Widgets ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <Flame className="w-5 h-5 text-amber-500 mb-2" />
          <div>
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Streak</span>
            <span className="text-base font-bold text-slate-950">{loadingStats ? "-" : stats?.streakDays} guyyaa</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <BookOpen className="w-5 h-5 text-blue-500 mb-2" />
          <div>
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Qormaata</span>
            <span className="text-base font-bold text-slate-950">{loadingStats ? "-" : stats?.totalExams} xumurame</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <Award className="w-5 h-5 text-emerald-500 mb-2" />
          <div>
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Qabxii</span>
            <span className="text-base font-bold text-slate-950">{loadingStats ? "-" : `${stats?.averageScorePct}%`}</span>
          </div>
        </div>
      </div>

      {/* ── Subject Grid (2 × 2) ── */}
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Gosa Qormaataa Filadhu</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {SUBJECTS.map((subject) => {
          const isStarting = startingSubject === subject.name;
          return (
            <div
              key={subject.name}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col"
            >
              {/* Gradient header with emoji doodle */}
              <div className={`bg-gradient-to-r ${subject.color} flex items-center justify-between px-3 py-2`}>
                <span className="text-xl leading-none">{subject.emoji}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Ifa Boruu ✨</span>
                  {isPremium ? (
                    <span className="bg-white/20 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Unlock className="w-2.5 h-2.5" /> Banaa
                    </span>
                  ) : (
                    <span className="bg-black/20 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> {subject.name === "Afaan Oromoo" ? "Cufameera" : "5 Bilisaa"}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 flex flex-col flex-1 gap-2">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-950 leading-tight">{subject.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-3">{subject.description}</p>
                </div>
                <div className="flex flex-col gap-1.5 mt-auto">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {isPremium ? "Gaaffilee Hunda" : subject.name === "Afaan Oromoo" ? "Premium Qofa" : "5 Gaaffilee"}
                    </span>
                    <span className={isPremium ? "text-amber-600 font-bold flex items-center gap-0.5" : "text-emerald-600 font-bold"}>
                      {isPremium ? <><Crown className="w-3 h-3 fill-amber-600" /> Premium</> : subject.name === "Afaan Oromoo" ? "Premium" : "Bilisaa"}
                    </span>
                  </div>
                  <button
                    onClick={() => startQuiz(subject.name)}
                    disabled={!!startingSubject}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-[0.98] mt-1 flex items-center justify-center gap-1.5
                      ${isStarting
                        ? "bg-slate-100 text-slate-400"
                        : `bg-gradient-to-r ${subject.color} text-white shadow-sm`
                      }`}
                  >
                    {isStarting ? (
                      <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-white" /> Jalqabi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Premium Upgrade Callout ── */}
      {!isPremium && (
        <button
          onClick={() => router.push("/upgrade")}
          className="w-full text-left premium-gradient p-4 rounded-2xl mb-6 flex items-center justify-between text-amber-950 active:scale-[0.99] transition-all border border-amber-300 shadow-sm"
        >
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-amber-900/10 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-amber-950 fill-amber-950" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Gaaffilee ykn mini appicha guutummaatti fayyadamuuf</h3>
              <p className="text-xs opacity-80 mt-0.5">Qormaata yeroo fi xiinxala bal'aa argadhu</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-70 shrink-0" />
        </button>
      )}
    </div>
  );
}
