// src/app/upgrade/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { useBackButtonControl } from "@/hooks/useTelegramControls";
import { Crown, CheckCircle2, ShieldAlert, Sparkles, ChevronLeft } from "lucide-react";
import confetti from "canvas-confetti";

export default function UpgradeScreen() {
  const router = useRouter();
  const { token, isPremium, refreshPremiumStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const goBack = () => {
    router.push("/");
  };

  // Telegram native BackButton goes back to dashboard
  useBackButtonControl(goBack, true);

  const handleUpgrade = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${base}/paywall/upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Upgrade failed");

      setSuccess(true);
      await refreshPremiumStatus();
      
      // Confetti burst for high satisfaction factor!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#fbbf24", "#0c92e9", "#0c426e", "#fff"],
      });
    } catch (e) {
      console.error(e);
      alert("Kaffaltiin hin milkoofne. Qunnamtii interneetii kee mirkaneessi deebisi yaali.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "Gaaffilee Hunda Saaqi",
      description: "Gaaffilee shaakalaa fi ibsa bal'aa gosa qormaataa hundumaa guutummaatti argadhu.",
    },
    {
      title: "Qormaata Yeroo Daangaa Hin Qabne",
      description: "Yeroo qormaataa mijaawaa fi jijjiiramuu danda'uun haala qormaata dhugaa shaakali.",
    },
    {
      title: "Xiinxala Beekumsaa Bal'aa",
      description: "Guddina kee hordofi fi gosa qormaataa xiyyeeffannoo dabalataa barbaadan adda baasi.",
    },
    {
      title: "Beeksisa Malee fi Saffisaan",
      description: "Saffisa qunnamtii fooyya'aa fi haala barumsaa guutuu ta'een fayyadami.",
    },
  ];

  if (success || isPremium) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center bg-slate-50 gap-6 py-12 animate-scale-in">
        <div className="w-20 h-20 rounded-3xl premium-gradient flex items-center justify-center text-4xl shadow-lg border border-amber-350 animate-bounce">
          👑
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 justify-center">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
            Ati Premium dha!
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
            Dandeettiiwwan premium hundi, qormaanni yeroo daangaa hin qabnee fi xiinxalli bal'aan milkiin banamaniiru!
          </p>
        </div>
        <button
          onClick={goBack}
          className="w-full max-w-xs py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold active:scale-[0.98] transition-all shadow-md shadow-blue-200 mt-4"
        >
          Gara daashboordiitti deebi'i
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto px-4 py-6 pb-24">
      {/* Back Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={goBack}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-700">Gara duubaa</span>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 flex flex-col items-center text-center shadow-sm mb-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-3xl shadow-sm mb-4">
          👑
        </div>
        <h2 className="text-lg font-bold text-slate-950">Ace-Ifa-Boru Premium</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          Ifa boruu saaqi, amanannaan qormaata kee darbi.
        </p>

        {/* Price Tag */}
        <div className="mt-5 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1">
          <span className="text-lg font-black">$4.99</span>
          <span className="text-[10px] uppercase font-semibold text-amber-700">/ Kaffaltii yeroo tokkoo qofa</span>
        </div>
      </div>

      {/* Features List */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Maaltu Of Keessatti Hammata</h3>
      <div className="flex flex-col gap-4 mb-6">
        {features.map((feature, idx) => (
          <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 items-start">
            <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">{feature.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badge */}
      <div className="flex gap-2 items-center text-[10px] text-slate-400 font-medium justify-center mb-6">
        <ShieldAlert className="w-3.5 h-3.5" /> Kaffaltii amansiisaa. Yeroo barbaaddanitti haquu dandeessu.
      </div>

      {/* Upgrade Action Button */}
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-750 text-white font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-amber-450 shadow-md shadow-amber-100"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Crown className="w-5 h-5 fill-white" /> Premium Amma Jalqabi
          </>
        )}
      </button>
    </div>
  );
}
