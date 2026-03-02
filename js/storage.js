/**
 * FOCO — Persistência: localStorage ou API (quando usuário logado).
 * load() é assíncrono quando há token (chamada à API).
 */

import { getToken, getRotina, putRotina } from "./api.js";

const STORAGE_KEY = "foco-rotina-v2";

/**
 * @typedef {{ id: string, label: string }} CustomTask
 * @typedef {Object} StoredData
 * @property {Record<string, number>} checks - mapa "weekKey-taskIndex-day" -> 1
 * @property {CustomTask[]} [customTasks] - atividades adicionadas pelo usuário
 * @property {string[]} [removedTaskIds] - ids das atividades padrão que o usuário removeu
 * @property {number} [metaBonusPoints] - pontos extras vindos de metas concluídas
 */

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.checks === "object") {
        return {
          checks: parsed.checks,
          customTasks: Array.isArray(parsed.customTasks) ? parsed.customTasks : [],
          removedTaskIds: Array.isArray(parsed.removedTaskIds) ? parsed.removedTaskIds : [],
          metaBonusPoints:
            typeof parsed.metaBonusPoints === "number" && Number.isFinite(parsed.metaBonusPoints)
              ? parsed.metaBonusPoints
              : 0,
        };
      }
    }
  } catch (_) {}
  return { checks: {}, customTasks: [], removedTaskIds: [], metaBonusPoints: 0 };
}

function saveToLocalStorage(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        checks: data.checks,
        customTasks: data.customTasks || [],
        removedTaskIds: data.removedTaskIds || [],
        metaBonusPoints:
          typeof data.metaBonusPoints === "number" && Number.isFinite(data.metaBonusPoints)
            ? data.metaBonusPoints
            : 0,
      })
    );
  } catch (_) {}
}

/**
 * Carrega dados: da API se houver token, senão do localStorage.
 * @returns {Promise<StoredData>}
 */
export async function load() {
  const token = getToken();
  if (token) {
    try {
      const data = await getRotina();
      if (data) {
        const bonus =
          typeof data.metaBonusPoints === "number" && Number.isFinite(data.metaBonusPoints)
            ? data.metaBonusPoints
            : 0;
        const out = {
          checks: data.checks || {},
          customTasks: Array.isArray(data.customTasks) ? data.customTasks : [],
          removedTaskIds: Array.isArray(data.removedTaskIds) ? data.removedTaskIds : [],
          metaBonusPoints: bonus >= 0 ? bonus : 0,
        };
        saveToLocalStorage(out);
        return out;
      }
    } catch (_) {}
  }
  return loadFromLocalStorage();
}

/**
 * Salva dados: envia para a API se houver token e persiste no localStorage.
 * @param {StoredData} data
 */
export function save(data) {
  saveToLocalStorage(data);
  const token = getToken();
  if (token) {
    const bonus =
      typeof data.metaBonusPoints === "number" && Number.isFinite(data.metaBonusPoints) && data.metaBonusPoints >= 0
        ? data.metaBonusPoints
        : 0;
    putRotina({
      checks: data.checks,
      customTasks: data.customTasks || [],
      removedTaskIds: data.removedTaskIds || [],
      metaBonusPoints: bonus,
    }).catch(() => {});
  }
}
