import "dotenv/config";
import express from "express";
import path from "path";
import app, { CLAUDE_MODEL } from "./app.js";

// Standalone entry point: `npm run dev` or `npm start` in a container.
// Vercel never imports this file — it imports `app.ts` through `api/index.ts`.
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
    console.log(`Maple Writing Coach running on http://0.0.0.0:${PORT}`);
    console.log(`AI engine: Anthropic Claude (${CLAUDE_MODEL})`);
  });
}

startServer();
