/**
 * FOCO — Entrada do servidor (conecta DB e sobe Express)
 */
import "dotenv/config";
import { connectDB } from "./config/db.js";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production";

function assertProductionEnv() {
  if (!isProduction) return;
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret === "dev-secret-change-in-production") {
    console.error("[API] Em produção, defina JWT_SECRET no .env (mín. 32 caracteres, valor forte e único).");
    process.exit(1);
  }
  if (process.env.CORS_ORIGIN === "*" || !process.env.CORS_ORIGIN) {
    console.error("[API] Em produção, defina CORS_ORIGIN no .env com a URL exata do frontend (ex: https://seusite.com).");
    process.exit(1);
  }
}

async function start() {
  assertProductionEnv();
  await connectDB();
  app.listen(PORT, HOST, () => {
    console.log(`[API] FOCO rodando em http://${HOST}:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
