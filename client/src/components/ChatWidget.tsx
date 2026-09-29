import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { sendChatMessage } from "../lib/stockApi";
import type { Lang } from "../lib/stockApi";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function ChatWidget({ lang = "en" }: { lang?: Lang }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChatMessage(trimmed, lang);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I couldn't reach the AI assistant just now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <span className="text-sm font-semibold">Ask MediSense AI</span>
            <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-slate-50">
            {messages.length === 0 && (
              <p className="text-xs text-slate-400">
                Ask things like "which PHCs are critical right now?" or "what should I redistribute first?"
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-xl px-3 py-2 max-w-[85%] ${
                  m.role === "user"
                    ? "bg-slate-900 text-white self-end"
                    : "bg-white border border-slate-200 text-slate-700 self-start"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-400 self-start">Thinking…</div>
            )}
          </div>

          <div className="flex items-center gap-2 p-2 border-t border-slate-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question…"
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="p-2 bg-slate-900 text-white rounded-lg disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center hover:bg-slate-800 transition-colors"
        >
          <MessageCircle size={22} />
        </button>
      )}
    </div>
  );
}