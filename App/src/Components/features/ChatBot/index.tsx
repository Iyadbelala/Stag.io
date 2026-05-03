"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { useTheme } from "@/Components/contexts/ThemeContext";
import { HiPaperAirplane, HiXMark, HiChatBubbleLeftRight } from "react-icons/hi2";
import { FaRegCompass, FaRobot } from "react-icons/fa6";
import { themes } from "./themes";

/* ── Types ── */
interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  suggestions?: string[];
  timestamp: Date;
}

interface ChatApiResponse {
  success: boolean;
  data: {
    reply: string;
    suggestions?: string[];
    data?: unknown;
  };
}

/* ── Unique ID helper ── */
let _id = 0;
const uid = () => `msg-${++_id}-${Date.now()}`;

export default function ChatBot() {
  const { isDark } = useTheme();
  const t = useMemo(() => (isDark ? themes.dark : themes.light), [isDark]);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "bot",
      text: "Hey there! I'm **Stag**, your AI internship assistant. I can help you discover opportunities, check your applications, and more!",
      suggestions: [
        "Recommend internships",
        "Search remote offers",
        "My applications",
        "Help",
      ],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // SSR guard — portals need a real DOM node
  useEffect(() => {
    setMounted(true);
  }, []);

  // Markdown renderer using theme-aware bold color
  const renderText = useCallback(
    (text: string) => {
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold" style={{ color: t.botBoldText }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      });
    },
    [t.botBoldText]
  );

  // Entrance animation for fab button
  useEffect(() => {
    const timer = setTimeout(() => setShowWidget(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: Message = { id: uid(), role: "user", text: text.trim(), timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const { data } = await api.post<ChatApiResponse>("/api/chatbot", {
          message: text.trim(),
          history: messages.slice(-10).map((m) => ({
            role: m.role,
            text: m.text,
          })),
        });

        const botMsg: Message = {
          id: uid(),
          role: "bot",
          text: data.data.reply,
          suggestions: data.data.suggestions,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "bot",
            text: "Oops, something went wrong. Let me try again!",
            suggestions: ["Help", "Search internships"],
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (!mounted) return null;

  return createPortal(
    <>
      {/* ── CSS Animations ── */}
      <style jsx global>{`
        @keyframes chatbot-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatbot-fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes chatbot-pulse-ring {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes chatbot-dot-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-6px); }
        }
        @keyframes chatbot-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chatbot-window {
          animation: chatbot-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .chatbot-fab {
          animation: chatbot-fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .chatbot-msg {
          animation: chatbot-msg-in 0.3s ease-out forwards;
        }
        .chatbot-dot {
          animation: chatbot-dot-bounce 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* ── Floating Action Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:shadow-2xl ${
          showWidget ? "chatbot-fab" : "opacity-0"
        } ${isOpen ? "rotate-0 scale-90" : "hover:scale-110"}`}
        style={{
          background: t.fabGradient,
          color: t.fabText,
        }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: t.fabPulse,
              animation: "chatbot-pulse-ring 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
        )}
        <span className="relative z-10 transition-transform duration-300">
          {isOpen ? <HiXMark className="h-6 w-6" /> : <HiChatBubbleLeftRight className="h-6 w-6" />}
        </span>
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className="chatbot-window fixed right-6 z-50 flex flex-col overflow-hidden rounded-3xl"
          style={{
            bottom: "96px",
            width: "min(400px, calc(100vw - 32px))",
            maxHeight: "calc(100vh - 120px)",
            height: "520px",
            border: t.windowBorder,
            boxShadow: t.windowShadow,
          }}
        >
          {/* ── Header ── */}
          <div
            className="relative flex shrink-0 items-center gap-3 px-5 py-3.5"
            style={{ background: t.headerBg }}
          >
            <div
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${t.avatarFrom}, ${t.avatarTo})`,
                boxShadow: "0 2px 8px rgba(200,169,106,0.4)",
              }}
            >
              <FaRegCompass className="h-4.5 w-4.5" style={{ color: t.avatarIcon }} />
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400"
                style={{ borderWidth: 2, borderStyle: "solid", borderColor: t.headerOnlineBorder }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold" style={{ color: "#FFFFFF" }}>
                Stag Assistant
              </h3>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>AI-powered internship helper</p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="relative z-10 shrink-0 rounded-lg p-1.5 transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.8)" }}
              aria-label="Close chat"
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </div>

          {/* ── Messages ── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4"
            style={{
              backgroundColor: t.msgAreaBg,
              backgroundImage: t.msgAreaGradient,
              transition: "background-color 0.3s ease",
            }}
          >
            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={msg.id} className="chatbot-msg" style={{ animationDelay: `${idx * 50}ms` }}>
                  {/* Message row */}
                  <div className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.role === "bot" && (
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${t.botAvatarFrom}, ${t.botAvatarTo})`,
                        }}
                      >
                        <FaRobot className="h-3.5 w-3.5" style={{ color: t.botAvatarIcon }} />
                      </div>
                    )}

                    <div className="flex max-w-[80%] flex-col">
                      <div
                        className="rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed shadow-sm"
                        style={
                          msg.role === "user"
                            ? {
                                background: t.userBubbleBg,
                                color: t.userBubbleText,
                                borderBottomRightRadius: "6px",
                              }
                            : {
                                backgroundColor: t.botBubbleBg,
                                color: t.botBubbleText,
                                borderBottomLeftRadius: "6px",
                                border: t.botBubbleBorder,
                                transition: "background-color 0.3s ease, color 0.3s ease",
                              }
                        }
                      >
                        {renderText(msg.text)}
                      </div>
                      <span
                        className={`mt-1 text-[10px] ${msg.role === "user" ? "text-right" : "text-left"}`}
                        style={{ color: t.timestampColor }}
                      >
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Suggestion chips */}
                  {msg.role === "bot" && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="ml-9 mt-2 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(s)}
                          className="group flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                          style={{
                            backgroundColor: t.chipBg,
                            color: t.chipText,
                            border: `1px solid ${t.chipBorder}`,
                            transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = t.chipBorderHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = t.chipBorder;
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="chatbot-msg flex items-end gap-2">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${t.botAvatarFrom}, ${t.botAvatarTo})`,
                    }}
                  >
                    <FaRobot className="h-3.5 w-3.5" style={{ color: t.botAvatarIcon }} />
                  </div>
                  <div
                    className="flex items-center gap-1 rounded-2xl px-4 py-3 shadow-sm"
                    style={{
                      backgroundColor: t.dotBubbleBg,
                      border: t.dotBubbleBorder,
                    }}
                  >
                    <span className="chatbot-dot h-2 w-2 rounded-full" style={{ backgroundColor: t.dotColor, animationDelay: "0ms" }} />
                    <span className="chatbot-dot h-2 w-2 rounded-full" style={{ backgroundColor: t.dotColor, animationDelay: "200ms" }} />
                    <span className="chatbot-dot h-2 w-2 rounded-full" style={{ backgroundColor: t.dotColor, animationDelay: "400ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ── Input Area ── */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-2.5"
            style={{
              backgroundColor: t.inputAreaBg,
              borderTop: t.inputAreaBorder,
              boxShadow: t.inputAreaShadow,
              transition: "background-color 0.3s ease",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about internships..."
              disabled={isTyping}
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all disabled:opacity-50"
              style={{
                backgroundColor: t.inputBg,
                border: `1px solid ${t.inputBorder}`,
                color: t.inputText,
                transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
              }}
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none"
              style={{
                background: input.trim() ? t.sendBtnActive : t.sendBtnInactive,
                color: t.sendBtnText,
              }}
              aria-label="Send message"
            >
              <HiPaperAirplane className="h-[18px] w-[18px]" />
            </button>
          </form>
        </div>
      )}
    </>,
    document.body
  );
}
