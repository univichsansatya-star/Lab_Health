import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = Number.parseInt(process.env.PORT || "5000", 10);
  const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";

  app.use(express.json());

  // Keep browser requests same-origin while Django runs as a separate service.
  app.use("/backend-api", async (req, res) => {
    const backendPath = req.originalUrl.replace(/^\/backend-api/, "/api");
    const headers = new Headers();
    for (const name of ["accept", "authorization", "content-type"]) {
      const value = req.get(name);
      if (value) headers.set(name, value);
    }

    try {
      const response = await fetch(new URL(backendPath, DJANGO_API_URL), {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body || {}),
      });
      const contentType = response.headers.get("content-type");
      if (contentType) res.setHeader("Content-Type", contentType);
      res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      console.error("Django proxy error:", error);
      res.status(502).json({ detail: "Django backend is unavailable." });
    }
  });

  // Health check endpoint for Cloud Run container ingress and monitoring
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "UIS Health Lab", timestamp: new Date().toISOString() });
  });

  // API Route for Lab Assistant powered by Gemini (Lazy initialized)
  app.post("/api/assistant", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
          reply: "Asisten AI Lab saat ini belum terhubung dengan API Key. Silakan gunakan panduan lab standar.",
        });
      }

      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "Anda adalah Asisten Virtual Laboratorium Keperawatan & Kesehatan Universitas Ichsan Satya (UIS Health Lab). Berikan panduan prosedur lab, keselamatan instrumen klinis, atau SOP peminjaman alat keperawatan secara ramah, ringkas, dan profesional dalam Bahasa Indonesia.",
        },
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: error.message || "Failed to generate AI response",
        reply: "Maaf, terjadi gangguan saat menghubungi asisten AI. Silakan coba kembali sesaat lagi.",
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
