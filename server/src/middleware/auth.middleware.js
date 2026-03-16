/**
 * FOCO — Middleware de autenticação JWT
 */
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

/**
 * Garante que o request tem um token válido e define req.user.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token não informado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    User.findById(decoded.userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: "Usuário não encontrado" });
        }
        req.user = user;
        next();
      })
      .catch(() => res.status(500).json({ error: "Erro ao validar usuário" }));
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
