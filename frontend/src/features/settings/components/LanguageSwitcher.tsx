import React from "react";

export function LanguageSwitcher({ onChange }: { onChange?: (lang: string) => void }) {
  const [lang, setLang] = React.useState("uz");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Language</h3>
      <div className="flex gap-2">
        {[
          { id: "uz", label: "O'zbek" },
          { id: "ru", label: "Русский" },
          { id: "en", label: "English" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              setLang(opt.id);
              onChange?.(opt.id);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              lang === opt.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
