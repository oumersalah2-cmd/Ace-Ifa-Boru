// src/components/Paywall.tsx
"use client";

export function Paywall({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl">
        🔒
      </div>
      <h2 className="text-lg font-semibold text-slate-900">Gaaffii Premium</h2>
      <p className="text-sm text-slate-500 max-w-xs">
        Gaaffiin kun kutaa qormaata guutuu ti. Gosa qormaataa hunda, yeroo daangaa hin qabnee fi xiinxala bal'aa argachuuf premium saaqi.
      </p>
      <button
        onClick={onUpgrade}
        className="mt-2 w-full max-w-xs rounded-xl bg-blue-600 py-3 text-white font-medium active:scale-[0.98] transition-transform"
      >
        Premium Saaqi
      </button>
    </div>
  );
}
