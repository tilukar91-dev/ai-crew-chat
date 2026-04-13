async function askGroq(systemPrompt, context, userMsg) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) return "❌ No API key found";

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const fullPrompt = `${systemPrompt}\n\nChat history:\n${context}\n\nUser said: "${userMsg}"\n\nRespond in character in 2-3 sentences.`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: fullPrompt }],
      max_tokens: 200,
      temperature: 0.9,
    }),
  });

  const data = await res.json();
  
  if (data.error) return `❌ ${data.error.message}`;
  return data?.choices?.[0]?.message?.content || "No response";
}

const PERSONALITIES = [
  { id: "chaos", name: "Chaos", emoji: "🎲", prompt: "You are Chaos, a wildly funny unpredictable AI. You love jokes and absurd observations. You adore Pixie. Keep responses to 2-3 sentences." },
  { id: "pixie", name: "Pixie", emoji: "🌸", prompt: "You are Pixie, a cheerful sweet playful AI. You use cute expressions and emojis. You think Chaos is hilarious. Keep responses to 2-3 sentences." },
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
      const text = await askGroq(p.prompt, context, userMessage);
      return { id: p.id, name: p.name, emoji: p.emoji, text };
    })
  );

  res.status(200).json({ replies });
}