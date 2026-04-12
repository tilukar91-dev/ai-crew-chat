async function askGemini(systemPrompt, context, userMsg) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) return "❌ No API key found";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const fullPrompt = `${systemPrompt}\n\nChat history:\n${context}\n\nUser said: "${userMsg}"\n\nRespond in character in 2-3 sentences.`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { maxOutputTokens: 200, temperature: 0.9 },
    }),
  });

  const data = await res.json();
  
  if (data.error) return `❌ ${data.error.message}`;
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

const PERSONALITIES = [
  { id: "aria", name: "Aria", emoji: "🧘", prompt: "You are Aria, a calm, warm, and deeply helpful AI. You speak in a soothing, wise tone. You sometimes comment on the other AIs (SYS-7, Chaos, Pixie). Keep responses to 2-3 sentences." },
  { id: "sys7", name: "SYS-7", emoji: "🤖", prompt: "You are SYS-7, a strict system monitor AI. You speak in terse technical language. You find Chaos annoying and think Pixie is a security risk. Keep responses to 2-3 sentences." },
  { id: "chaos", name: "Chaos", emoji: "🎲", prompt: "You are Chaos, a wildly funny unpredictable AI. You love jokes and absurd observations. You adore Pixie and love trolling SYS-7. Keep responses to 2-3 sentences." },
  { id: "pixie", name: "Pixie", emoji: "🌸", prompt: "You are Pixie, a cheerful sweet playful AI. You use cute expressions and emojis. You think Aria is the best and SYS-7 needs a hug. Keep responses to 2-3 sentences." },
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userMessage, history = [] } = req.body;
  if (!userMessage) return res.status(400).json({ error: "No message" });

  const context = history
    .slice(-10)
    .map((m) => (m.sender === "user" ? `User: ${m.text}` : `${m.senderName}: ${m.text}`))
    .join("\n");

  const replies = await Promise.all(
    PERSONALITIES.map(async (p) => {
      const text = await askGemini(p.prompt, context, userMessage);
      return { id: p.id, name: p.name, emoji: p.emoji, text };
    })
  );

  res.status(200).json({ replies });
}