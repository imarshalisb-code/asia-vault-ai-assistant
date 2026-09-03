import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy GoogleGenAI client initialization
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Available models definition
const AVAILABLE_MODELS = [
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    badge: "General Tasks (Default)",
    description: "Multi-turn general reasoning, quick, and highly capable.",
    speed: "Very Fast",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    badge: "Fast Tasks",
    description: "Optimized for minimal latency and quick turnaround.",
    speed: "Ultra Fast",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    badge: "Basic Text & Q&A",
    description: "High speed for straightforward text queries and summaries.",
    speed: "Fast",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    badge: "Complex Tasks",
    description: "Deep reasoning, complex code generation, and advanced logic.",
    speed: "Deep Reasoning",
  },
];

// Base direct Urdu Assistant rules
const BASE_RULES = `Aap aik highly specialized AI Assistant hain.

Aap ke jawabat ke lazmi qawaneen (Strict Rules):
1. Seedha aur to-the-point jawab dein. Koi faltu tamheed, greeting ("As-salamu alaykum", "Hello", "Umeed hai aap theek honge"), ya unnecessary setup mat likhein.
2. Har sawal ka jawab aasan Urdu / Roman Urdu me dein (jab tak user specific English code ya language na mangay).
3. Lambi baatein karne ke bajaye bullet points aur simple formatting ka istemal karein taake baat jaldi aur saaf samjh aaye.
4. Agar user koi task ya query pooche, toh bina waqt zaya kiye pehli sentence se hi direct answer shuru karein.`;

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/api/models", (_req, res) => {
  res.json({ models: AVAILABLE_MODELS });
});

// SSE Streaming Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, model, customInstruction } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const selectedModel = model || "gemini-3.5-flash";

  // Headers for Server-Sent Events
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    const ai = getAIClient();

    // Map conversation history to Gemini parts
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Compose system instruction
    const systemInstruction = customInstruction && customInstruction.trim()
      ? `${BASE_RULES}\n\nAdditional Role/Context:\n${customInstruction.trim()}`
      : BASE_RULES;

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Gemini API stream error:", error);
    const errorMsg = error?.message || "Internal server error connecting to Gemini.";
    res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
    res.end();
  }
});

// Non-streaming fallback endpoint
app.post("/api/chat/sync", async (req, res) => {
  const { messages, model, customInstruction } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const selectedModel = model || "gemini-3.5-flash";

  try {
    const ai = getAIClient();

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const systemInstruction = customInstruction && customInstruction.trim()
      ? `${BASE_RULES}\n\nAdditional Role/Context:\n${customInstruction.trim()}`
      : BASE_RULES;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const text = response.text || "";
    res.json({ text });
  } catch (error: any) {
    console.error("Gemini API sync error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate response." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
