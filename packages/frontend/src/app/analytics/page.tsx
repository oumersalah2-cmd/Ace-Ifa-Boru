// src/app/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { useBackButtonControl } from "@/hooks/useTelegramControls";
import { ChevronLeft, BarChart3, Award, Calendar, ChevronRight, BookOpen, Flame } from "lucide-react";

interface SubjectStats {
  averagePct: number;
  examsTaken: number;
}

interface ExamHistoryItem {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

interface AnalyticsData {
  totalExams: number;
  averageScorePct: number;
  streakDays: number;
  subjectBreakdown: Record<string, SubjectStats>;
  history: ExamHistoryItem[];
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const goBack = () => {
    router.push("/");
  };

  useBackButtonControl(goBack, true);

  useEffect(() => {
    if (!token) return;

    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    fetch(`${base}/analytics/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Could not fetch analytics");
      })
      .then((analytics) => {
        setData(analytics);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [token]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading analytics dashboard...</p>
      </div>
    );
  }

  const overallAvg = data?.averageScorePct || 0;
  const history = data?.history || [];
  const subjectBreakdown = data?.subjectBreakdown || {};

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={goBack}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-700">Back</span>
      </div>

      {/* Title */}
      <h1 className="text-xl font-extrabold text-slate-950 flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        Performance Analytics
      </h1>

      {/* Main Performance Ring Card */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 flex items-center justify-between shadow-sm mb-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Proficiency</h3>
          <p className="text-3xl font-black text-slate-950 mt-1">{overallAvg}%</p>
          <p className="text-xs text-slate-500 mt-2 max-w-[180px] leading-relaxed">
            Average accuracy calculated across all completed practice sets.
          </p>
        </div>

        {/* SVG Progress Circle */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              className="stroke-slate-100"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              className="stroke-blue-600 transition-all duration-1000"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - overallAvg / 100)}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-black text-slate-900">{overallAvg}%</span>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 flex gap-3 items-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Flame className="w-5 h-5 fill-blue-50" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Active Days</span>
            <span className="text-sm font-black text-slate-950">{data?.streakDays || 0} days</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 flex gap-3 items-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Mock Exams</span>
            <span className="text-sm font-black text-slate-950">{data?.totalExams || 0} taken</span>
          </div>
        </div>
      </div>

      {/* Subject Mastery Progress Bars */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Mastery by Subject</h3>
      <div className="bg-white rounded-3xl border border-slate-150 p-5 flex flex-col gap-4 mb-6">
        {Object.keys(subjectBreakdown).length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">No subject statistics available.</div>
        ) : (
          Object.entries(subjectBreakdown).map(([subject, stats]) => (
            <div key={subject} className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                <span>{subject}</span>
                <span className="text-slate-500">{stats.averagePct}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${stats.averagePct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {stats.examsTaken} {stats.examsTaken === 1 ? "exam" : "exams"} taken
              </div>
            </div>
          ))
        )}
      </div>

      {/* Exam History Log */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Exam History</h3>
      <div className="flex flex-col gap-3">
        {history.length === 0 ? (
          <div className="text-center py-8 rounded-3xl border border-dashed border-slate-300 text-xs text-slate-400 bg-white">
            Take your first exam to view history.
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/exam/${item.id}/results?score=${item.score}`)}
              className="bg-white border border-slate-150 rounded-2xl p-4 flex justify-between items-center cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.subject}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.completedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-950">
                  {item.score} / {item.totalQuestions}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
