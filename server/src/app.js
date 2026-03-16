/**
 * FOCO — Aplicação Express (rotas e middleware)
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import rotinaRoutes from "./routes/rotina.routes.js";
import metasRoutes from "./routes/metas.routes.js";
import { globalLimiter, authLimiter } from "./middleware/rateLimit.middleware.js";

const app = express();

// Segurança: headers HTTP (X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet());

// CORS: aceita várias origens separadas por vírgula; em dev aceita localhost e 127.0.0.1 na porta 5500
const corsOrigin = process.env.CORS_ORIGIN || "*";
const allowedOrigins = corsOrigin.includes(",")
  ? corsOrigin.split(",").map((o) => o.trim()).filter(Boolean)
  : [corsOrigin];
if (process.env.NODE_ENV !== "production" && allowedOrigins.length === 1 && allowedOrigins[0] === "http://localhost:5500") {
  allowedOrigins.push("http://127.0.0.1:5500");
}
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes("*")) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, origin);
      return cb(null, false);
    },
    credentials: true,
  })
);

// Body JSON com limite de tamanho (proteção contra payload grande)
app.use(express.json({ limit: "100kb" }));

// Rate limit por IP: global para toda a API
app.use(globalLimiter);

// Raiz: mensagem para quem abre a URL da API no browser
app.get("/", (_, res) =>
  res.json({
    service: "FOCO API",
    message: "API de rotina e autenticação. Use o frontend (Go Live) para aceder ao site.",
    health: "/health",
  })
);

// Health check
app.get("/health", (_, res) => res.json({ ok: true, service: "foco-api" }));

// API (auth com rate limit mais restrito contra brute force)
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/rotina", rotinaRoutes);
app.use("/api/metas", metasRoutes);

// 404
app.use((_, res) => res.status(404).json({ error: "Rota não encontrada" }));

// Error handler
app.use((err, _, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

export default app;
