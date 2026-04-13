import { useRouter } from "next/router";

const PERSONALITIES = [
  { id: "chaos", name: "Chaos", emoji: "🎲", color: "#E040FB", bubble: "#1e0028", desc: "Wildly funny & unpredictable. Expect chaos." },
  { id: "pixie", name: "Pixie", emoji: "🌸", color: "#F48FB1", bubble: "#280013", desc: "Sweet, playful & full of emojis. Pure joy." },
];

export default function Landing() {
  const router = useRouter();

  return (
    <div style={s.root}>
      <div style={{ ...s.blob, top: -100, left: -100, background: "#E040FB22" }} />
      <div style={{ ...s.blob, bottom: -100, right: -100, background: "#F48FB122" }} />

      <div style={s.landing}>
        <div style={s.landingInner}>
          <div style={s.landingLogo}>💬</div>
          <h1 style={s.landingTitle}>AI CREW CHAT</h1>
          <p style={s.landingSubtitle}>Two unique AI personalities. One wild conversation.</p>

          <div style={s.cards}>
            {PERSONALITIES.map((p) => (
              <div key={p.id} style={{ ...s.card, borderColor: p.color + "55", background: p.bubble }}>
                <div style={{ ...s.cardEmoji, background: p.color + "22", border: `2px solid ${p.color}66` }}>
                  {p.emoji}
                </div>
                <div style={{ ...s.cardName, color: p.color }}>{p.name}</div>
                <div style={s.cardDesc}>{p.desc}</div>
              </div>
            ))}
          </div>

          <button style={s.startBtn} onClick={() => router.push("/chat")}>
            Start Chatting ➤
          </button>

          <p style={s.landingHint}>Powered by Groq AI · Free · No signup needed</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from{opacity:0;transform:translateY(20px)}
          to{opacity:1;transform:translateY(0)}
        }
        button:hover { filter: brightness(1.15); }
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
  landing: {
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1, padding: "20px",
    animation: "fadeSlide 0.6s ease",
  },
  landingInner: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 20, maxWidth: 500, width: "100%", textAlign: "center",
  },
  landingLogo: { fontSize: 56 },
  landingTitle: {
    fontSize: 32, fontWeight: 800, letterSpacing: "0.18em", margin: 0,
    background: "linear-gradient(90deg, #E040FB, #F48FB1)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  landingSubtitle: {
    fontSize: 15, color: "#888899", margin: 0, lineHeight: 1.6,
  },
  cards: {
    display: "flex", gap: 16, width: "100%", justifyContent: "center",
    flexWrap: "wrap",
  },
  card: {
    flex: 1, minWidth: 140, maxWidth: 200,
    border: "1px solid", borderRadius: 20,
    padding: "20px 16px", display: "flex",
    flexDirection: "column", alignItems: "center", gap: 10,
    animation: "fadeSlide 0.6s ease",
  },
  cardEmoji: {
    width: 56, height: 56, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
  },
  cardName: {
    fontSize: 14, fontWeight: 700, letterSpacing: "0.1em",
    fontFamily: "'Space Mono', monospace", textTransform: "uppercase",
  },
  cardDesc: { fontSize: 12, color: "#888899", lineHeight: 1.5, textAlign: "center" },
  startBtn: {
    background: "linear-gradient(135deg, #E040FB, #F48FB1)",
    border: "none", borderRadius: 16, color: "#fff",
    fontSize: 16, fontWeight: 700, padding: "14px 40px",
    cursor: "pointer", letterSpacing: "0.05em",
    transition: "filter 0.2s", marginTop: 8,
  },
  landingHint: { fontSize: 11, color: "#333355", fontFamily: "'Space Mono', monospace" },
};