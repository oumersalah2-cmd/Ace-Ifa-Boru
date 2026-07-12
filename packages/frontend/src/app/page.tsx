// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./providers";
import { api } from "@/lib/api";
import { BookOpen, Award, Flame, Crown, ChevronRight, BarChart2, Zap } from "lucide-react";

interface Subject {
  name: string;
  description: string;
  count: number;
  freeCount: number;
  color: string;
}

const SUBJECTS: Subject[] = [
  {
    name: "Herrega",
    description: "Dandeettii herregaa, aljebraa, joomootrii fi piroobaabiliitii kee gabbisi.",
    count: 0,
    freeCount: 0,
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Saayinsii waligalaa",
    description: "Saayinsii fi beekumsa waliigalaa adda addaa shaakali.",
    count: 0,
    freeCount: 0,
    color: "from-purple-500 to-pink-600",
  },
  {
    name: "Afaan Oromoo",
    description: "Caasluga, jechoota fi barruu afaan Oromoo kee gabbisi.",
    count: 0,
    freeCount: 0,
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "English",
    description: "Improve your English grammar, vocabulary, and reading comprehension skills.",
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

export default function Dashboard() {
  const router = useRouter();
  const { token, user, isPremium, loading: authLoading, error: authError } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [startingSubject, setStartingSubject] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto px-4 py-6 pb-24">
      {/* Header Banner */}
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
        <div 
          onClick={() => router.push("/analytics")}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer active:scale-95 transition-transform"
        >
          <BarChart2 className="w-5 h-5" />
        </div>
      </div>

      {/* Stats Widgets */}
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
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Qabxii giddu-galeessaa</span>
            <span className="text-base font-bold text-slate-950">{loadingStats ? "-" : `${stats?.averageScorePct}%`}</span>
          </div>
        </div>
      </div>

      {/* Subject Section */}
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Gosa Qormaataa Filadhu</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {SUBJECTS.map((subject) => {
          const isStarting = startingSubject === subject.name;
          return (
            <div
              key={subject.name}
              className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm flex flex-col"
            >
              <div className={`h-2 bg-gradient-to-r ${subject.color}`} />
              <div className="p-4 flex flex-col flex-1 gap-2">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-950 leading-tight">{subject.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-3">{subject.description}</p>
                </div>
                <div className="flex flex-col gap-1.5 mt-auto">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Gaaffilee
                    </span>
                    <span>Bilisa</span>
                  </div>
                  <button
                    onClick={() => startQuiz(subject.name)}
                    disabled={!!startingSubject}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-[0.98] mt-1 flex items-center justify-center gap-1.5
                      ${
                        isStarting
                          ? "bg-slate-100 text-slate-400"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200"
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

      {/* Upgrade Callout */}
      {!isPremium && (
        <button 
          onClick={() => router.push("/upgrade")}
          className="w-full text-left premium-gradient p-4 rounded-2xl mb-6 flex items-center justify-between text-amber-950 cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all border border-amber-300 shadow-sm"
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
