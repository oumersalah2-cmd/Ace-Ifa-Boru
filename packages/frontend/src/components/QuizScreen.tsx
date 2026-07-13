// src/components/QuizScreen.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, PaywallError } from "@/lib/api";
import { useAuth } from "@/app/providers";
import { useMainButtonControl, useBackButtonControl, useHaptics } from "@/hooks/useTelegramControls";
import { useCountdown } from "@/hooks/useCountdown";
import { Paywall } from "@/components/Paywall";
import { ChevronLeft, BookOpen, FileText } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex?: number;
  explanation?: string;
}

interface QuizScreenProps {
  sessionId: string;
  questions: Question[];
  examEndsAt: number; // epoch ms
}

type SubmitFeedback = "idle" | "saving" | "saved" | "error";
type QuizMode = "practice" | "exam";

export function QuizScreen({ sessionId, questions, examEndsAt }: QuizScreenProps) {
  const router = useRouter();
  const { token } = useAuth();
  const haptics = useHaptics();

  const [mode, setMode] = useState<QuizMode>("practice");
  const [modeConfirmed, setModeConfirmed] = useState(false);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<SubmitFeedback>("idle");
  const [paywalled, setPaywalled] = useState(false);

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const selected = answers[current?.id];

  const { minutes, seconds, isExpired } = useCountdown(examEndsAt, () => handleFinishExam());

  const selectOption = useCallback(
    async (optionIndex: number) => {
      if (!token || !current) return;
      setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }));
      haptics.tapLight();
      setFeedback("saving");

      try {
        await api.saveAnswer(token, sessionId, current.id, optionIndex);
        setFeedback("saved");
        haptics.success();
      } catch (err) {
        setFeedback("error");
        haptics.error();
        if (err instanceof PaywallError) setPaywalled(true);
      }
    },
    [token, current, sessionId, haptics]
  );

  const handleFinishExam = useCallback(async () => {
    if (!token) return;
    try {
      const result = await api.submitExam(token, sessionId);
      router.push(`/exam/${sessionId}/results?score=${result.score}`);
    } catch {
      setFeedback("error");
    }
  }, [token, sessionId, router]);

  const handleReportQuestion = useCallback(async () => {
    if (!token || !current) return;
    const reason = prompt("Maaloo dogoggora jiru barressaa (Describe the mistake in this question):");
    if (reason === null) return; // User cancelled
    
    try {
      await api.reportQuestion(token, current.id, reason);
      alert("Gabaasni keessan milkiin ergameera. Galatoomaa! (Report submitted successfully.)");
      haptics.success();
    } catch (err) {
      alert("Gabaasni erguu hin dandeenye. Maaloo deebisaa yaalaa.");
      haptics.error();
    }
  }, [token, current, haptics]);

  const goNext = useCallback(() => {
    if (isLast) {
      handleFinishExam();
    } else {
      setIndex((i) => i + 1);
      setFeedback("idle");
    }
  }, [isLast, handleFinishExam]);

  const goBackCategory = useCallback(() => {
    router.push("/");
  }, [router]);

  const goBack = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setFeedback("idle");
    } else {
      setModeConfirmed(false);
    }
  }, [index]);

  useMainButtonControl({
    text: isLast ? "Qormaata Xumuri" : "Gaaffii Itti Aanu",
    onClick: goNext,
    enabled: selected !== undefined,
    visible: modeConfirmed && !paywalled,
  });

  useBackButtonControl(modeConfirmed ? goBack : goBackCategory, !paywalled);

  const progressPct = useMemo(
    () => Math.round(((index + 1) / questions.length) * 100),
    [index, questions.length]
  );

  // ── Paywall ──
  if (paywalled) {
    return <Paywall onUpgrade={() => router.push("/upgrade")} />;
  }

  // ── Mode Selection Screen ──
  if (!modeConfirmed) {
    return (
      <div className="flex flex-col h-full px-4 pt-8 pb-safe bg-slate-50">
        <button
          onClick={goBackCategory}
          className="w-8 h-8 mb-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h1 className="text-xl font-black text-slate-900 mb-1">Mala Qormaataa Filadhu</h1>
        <p className="text-xs text-slate-500 mb-8">Qormaata eegalaatti dura mala filachuu dandeessa.</p>

        {/* Mode cards */}
        <div className="flex gap-3 mb-8">
          {/* Practice */}
          <button
            onClick={() => setMode("practice")}
            className={`flex-1 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98]
              ${mode === "practice"
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 bg-white"
              }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${mode === "practice" ? "bg-blue-600" : "bg-slate-100"}`}>
              <BookOpen className={`w-5 h-5 ${mode === "practice" ? "text-white" : "text-slate-500"}`} />
            </div>
            <h3 className={`text-sm font-bold mb-1 ${mode === "practice" ? "text-blue-700" : "text-slate-800"}`}>
              Shaakala Sagantaa
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Deebii si'a hundumaa ol-kaayamu. Gaaffiilee dhuunfaa daawwachuu dandeessa.
            </p>
          </button>

          {/* Exam */}
          <button
            onClick={() => setMode("exam")}
            className={`flex-1 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98]
              ${mode === "exam"
                ? "border-indigo-600 bg-indigo-50"
                : "border-slate-200 bg-white"
              }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${mode === "exam" ? "bg-indigo-600" : "bg-slate-100"}`}>
              <FileText className={`w-5 h-5 ${mode === "exam" ? "text-white" : "text-slate-500"}`} />
            </div>
            <h3 className={`text-sm font-bold mb-1 ${mode === "exam" ? "text-indigo-700" : "text-slate-800"}`}>
              Sagantaa Qormaataa
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Deebii dhoksaa — kan dhugaa qormaataa fakkeessa. Galmeessuu booda qofa argatta.
            </p>
          </button>
        </div>

        {/* Mode hint */}
        <div className="flex items-start gap-2 bg-white border border-slate-100 rounded-xl p-3 mb-8 text-xs text-slate-500">
          <span className="text-base leading-none mt-0.5">{mode === "practice" ? "📖" : "📝"}</span>
          <span>
            {mode === "practice"
              ? "Shaakala Sagantaa: deebiin yeroo hundumaa ol-kaayama, kan addeessuu hin eegne."
              : "Sagantaa Qormaataa: deebiin dhokfama hanga galmeessitu — kan dhugaa qormaataa fakkeessa."}
          </span>
        </div>

        <button
          onClick={() => setModeConfirmed(true)}
          className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-blue-200"
        >
          Qormaata Jalqabi →
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-safe">
      {/* Progress + timer */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-600">
            Gaaffii {index + 1} / {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mode === "practice" ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700"}`}>
            {mode === "practice" ? "📖 Shaakala" : "📝 Qormaata"}
          </span>
          <button
            onClick={handleReportQuestion}
            className="text-[10px] text-red-500 font-bold bg-red-50 border border-red-150 px-2 py-0.5 rounded-full active:scale-95 transition-all hover:bg-red-100"
          >
            ⚠️ Gabaasi
          </button>
          <span
            className={`font-mono tabular-nums font-medium ${
              isExpired ? "text-red-500" : minutes < 1 ? "text-amber-500" : "text-slate-700"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "00")}
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question */}
      <h2 className="text-base font-medium text-slate-900 leading-relaxed mb-5">
        {current.questionText}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {current.options.map((option, i) => {
          const isSelected = selected === i;
          const showAnswerFeedback = mode === "practice" && selected !== undefined;
          const isCorrect = current.correctOptionIndex === i;
          const isWrongSelected = isSelected && !isCorrect;

          let btnClass = "border-slate-200 bg-white text-slate-700";
          let badgeClass = "border-slate-300";
          let badgeSymbol = String.fromCharCode(65 + i);

          if (showAnswerFeedback) {
            if (isCorrect) {
              btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 pointer-events-none";
              badgeClass = "border-emerald-600 bg-emerald-600 text-white";
              badgeSymbol = "✓";
            } else if (isWrongSelected) {
              btnClass = "border-red-500 bg-red-50 text-red-900 pointer-events-none";
              badgeClass = "border-red-600 bg-red-600 text-white";
              badgeSymbol = "✗";
            } else {
              btnClass = "border-slate-100 bg-slate-50/50 text-slate-400 opacity-60 pointer-events-none";
              badgeClass = "border-slate-200 text-slate-350";
            }
          } else {
            if (isSelected) {
              btnClass = "border-blue-600 bg-blue-50 text-blue-900";
              badgeClass = "border-blue-600 bg-blue-600 text-white";
              badgeSymbol = "✓";
            }
          }

          return (
            <button
              key={i}
              onClick={() => selectOption(i)}
              disabled={showAnswerFeedback}
              className={`text-left rounded-xl border px-4 py-3 text-sm transition-all active:scale-[0.98] ${btnClass}`}
            >
              <span className="inline-flex items-center gap-2">
                <span className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center text-[10px] ${badgeClass}`}>
                  {badgeSymbol}
                </span>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation container (only in practice mode when answered) */}
      {mode === "practice" && selected !== undefined && current.explanation && (
        <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-slate-700 text-xs leading-relaxed animate-scale-in">
          <div className="font-bold text-amber-800 flex items-center gap-1 mb-1.5 text-[10px] uppercase tracking-wider">
            💡 Ibsa Qabxii (Explanation)
          </div>
          {current.explanation}
        </div>
      )}

      {/* Autosave feedback — hidden in exam mode */}
      <div className="mt-4 h-5 text-xs">
        {mode === "practice" && (
          <>
            {feedback === "saving" && <span className="text-slate-400">Ol-kaayamaa jira...</span>}
            {feedback === "saved" && <span className="text-emerald-600">Deebiin ol-kaayameera ✓</span>}
            {feedback === "error" && <span className="text-red-500">Ol-kaayuu hin dandeenye — qunnamtii kee mirkaneessi</span>}
          </>
        )}
        {mode === "exam" && selected !== undefined && (
          <span className="text-slate-400 italic">Sagantaa qormaataa — deebiin dhoksaadha</span>
        )}
      </div>

      <div className="flex-1" />
      <div className="h-16" />
    </div>
  );
}
