// src/app/exam/[sessionId]/results/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { useBackButtonControl } from "@/hooks/useTelegramControls";
import { ChevronLeft, Award, CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  isFree: boolean;
}

interface ExamSession {
  id: string;
  subject: string;
  questionIds: string[];
  currentAnswers: Record<string, number>;
  score: number;
  isCompleted: boolean;
}

export default function ResultsScreen({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<Record<string, boolean>>({});

  const goHome = () => {
    router.push("/");
  };

  useBackButtonControl(goHome, true);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL;
        // Fetch session
        const res = await fetch(`${base}/exam-sessions/${params.sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not load exam session");
        const sessionData = await res.json();
        setSession(sessionData);

        // Fetch questions
        const loaded: Question[] = [];
        for (const qId of sessionData.questionIds as string[]) {
          const qRes = await fetch(`${base}/questions/${qId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (qRes.ok) {
            loaded.push(await qRes.json());
          }
        }
        setQuestions(loaded);
      } catch (err) {
        console.error("Failed to load results metadata:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, params.sessionId]);

  const toggleExpand = (qId: string) => {
    setExpandedQuestion((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Calculating results...</p>
      </div>
    );
  }

  if (!session || !questions) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center bg-slate-50">
        <p className="text-sm text-slate-500">Failed to load exam results.</p>
        <button onClick={goHome} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const score = session.score;
  const total = session.questionIds.length;
  const percentage = Math.round((score / total) * 100);

  // Dynamic review quotes
  let feedbackQuote = "Keep practicing!";
  let feedbackColor = "text-amber-500";
  if (percentage >= 80) {
    feedbackQuote = "Outstanding work! You've mastered this subject.";
    feedbackColor = "text-emerald-600";
  } else if (percentage >= 50) {
    feedbackQuote = "Good effort! Just a few more reviews to ace it.";
    feedbackColor = "text-blue-600";
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={goHome}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-700">Dashboard</span>
      </div>

      {/* Main Score Card */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 flex flex-col items-center text-center shadow-sm mb-6 animate-scale-in">
        <Award className="w-12 h-12 text-blue-600 mb-2" />
        <h2 className="text-base font-semibold text-slate-400 uppercase tracking-wide">Exam Completed</h2>
        <h1 className="text-4xl font-black text-slate-900 mt-1">{percentage}%</h1>
        <p className="text-sm font-bold text-slate-800 mt-1">
          {score} / {total} correct answers
        </p>
        <p className={`text-xs font-semibold mt-3 ${feedbackColor}`}>{feedbackQuote}</p>
      </div>

      {/* Review Section */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Review Questions</h3>
      <div className="flex flex-col gap-4 mb-6">
        {questions.map((q, idx) => {
          const userAnswer = session.currentAnswers[q.id];
          const isCorrect = userAnswer === q.correctOptionIndex;
          const isOpen = !!expandedQuestion[q.id];

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs flex flex-col"
            >
              {/* Question Header Accordion */}
              <div
                onClick={() => toggleExpand(q.id)}
                className="p-4 flex justify-between items-start gap-3 cursor-pointer select-none"
              >
                <div className="flex gap-2.5 items-start">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : userAnswer !== undefined ? (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <HelpCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">Question {idx + 1}</h4>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed mt-1 line-clamp-2">
                      {q.questionText}
                    </p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                )}
              </div>

              {/* Accordion Content */}
              {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-50 pt-4 flex flex-col gap-3">
                  {/* Detailed Question text */}
                  <p className="text-sm font-medium text-slate-900 leading-relaxed">{q.questionText}</p>

                  {/* Options */}
                  <div className="flex flex-col gap-2 mt-1">
                    {q.options.map((option, optIdx) => {
                      const isCorrectOpt = optIdx === q.correctOptionIndex;
                      const isUserOpt = optIdx === userAnswer;

                      let optStyle = "border-slate-100 bg-white text-slate-700";
                      if (isCorrectOpt) {
                        optStyle = "border-emerald-200 bg-emerald-50 text-emerald-900 font-medium";
                      } else if (isUserOpt) {
                        optStyle = "border-red-200 bg-red-50 text-red-900";
                      }

                      return (
                        <div key={optIdx} className={`border rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 ${optStyle}`}>
                          <span
                            className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center text-[10px]
                              ${
                                isCorrectOpt
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : isUserOpt
                                  ? "border-red-500 bg-red-500 text-white"
                                  : "border-slate-300"
                              }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          {option}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs leading-relaxed text-slate-600">
                      <span className="font-bold text-slate-800 block mb-1">💡 Explanation:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Return to Dashboard */}
      <button
        onClick={goHome}
        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold active:scale-[0.98] transition-transform shadow-md shadow-blue-200"
      >
        Done Reviewing
      </button>
    </div>
  );
}
