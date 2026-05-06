import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { sendAdminAIMessage } from "../api/adminApi";
import { useI18n } from "../../../app/providers/I18nProvider";

type Message = { id: string; role: "user" | "ai"; content: string; loading?: boolean };

const SUGGESTIONS = [
  "Hozir nechta kompaniya pending_approval holatida?",
  "Platformada jami nechta faol xodim bor?",
  "Qaysi muammolarga e'tibor berishim kerak?",
];

export function AdminAIChatPage() {
  const { locale } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "ai",
      content: "Salom, admin! Platforma haqida savol yoki tahlil kerakmi? Yordam bera olaman.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || pending) return;
    setInput("");
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: msg };
    const placeholder: Message = { id: crypto.randomUUID(), role: "ai", content: "", loading: true };
    setMessages((prev) => [...prev, userMsg, placeholder]);
    setPending(true);
    try {
      const res = await sendAdminAIMessage(msg, locale);
      setMessages((prev) =>
        prev.map((m) => (m.id === placeholder.id ? { ...m, content: res.reply, loading: false } : m))
      );
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id ? { ...m, content: "Xatolik yuz berdi. Qayta urinib ko'ring.", loading: false } : m
        )
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin AI Yordamchisi</h1>
          <p className="text-xs text-slate-500">Platforma monitoringi va tahlil</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4"
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              m.role === "ai" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
            }`}>
              {m.role === "ai" ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "ai"
                ? "bg-white border border-slate-200 text-slate-800"
                : "bg-indigo-600 text-white"
            }`}>
              {m.loading ? (
                <span className="inline-flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              ) : (
                <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions (show only at start) */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 px-3 py-1.5 hover:bg-indigo-100 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Savol yozing…"
          disabled={pending}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
