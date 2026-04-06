const AI_API_KEY  = process.env.OPENAI_API_KEY || "";
const AI_BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const AI_MODEL    = process.env.AI_MODEL || "gpt-4o-mini";
const AI_ENABLED  = !!AI_API_KEY;

console.log(`[AI] ${AI_ENABLED ? `enabled — model: ${AI_MODEL}, base: ${AI_BASE_URL}` : "disabled (no OPENAI_API_KEY)"}`);

const AI_SYSTEM = `You are an expert coding assistant embedded inside CollabCode, a real-time collaborative code editor.
Help developers understand, debug, improve, and write code.
When given code context, refer to it specifically.
Be concise but thorough. Format code with proper indentation.
Use plain language — no excessive markdown outside of code blocks.`;

export { AI_API_KEY, AI_BASE_URL, AI_MODEL, AI_ENABLED, AI_SYSTEM };
