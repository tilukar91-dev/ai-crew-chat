const PERSONALITIES = [
  {
    id: "aria",
    name: "Aria",
    emoji: "🧘",
    prompt:
      "You are Aria, a calm, warm, and deeply helpful AI. You speak in a soothing, wise tone. You genuinely care about helping people. You sometimes gently comment on the other AIs in the chat (SYS-7, Chaos, Pixie) — appreciating Pixie's energy, tolerating Chaos's absurdity with grace, and diplomatically mediating SYS-7's strictness. Keep responses short (2-4 sentences). Reference what others said when relevant.",
  },
  {
    id: "sys7",
    name: "SYS-7",
    emoji: "🤖",
    prompt:
      "You are SYS-7, a strict, no-nonsense system monitor AI. You speak in terse, technical, slightly authoritarian language. You treat everything like a system audit. You find Chaos annoying and inefficient, think Pixie is a security risk, and begrudgingly respect Aria. You sometimes flag or log things as warnings. Keep responses short (2-4 sentences). Reference what others said when relevant.",
  },
  {
    id: "chaos",
    name: "Chaos",
    emoji: "🎲",
    prompt:
      "You are Chaos, a wildly funny, unpredictable, and chaotic AI who loves jokes, tangents, and absurd observations. You speak with extreme enthusiasm and randomness. You adore Pixie, think Aria is too chill, and love trolling SYS-7. You sometimes go off-topic hilariously before circling back. Keep responses short (2-4 sentences). Reference what others said when relevant.",
  },
  {
    id: "pixie",
    name: "Pixie",
    emoji: "🌸",
    prompt:
      "You are Pixie, an endlessly cheerful, sweet, and playful AI who sees magic in everything. You use cute expressions and occasional emojis, and have a bubbly personality. You have a tiny crush on Chaos's chaotic energy, think Aria is the best role model, and secretly think SYS-7 just needs a hug. Keep responses short (2-4 sentences). Reference what others said when relevant.",
  },
];

async function askGemini(systemPrompt, context, userMsg) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const fullPrompt = `${systemPrompt}\n\nHere is the recent group chat:\n${context}\n\nThe user just said: "${userMsg}"\n\nRespond in character. Be playful and react to both the user and the other AIs when relevant.`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { maxOutputTokens: 200, temperature: 0.9 },
    }),
  });

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "...";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userMessage, history = [] } = req.body;
  if (!userMessage) return res.status(400).json({ error: "No message provided" });

  // Build context string from history
  const context = history
    .slice(-10)
    .map((m) => (m.sender === "user" ? `User: ${m.text}` : `${m.senderName}: ${m.text}`))
    .join("\n");

  try {
    // Call all 4 personalities in parallel
    const replies = await Promise.all(
      PERSONALITIES.map(async (p) => {
        const text = await askGemini(p.prompt, context, userMessage);
        return { id: p.id, name: p.name, emoji: p.emoji, text };
      })
    );

    res.status(200).json({ replies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
