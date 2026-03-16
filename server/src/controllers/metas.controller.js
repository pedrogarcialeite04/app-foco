/**
 * FOCO — Controllers das metas (lista de metas por usuário).
 */
import Metas from "../models/Metas.js";

const defaultPayload = () => ({ items: [] });
const MAX_METAS = 500;

/**
 * GET /api/metas — retorna lista de metas do usuário autenticado.
 */
export async function getMetas(req, res) {
  try {
    const doc = await Metas.findOne({ userId: req.user._id }).lean();
    if (!doc) {
      return res.json(defaultPayload());
    }
    const items = Array.isArray(doc.items) ? doc.items : [];
    return res.json({ items });
  } catch (err) {
    console.error("[metas] get:", err);
    return res.status(500).json({ error: "Erro ao carregar metas" });
  }
}

/**
 * PUT /api/metas — substitui a lista de metas do usuário autenticado.
 * Espera um array de objetos { id, text, done, createdAt }.
 */
export async function putMetas(req, res) {
  try {
    const { items } = req.body || {};

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Formato de metas inválido" });
    }
    if (items.length > MAX_METAS) {
      return res.status(400).json({ error: "Limite de metas excedido" });
    }

    const safeItems = items
      .map((m) => {
        const id = typeof m.id === "string" && m.id.trim() ? m.id.trim() : String(Date.now());
        const text = typeof m.text === "string" ? m.text.trim() : "";
        if (!text) return null;
        const done = !!m.done;
        const createdAt =
          m.createdAt && typeof m.createdAt === "string" ? new Date(m.createdAt) : new Date();

        return { id, text, done, createdAt };
      })
      .filter(Boolean);

    const doc = await Metas.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { items: safeItems } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    const outItems = Array.isArray(doc?.items) ? doc.items : [];
    return res.json({ items: outItems });
  } catch (err) {
    console.error("[metas] put:", err);
    return res.status(500).json({ error: "Erro ao salvar metas" });
  }
}

