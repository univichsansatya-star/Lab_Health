import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const REQUESTS_PER_WINDOW = 5;
const WINDOW_MS = 60_000;
const assistantHits = new Map<string, { count: number; resetAt: number }>();

function rateLimitAssistant(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const entry = assistantHits.get(key);
  if (!entry || entry.resetAt < now) {
    assistantHits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  entry.count += 1;
  if (entry.count > REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: "Terlalu banyak permintaan asisten. Coba lagi nanti." });
  }
  return next();
}

function securityHeaders(_req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'",
  );
  next();
}

async function startServer() {
  const app = express();
  const PORT = Number.parseInt(process.env.PORT || "5000", 10);
  const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";

  const djangoUrl = new URL(DJANGO_API_URL);
  const allowedHosts = new Set([
    "127.0.0.1", "localhost", "::1",
    "host.docker.internal", "172.16.0.1", "172.17.0.1",
    "backend",
  ]);
  if (!allowedHosts.has(djangoUrl.hostname) && !djangoUrl.hostname.startsWith("172.") && !djangoUrl.hostname.startsWith("100.")) {
    console.error(`Refusing to proxy to non-local DJANGO_API_URL host: ${djangoUrl.hostname}`);
    process.exit(1);
  }

  app.use(securityHeaders);
  app.use(express.json({ limit: "1mb" }));

  // Keep browser requests same-origin while Django runs as a separate service.
  app.use("/backend-api", async (req, res) => {
    const backendPath = req.originalUrl.replace(/^\/backend-api/, "/api");
    const headers = new Headers();
    for (const name of ["accept", "authorization", "content-type", "cookie"]) {
      const value = req.get(name);
      if (value) headers.set(name, value);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const requestInit: RequestInit = {
        method: req.method,
        headers,
        signal: controller.signal,
      };
      if (!['GET', 'HEAD'].includes(req.method)) {
        requestInit.body = JSON.stringify(req.body || {});
      }
      const response = await fetch(new URL(backendPath, DJANGO_API_URL), requestInit);
      const contentType = response.headers.get("content-type");
      if (contentType) res.setHeader("Content-Type", contentType);
      const cookies =
        typeof response.headers.getSetCookie === "function"
          ? response.headers.getSetCookie()
          : [];
      for (const cookie of cookies) {
        res.append("Set-Cookie", cookie);
      }
      res.setHeader("Cache-Control", "no-store");
      res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
    } catch (error: any) {
      if (error?.name === "AbortError") {
        res.status(504).json({ detail: "Backend timed out." });
      } else {
        console.error("Django proxy error:", error);
        res.status(502).json({ detail: "Django backend is unavailable." });
      }
    } finally {
      clearTimeout(timeout);
    }
  });

  // Health check endpoint for Cloud Run container ingress and monitoring
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "UIS Health Lab", timestamp: new Date().toISOString() });
  });

  // API Route for Lab Assistant powered by Gemini (Lazy initialized)
  app.post("/api/assistant", rateLimitAssistant, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
          reply: "Asisten AI Lab saat ini belum terhubung dengan API Key. Silakan gunakan panduan lab standar.",
        });
      }

      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string" || prompt.length > 2000) {
        return res.status(400).json({ error: "Prompt is required and must be under 2000 characters" });
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
        error: "Failed to generate AI response",
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
    app.use((req, res, next) => {
      res.setHeader("Cache-Control", "no-store");
      next();
    });
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