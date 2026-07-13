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
    window.location.href = "/";
  };

  // Telegram native BackButton goes back to dashboard
  useBackButtonControl(goBack, true);

  const handleUpgrade = async () => {
    // We can keep the manual unlock logic for testing or admin use if needed,
    // but in a real manual payment flow, the user contacts the admin.
    window.open("https://t.me/Lamifd", "_blank"); // Example link to admin
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
          <span className="text-lg font-black">200 Birr</span>
          <span className="text-[10px] uppercase font-semibold text-amber-700">/ Kaffaltii yeroo tokkoo qofa</span>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-white rounded-2xl border border-slate-150 p-5 mb-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-900">Akkaataa Kaffaltii (Payment Options)</h3>
        
        <div className="flex flex-col gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <span className="text-xs font-bold text-blue-900">Baankii Daldala Itoophiyaa (CBE)</span>
          <span className="text-lg font-black text-blue-700 tracking-wide">1000551443489</span>
        </div>

        <div className="flex flex-col gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
          <span className="text-xs font-bold text-green-900">Telebirr</span>
          <span className="text-lg font-black text-green-700 tracking-wide">0934978247</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed mt-2">
          Erga kaffaltii raawwattanii booda, ragaa (screenshot) kaffaltii keessanii adminii Telegram irraan nuuf ergaa.
        </p>

        <button
          onClick={handleUpgrade}
          className="mt-4 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold active:scale-[0.98] transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Adminii Quunnami (Contact Admin)
        </button>
      </div>

      {/* Trust Badge */}
      <div className="flex gap-2 items-center text-[10px] text-slate-400 font-medium justify-center mb-6">
        <ShieldAlert className="w-3.5 h-3.5" /> Kaffaltii amansiisaa. Yeroo barbaaddanitti haquu dandeessu.
      </div>

    </div>
  );
}
