// src/lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export class PaywallError extends Error {
  constructor() {
    super("This content requires premium access.");
    this.name = "PaywallError";
  }
}

export async function exchangeInitDataForToken(initDataRaw: string) {
  const res = await fetch(`${API_BASE}/auth/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData: initDataRaw }),
  });
  if (!res.ok) throw new Error("Telegram authentication failed");
  return res.json() as Promise<{
    token: string;
    user: { telegramId: string; username: string; firstName: string; isPremium: boolean; premiumUntil: string | null };
  }>;
}

async function authedFetch(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 402) throw new PaywallError();
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const api = {
  createExamSession: (token: string, subject: string, questionIds: string[]) =>
    authedFetch(token, "/exam-sessions", {
      method: "POST",
      body: JSON.stringify({ subject, questionIds }),
    }),

  saveAnswer: (token: string, sessionId: string, questionId: string, selectedIndex: number) =>
    authedFetch(token, `/exam-sessions/${sessionId}/answer`, {
      method: "PATCH",
      body: JSON.stringify({ questionId, selectedIndex }),
    }),

  submitExam: (token: string, sessionId: string) =>
    authedFetch(token, `/exam-sessions/${sessionId}/submit`, { method: "POST" }),

  getQuestion: (token: string, questionId: string) =>
    authedFetch(token, `/questions/${questionId}`),

  credentialLogin: (username: string, password: string) =>
    fetch(`${API_BASE}/auth/credential/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(async (res) => {
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Username ykn password dogoggora.");
      }
      return res.json() as Promise<{
        token: string;
        user: { id: string; username: string; firstName: string; isPremium: boolean; premiumUntil: string | null };
      }>;
    }),
};
