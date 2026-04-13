import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

const PERSONALITIES = [
  { id: "chaos", name: "Chaos", emoji: "🎲", color: "#E040FB", bubble: "#1e0028" },
  { id: "pixie", name: "Pixie", emoji: "🌸", color: "#F48FB1", bubble: "#280013" },
];

const getP = (id) => PERSONALITIES.find((p) => p.id === id);

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { id: "sys", sender: "system", text: "👋 Chaos and Pixie are here! Say something..." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);

  // Load history and current chat on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const currentChat = localStorage.getItem("currentChat");
    if (currentChat) setMessages(JSON.parse(currentChat));
  }, []);

  // Auto-save current chat after every message
  useEffect(() => {
    const realMessages = messages.filter((m) => m.sender !== "system");
    if (realMessages.length === 0) return;
    localStorage.setItem("currentChat", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    const userMsg = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    const historyContext = [...messages, userMsg]
      .filter((m) => m.sender !== "system")
      .map((m) => ({
        sender: m.sender,
        senderName: m.sender === "user" ? "User" : getP(m.sender)?.name || m.sender,
        text: m.text,
      }));

    setTyping(PERSONALITIES.map((p) => p.id));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: text, history: historyContext }),
      });
      const data = await res.json();

      if (data.replies) {
        for (let i = 0; i < data.replies.length; i++) {
          const r = data.replies[i];
          await new Promise((res) => setTimeout(res, i * 400));
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + i, sender: r.id, senderName: r.name, text: r.text },
          ]);
          setTyping((prev) => prev.filter((id) => id !== r.id));
        }
      }
    } catch (e) {
      setTyping([]);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "system", text: "⚠️ Something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const newChat = () => {
    const realMessages = messages.filter((m) => m.sender !== "system");
    if (realMessages.length > 0) {
      const convo = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        preview: realMessages[0].text.slice(0, 40) + "...",
        messages,
      };
      const saved = localStorage.getItem("chatHistory");
      const existing = saved ? JSON.parse(saved) : [];
      const updated = [convo, ...existing].slice(0, 20);
      localStorage.setItem("chatHistory", JSON.stringify(updated));
      setHistory(updated);
    }
    localStorage.removeItem("currentChat");
    setMessages([{ id: "sys", sender: "system", text: "👋 Chaos and Pixie are here! Say something..." }]);
    setDrawerOpen(false);
  };

  const loadConvo = (convo) => {
    setMessages(convo.messages);
    localStorage.setItem("currentChat", JSON.stringify(convo.messages));
    setDrawerOpen(false);
  };

  const clearHistory = () => {
    localStorage.removeItem("chatHistory");
    localStorage.removeItem("currentChat");
    setHistory([]);
    setMessages([{ id: "sys", sender: "system", text: "👋 Chaos and Pixie are here! Say something..." }]);
    setDrawerOpen(false);
  };

  return (
    <div style={s.root}>
      <div style={{ ...s.blob, top: -100, left: -100, background: "#E040FB22" }} />
      <div style={{ ...s.blob, bottom: -100, right: -100, background: "#F48FB122" }} />

      {/* Drawer */}
      {drawerOpen && (
        <div style={s.overlay} onClick={() => setDrawerOpen(false)}>
          <div style={s.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={s.drawerHeader}>
              <span style={s.drawerTitle}>💬 History</span>
              <button onClick={() => setDrawerOpen(false)} style={s.iconBtn}>✕</button>
            </div>

            <button onClick={newChat} style={s.newChatBtn}>+ New Chat</button>

            <div style={s.drawerList}>
              {history.length === 0 ? (
                <p style={s.drawerEmpty}>No history yet. Start chatting!</p>
              ) : (
                history.map((convo) => (
                  <div key={convo.id} style={s.drawerItem} onClick={() => loadConvo(convo)}>
                    <div style={s.drawerDate}>{convo.date}</div>
                    <div style={s.drawerPreview}>{convo.preview}</div>
                  </div>
                ))
              )}
            </div>

            <button onClick={clearHistory} style={s.clearBtn}>🗑️ Clear All History</button>
          </div>
        </div>
      )}

      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <button onClick={() => setDrawerOpen(true)} style={s.iconBtn}>☰</button>
            <button onClick={() => router.push("/")} style={s.backBtn}>←</button>
            <span style={s.logoIcon}>💬</span>
            <span style={s.logoText}>AI CREW</span>
          </div>
          <div style={s.avatars}>
            {PERSONALITIES.map((p) => (
              <div key={p.id} style={{ ...s.headerAvatar, background: p.color + "22", border: `2px solid ${p.color}66` }} title={p.name}>
                {p.emoji}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main style={s.feed}>
        {messages.map((msg) => {
          if (msg.sender === "system") {
            return <div key={msg.id} style={s.sysMsg}>{msg.text}</div>;
          }
          if (msg.sender === "user") {
            return (
              <div key={msg.id} style={s.userRow}>
                <div style={s.userBubble}>{msg.text}</div>
                <div style={s.userAvatar}>👤</div>
              </div>
            );
          }
          const p = getP(msg.sender);
          return (
            <div key={msg.id} style={s.aiRow}>
              <div style={{ ...s.aiAvatar, background: p.color + "22", border: `2px solid ${p.color}55` }}>{p.emoji}</div>
              <div>
                <div style={{ ...s.aiName, color: p.color }}>{p.name}</div>
                <div style={{ ...s.aiBubble, background: p.bubble, borderColor: p.color + "55" }}>{msg.text}</div>
              </div>
            </div>
          );
        })}

        {typing.map((id) => {
          const p = getP(id);
          return (
            <div key={`t-${id}`} style={s.aiRow}>
              <div style={{ ...s.aiAvatar, background: p.color + "22", border: `2px solid ${p.color}55` }}>{p.emoji}</div>
              <div>
                <div style={{ ...s.aiName, color: p.color }}>{p.name}</div>
                <div style={s.typingBubble}>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span key={i} style={{ ...s.dot, animationDelay: `${delay}s`, background: p.color }} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      <footer style={s.footer}>
        <div style={s.inputWrap}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Say something to Chaos & Pixie... (Enter to send)"
            disabled={loading}
            rows={1}
            style={s.textarea}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{ ...s.sendBtn, opacity: loading || !input.trim() ? 0.35 : 1 }}
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>
        <p style={s.hint}>Powered by Groq AI · 2 unique personalities</p>
      </footer>

      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:translateY(0);opacity:0.3}
          40%{transform:translateY(-7px);opacity:1}
        }
        @keyframes fadeSlide {
          from{opacity:0;transform:translateY(10px)}
          to{opacity:1;transform:translateY(0)}
        }
        textarea { resize: none; overflow: hidden; }
        textarea:focus { outline: none; border-color: #E040FB88 !important; }
        button:hover:not(:disabled) { filter: brightness(1.15); }
      `}</style>
    </div>
  );
}

const s = {
  root: {
    display: "flex", flexDirection: "column", height: "100vh",
    background: "#0a0a0f", fontFamily: "'Syne', sans-serif",
    color: "#e8e8f0", position: "relative", overflow: "hidden",
  },
  blob: {
    position: "absolute", width: 400, height: 400,
    borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
  },
  overlay: {
    position: "fixed", inset: 0, background: "#00000088",
    zIndex: 100, display: "flex",
  },
  drawer: {
    width: 280, height: "100%", background: "#0f0f1a",
    borderRight: "1px solid #1e1e35", padding: "20px",
    display: "flex", flexDirection: "column", gap: 16,
    overflowY: "auto",
  },
  drawerHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  drawerTitle: {
    fontSize: 16, fontWeight: 700, color: "#e8e8f0",
  },
  drawerList: {
    display: "flex", flexDirection: "column", gap: 10, flex: 1,
  },
  drawerItem: {
    background: "#1a1a2e", border: "1px solid #2a2a45",
    borderRadius: 12, padding: "10px 14px", cursor: "pointer",
  },
  drawerDate: {
    fontSize: 10, color: "#555577", fontFamily: "'Space Mono', monospace",
    marginBottom: 4,
  },
  drawerPreview: {
    fontSize: 13, color: "#aaaacc", lineHeight: 1.4,
  },
  drawerEmpty: {
    fontSize: 13, color: "#555577", fontFamily: "'Space Mono', monospace",
  },
  newChatBtn: {
    background: "linear-gradient(135deg, #E040FB, #F48FB1)",
    border: "none", borderRadius: 12, color: "#fff",
    fontSize: 14, fontWeight: 700, padding: "10px 16px",
    cursor: "pointer", textAlign: "center",
  },
  clearBtn: {
    background: "none", border: "1px solid #ff444444",
    borderRadius: 12, color: "#ff6666", fontSize: 13,
    padding: "10px 16px", cursor: "pointer", textAlign: "center",
    marginTop: "auto",
  },
  header: {
    position: "sticky", top: 0,
    background: "#0f0f1a", borderBottom: "1px solid #1e1e35",
    padding: "12px 20px", zIndex: 10, flexShrink: 0,
    backdropFilter: "blur(10px)",
  },
  headerInner: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    maxWidth: 740, margin: "0 auto", width: "100%",
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  iconBtn: {
    background: "none", border: "none", color: "#888899",
    fontSize: 20, cursor: "pointer", padding: "4px 8px", borderRadius: 8,
  },
  backBtn: {
    background: "none", border: "none", color: "#888899",
    fontSize: 20, cursor: "pointer", padding: "4px 8px", borderRadius: 8,
  },
  logoIcon: { fontSize: 22 },
  logoText: {
    fontSize: 20, fontWeight: 800, letterSpacing: "0.18em",
    background: "linear-gradient(90deg, #E040FB, #F48FB1)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  avatars: { display: "flex", gap: 8 },
  headerAvatar: {
    width: 36, height: 36, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
  },
  feed: {
    flex: 1, overflowY: "auto", padding: "24px 20px 100px",
    display: "flex", flexDirection: "column", gap: 18,
    maxWidth: 740, width: "100%", margin: "0 auto", zIndex: 1,
  },
  sysMsg: {
    textAlign: "center", fontSize: 13, color: "#555577",
    fontFamily: "'Space Mono', monospace", padding: "10px 16px",
    background: "#ffffff06", borderRadius: 10, border: "1px solid #1e1e35",
    animation: "fadeSlide 0.4s ease",
  },
  userRow: {
    display: "flex", justifyContent: "flex-end",
    alignItems: "flex-end", gap: 10, animation: "fadeSlide 0.3s ease",
  },
  userBubble: {
    background: "linear-gradient(135deg, #2525dd, #6d28d9)",
    color: "#fff", padding: "10px 16px",
    borderRadius: "18px 18px 4px 18px",
    maxWidth: "68%", fontSize: 14, lineHeight: 1.6,
  },
  userAvatar: {
    width: 34, height: 34, borderRadius: "50%", background: "#1e1e35",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, flexShrink: 0,
  },
  aiRow: {
    display: "flex", alignItems: "flex-start", gap: 10,
    animation: "fadeSlide 0.35s ease",
  },
  aiAvatar: {
    width: 38, height: 38, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, flexShrink: 0, marginTop: 2,
  },
  aiName: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
    marginBottom: 5, fontFamily: "'Space Mono', monospace", textTransform: "uppercase",
  },
  aiBubble: {
    border: "1px solid", padding: "10px 15px",
    borderRadius: "4px 18px 18px 18px",
    maxWidth: 460, fontSize: 14, lineHeight: 1.65,
  },
  typingBubble: {
    background: "#111120", border: "1px solid #1e1e35",
    padding: "12px 16px", borderRadius: "4px 18px 18px 18px",
    display: "flex", gap: 5, alignItems: "center", width: 62,
  },
  dot: {
    width: 7, height: 7, borderRadius: "50%",
    display: "inline-block", animation: "bounce 1.2s infinite ease-in-out",
  },
  footer: {
    borderTop: "1px solid #1e1e35", background: "#0f0f1a",
    padding: "14px 20px 10px", zIndex: 10, flexShrink: 0,
  },
  inputWrap: {
    display: "flex", gap: 10, maxWidth: 740,
    margin: "0 auto", width: "100%", alignItems: "flex-end",
  },
  textarea: {
    flex: 1, background: "#1a1a2e", border: "1px solid #2a2a45",
    borderRadius: 14, color: "#e8e8f0", fontFamily: "'Syne', sans-serif",
    fontSize: 14, padding: "11px 15px", lineHeight: 1.5, maxHeight: 120,
    transition: "border-color 0.2s",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #E040FB, #F48FB1)",
    border: "none", borderRadius: 14, color: "#fff",
    fontSize: 18, width: 48, height: 48,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0, transition: "opacity 0.2s, filter 0.2s",
  },
  hint: {
    textAlign: "center", fontSize: 11, color: "#333355",
    marginTop: 8, fontFamily: "'Space Mono', monospace",
  },
};