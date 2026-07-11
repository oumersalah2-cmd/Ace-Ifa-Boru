// src/components/QuizScreen.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, PaywallError } from "@/lib/api";
import { useAuth } from "@/app/providers";
import { useMainButtonControl, useBackButtonControl, useHaptics } from "@/hooks/useTelegramControls";
import { useCountdown } from "@/hooks/useCountdown";
import { Paywall } from "@/components/Paywall";
import { ChevronLeft } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex?: number; // never trust this client-side; backend re-scores on submit
}

interface QuizScreenProps {
  sessionId: string;
  questions: Question[];
  examEndsAt: number; // epoch ms
}

type SubmitFeedback = "idle" | "saving" | "saved" | "error";

export function QuizScreen({ sessionId, questions, examEndsAt }: QuizScreenProps) {
  const router = useRouter();
  const { token } = useAuth();
  const haptics = useHaptics();

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

  // Native Telegram MainButton drives progression through the quiz.
  useMainButtonControl({
    text: isLast ? "Qormaata Xumuri" : "Gaaffii Itti Aanu",
    onClick: goNext,
    enabled: selected !== undefined,
    visible: !paywalled,
  });

  // Native Telegram BackButton returns to category selection.
  useBackButtonControl(goBackCategory, !paywalled);

  const progressPct = useMemo(
    () => Math.round(((index + 1) / questions.length) * 100),
    [index, questions.length]
  );

  if (paywalled) {
    return <Paywall onUpgrade={() => router.push("/upgrade")} />;
  }

  if (!current) return null;

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-safe">
      {/* Progress + timer */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <button
            onClick={goBackCategory}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-600">
            Gaaffii {index + 1} / {questions.length}
          </span>
        </div>
        <span
          className={`font-mono tabular-nums font-medium ${
            isExpired ? "text-red-500" : minutes < 1 ? "text-amber-500" : "text-slate-700"
          }`}
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
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
          return (
            <button
              key={i}
              onClick={() => selectOption(i)}
              className={`text-left rounded-xl border px-4 py-3 text-sm transition-all active:scale-[0.98]
                ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center text-[10px]
                    ${isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}
                >
                  {isSelected ? "✓" : String.fromCharCode(65 + i)}
                </span>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Autosave micro-feedback (haptics fire above; this is the visual echo) */}
      <div className="mt-4 h-5 text-xs">
        {feedback === "saving" && <span className="text-slate-400">Ol-kaayamaa jira...</span>}
        {feedback === "saved" && <span className="text-emerald-600">Deebiin ol-kaayameera ✓</span>}
        {feedback === "error" && <span className="text-red-500">Ol-kaayuu hin dandeenye — qunnamtii kee mirkaneessi</span>}
      </div>

      {/* Spacer so content never sits under Telegram's native MainButton */}
      <div className="flex-1" />
      <div className="h-16" />
    </div>
  );
}
