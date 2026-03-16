/**
 * FOCO — Rate limit por IP (proteção contra abuso e brute force)
 */
import rateLimit from "express-rate-limit";

// Limites configuráveis por env (opcional)
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_GLOBAL = Number(process.env.RATE_LIMIT_MAX_GLOBAL) || 100;   // requisições por IP na API em geral
const MAX_AUTH = Number(process.env.RATE_LIMIT_MAX_AUTH) || 10;       // requisições por IP em login/register

const standardHeaders = true;  // envia RateLimit-* no response
const legacyHeaders = false;   // desativa X-RateLimit-* antigo

/**
 * Rate limit global: aplicado a todas as rotas da API.
 * Limita cada IP a MAX_GLOBAL requisições a cada 15 minutos.
 */
export const globalLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_GLOBAL,
  message: { error: "Muitas requisições. Tente de novo em alguns minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limit restrito para /api/auth (login e register).
 * Reduz risco de brute force: cada IP pode tentar login/registro MAX_AUTH vezes a cada 15 minutos.
 */
export const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_AUTH,
  message: { error: "Muitas tentativas de login. Tente de novo em alguns minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});
