// src/app/exam/[sessionId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { QuizScreen } from "@/components/QuizScreen";

interface Question {
  id: string;
  questionText: string;
  options: string[];
}

// In this route the session was already created (e.g. from the category
// picker calling api.createExamSession) and its id is in the URL.
// We just need to hydrate its questions before mounting the quiz.
export default function ExamSessionPage({ params }: { params: { sessionId: string } }) {
  const { token, loading: authLoading, error: authError } = useAuth();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [examEndsAt, setExamEndsAt] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    // Fetch session metadata (question order + expiry) from your own
    // GET /exam-sessions/:id endpoint, then hydrate each question.
    // (Left as a fetch against API_BASE for brevity — mirrors api.ts pattern.)
    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL;
        const res = await fetch(`${base}/exam-sessions/${params.sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not load exam session");
        const session = await res.json();

        const loaded: Question[] = [];
        for (const qId of session.questionIds as string[]) {
          const qRes = await fetch(`${base}/questions/${qId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (qRes.ok) loaded.push(await qRes.json());
        }

        setQuestions(loaded);
        setExamEndsAt(new Date(session.expiresAt).getTime());
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load exam");
      }
    })();
  }, [token, params.sessionId]);

  if (authLoading) return <CenteredMessage text="Connecting to Telegram…" />;
  if (authError) return <CenteredMessage text={authError} />;
  if (loadError) return <CenteredMessage text={loadError} />;
  if (!questions || examEndsAt === null) return <CenteredMessage text="Loading exam…" />;

  return <QuizScreen sessionId={params.sessionId} questions={questions} examEndsAt={examEndsAt} />;
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-screen px-6 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
