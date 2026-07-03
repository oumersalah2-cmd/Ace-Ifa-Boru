// src/components/Paywall.tsx
"use client";

export function Paywall({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl">
        🔒
      </div>
      <h2 className="text-lg font-semibold text-slate-900">Premium question</h2>
      <p className="text-sm text-slate-500 max-w-xs">
        This question is part of a full mock exam. Unlock premium to access every
        subject, unlimited timed exams, and detailed analytics.
      </p>
      <button
        onClick={onUpgrade}
        className="mt-2 w-full max-w-xs rounded-xl bg-blue-600 py-3 text-white font-medium active:scale-[0.98] transition-transform"
      >
        Unlock Premium
      </button>
    </div>
  );
}
