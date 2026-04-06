import { Router } from "express";
import { AI_ENABLED, AI_API_KEY, AI_BASE_URL, AI_MODEL, AI_SYSTEM } from "../config/ai.js";

const router = Router();

router.post("/ai/chat", async (req, res) => {
  if (!AI_ENABLED) {
    return res.status(503).json({
      error: "AI not configured. Add OPENAI_API_KEY to your .env file and restart Docker.",
    });
  }

  const { history = [], message, code = "", language = "code" } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const messages = [{ role: "system", content: AI_SYSTEM }];

  if (code.trim()) {
    messages.push({
      role: "system",
      content: `The user is currently editing this ${language} code:\n\`\`\`${language}\n${code.slice(0, 3000)}\n\`\`\``,
    });
  }

  for (const turn of history.slice(-10)) {
    if (turn.role === "user" || turn.role === "assistant") {
      messages.push({ role: turn.role, content: turn.content });
    }
  }

  messages.push({ role: "user", content: message });

  try {
    const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({ model: AI_MODEL, messages, max_tokens: 2048, temperature: 0.3 }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[AI] API error:", response.status, errText);
      return res.status(502).json({ error: `AI API error ${response.status}: ${errText.slice(0, 200)}` });
    }

    const data   = await response.json();
    const answer = data?.choices?.[0]?.message?.content || "No response from AI.";
    res.json({ answer });

  } catch (err) {
    console.error("[AI] fetch error:", err.message);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

export default router;
