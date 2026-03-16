/**
 * FOCO — Controllers da rotina (dados da planilha por usuário)
 */
import Rotina from "../models/Rotina.js";

const defaultPayload = () => ({ checks: {}, customTasks: [], removedTaskIds: [], metaBonusPoints: 0 });

/**
 * GET /api/rotina — retorna dados da rotina do usuário autenticado
 */
export async function getRotina(req, res) {
  try {
    let rotina = await Rotina.findOne({ userId: req.user._id }).lean();
    if (!rotina) {
      return res.json(defaultPayload());
    }
    return res.json({
      checks: rotina.checks || {},
      customTasks: rotina.customTasks || [],
      removedTaskIds: rotina.removedTaskIds || [],
      metaBonusPoints:
        typeof rotina.metaBonusPoints === "number" && Number.isFinite(rotina.metaBonusPoints)
          ? rotina.metaBonusPoints
          : 0,
    });
  } catch (err) {
    console.error("[rotina] get:", err);
    return res.status(500).json({ error: "Erro ao carregar rotina" });
  }
}

const MAX_CUSTOM_TASKS = 500;
const MAX_REMOVED_IDS = 500;
const MAX_CHECKS_KEYS = 1000;

export async function putRotina(req, res) {
  try {
    const { checks, customTasks, removedTaskIds, metaBonusPoints } = req.body;
    const $set = {};
    if (typeof checks === "object" && checks !== null) {
      const keys = Object.keys(checks);
      if (keys.length > MAX_CHECKS_KEYS) {
        return res.status(400).json({ error: "Dados da rotina excedem o limite" });
      }
      $set.checks = checks;
    }
    if (Array.isArray(customTasks)) {
      if (customTasks.length > MAX_CUSTOM_TASKS) {
        return res.status(400).json({ error: "Limite de tarefas customizadas excedido" });
      }
      $set.customTasks = customTasks;
    }
    if (Array.isArray(removedTaskIds)) {
      if (removedTaskIds.length > MAX_REMOVED_IDS) {
        return res.status(400).json({ error: "Dados da rotina excedem o limite" });
      }
      $set.removedTaskIds = removedTaskIds;
    }
    if (typeof metaBonusPoints === "number" && Number.isFinite(metaBonusPoints) && metaBonusPoints >= 0) {
      $set.metaBonusPoints = metaBonusPoints;
    }

    let rotina;
    if (Object.keys($set).length > 0) {
      rotina = await Rotina.findOneAndUpdate(
        { userId: req.user._id },
        { $set },
        { new: true, upsert: true, runValidators: true }
      ).lean();
    } else {
      rotina = await Rotina.findOne({ userId: req.user._id }).lean();
    }

    return res.json({
      checks: rotina?.checks ?? {},
      customTasks: rotina?.customTasks ?? [],
      removedTaskIds: rotina?.removedTaskIds ?? [],
      metaBonusPoints:
        typeof rotina?.metaBonusPoints === "number" && Number.isFinite(rotina.metaBonusPoints)
          ? rotina.metaBonusPoints
          : 0,
    });
  } catch (err) {
    console.error("[rotina] put:", err);
    return res.status(500).json({ error: "Erro ao salvar rotina" });
  }
}
