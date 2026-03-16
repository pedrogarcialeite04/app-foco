/**
 * FOCO — Controllers de autenticação
 */
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function toPublicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }
    const nameTrim = name.trim();
    const emailTrim = email.toLowerCase().trim();
    if (nameTrim.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: "Nome muito longo" });
    }
    if (emailTrim.length > MAX_EMAIL_LENGTH) {
      return res.status(400).json({ error: "Email inválido" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
    }
    if (password.length > 128) {
      return res.status(400).json({ error: "Senha inválida" });
    }

    const existing = await User.findOne({ email: emailTrim });
    if (existing) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    const user = await User.create({ name: nameTrim, email: emailTrim, password });
    const token = signToken(user._id);
    return res.status(201).json({ user: toPublicUser(user), token });
  } catch (err) {
    console.error("[auth] register:", err);
    return res.status(500).json({ error: "Erro ao cadastrar" });
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }
    const emailTrim = email.toLowerCase().trim();
    if (emailTrim.length > MAX_EMAIL_LENGTH) {
      return res.status(400).json({ error: "Email ou senha inválidos" });
    }
    if (password.length > 128) {
      return res.status(400).json({ error: "Email ou senha inválidos" });
    }

    const user = await User.findOne({ email: emailTrim }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const token = signToken(user._id);
    return res.json({ user: toPublicUser(user), token });
  } catch (err) {
    console.error("[auth] login:", err);
    return res.status(500).json({ error: "Erro ao entrar" });
  }
}
