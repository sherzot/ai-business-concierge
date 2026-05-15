import React, { useState } from "react";
import { FileText, Lock } from "lucide-react";

type Template = {
  id: string;
  title: string;
  category: string;
  fields: number;
  icon: string;
};

const TEMPLATES: Template[] = [
  // Shartnomalar
  { id: "ijara-turar", title: "Ijara shartnomasi (turar-joy)", category: "Shartnoma", fields: 12, icon: "🏠" },
  { id: "ijara-tijorat", title: "Ijara shartnomasi (tijorat)", category: "Shartnoma", fields: 14, icon: "🏢" },
  { id: "mehnat", title: "Mehnat shartnomasi", category: "Shartnoma", fields: 16, icon: "💼" },
  { id: "xizmat", title: "Xizmat ko'rsatish shartnomasi", category: "Shartnoma", fields: 10, icon: "🤝" },
  { id: "oldi-sotdi", title: "Oldi-sotdi shartnomasi", category: "Shartnoma", fields: 9, icon: "🛒" },
  { id: "pudrat", title: "Pudrat shartnomasi", category: "Shartnoma", fields: 13, icon: "🔨" },
  { id: "qarz", title: "Qarz shartnomasi", category: "Shartnoma", fields: 8, icon: "💰" },
  { id: "hamkorlik", title: "Hamkorlik shartnomasi", category: "Shartnoma", fields: 11, icon: "🔗" },
  // Arizalar
  { id: "yatt-royxat", title: "YaTT ro'yxatdan o'tish arizasi", category: "Ariza", fields: 7, icon: "📋" },
  { id: "soliq-organ", title: "Soliq organiga ariza", category: "Ariza", fields: 6, icon: "📊" },
  { id: "ishga-olish", title: "Ishga olish buyrug'i", category: "Buyruq", fields: 8, icon: "✅" },
  { id: "boshatish", title: "Ishdan bo'shatish buyrug'i", category: "Buyruq", fields: 7, icon: "❌" },
  { id: "tatil", title: "Ta'til buyrug'i", category: "Buyruq", fields: 6, icon: "🏖️" },
  // Boshqa
  { id: "ishonchnoma", title: "Ishonchnoma", category: "Boshqa", fields: 5, icon: "📜" },
  { id: "tilxat", title: "Tilxat", category: "Boshqa", fields: 4, icon: "✍️" },
];

const CATEGORIES = ["Hammasi", "Shartnoma", "Ariza", "Buyruq", "Boshqa"];

const CAT_COLORS: Record<string, string> = {
  Shartnoma: "bg-blue-50 text-blue-700 border-blue-100",
  Ariza:     "bg-green-50 text-green-700 border-green-100",
  Buyruq:    "bg-purple-50 text-purple-700 border-purple-100",
  Boshqa:    "bg-slate-50 text-slate-600 border-slate-200",
};

export function TemplatesLibrary() {
  const [cat, setCat] = useState("Hammasi");
  const [search, setSearch] = useState("");

  const shown = TEMPLATES.filter((t) => {
    if (cat !== "Hammasi" && t.category !== cat) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
        <Lock size={14} className="shrink-0" />
        AI generatsiya kreditlar kelgandan keyin faollashadi. Hozir shablonlarni ko'rishingiz mumkin.
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Shablon nomi..."
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-w-48"
        />
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                cat === c
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {shown.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">Shablon topilmadi</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shown.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all group cursor-default"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none">{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CAT_COLORS[t.category]}`}>
                      {t.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <FileText size={10} />
                      {t.fields} maydon
                    </span>
                  </div>
                </div>
              </div>
              <button
                disabled
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                title="AI kreditlar kerak"
              >
                <Lock size={11} />
                Yaratish (tez orada)
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        {shown.length} ta shablon · Jami {TEMPLATES.length} ta
      </p>
    </div>
  );
}
