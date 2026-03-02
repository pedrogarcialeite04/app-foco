/**
 * FOCO — Lógica do jogo: pontos, níveis, mensagens
 */

import { POINTS_PER_CHECK, LEVEL_THRESHOLDS } from "./state.js";

/**
 * Calcula o total de pontos a partir do mapa de checks.
 * @param {Record<string, number>} checks
 * @returns {number}
 */
export function getPoints(checks) {
  const count = Object.values(checks).filter(Boolean).length;
  return count * POINTS_PER_CHECK;
}

/**
 * Retorna o nível atual (1-based) e os limites para o próximo nível.
 * @param {number} points
 * @returns {{ level: number, currentThreshold: number, nextThreshold: number | null }}
 */
export function getLevelInfo(points) {
  let level = 1;
  let currentThreshold = LEVEL_THRESHOLDS[0];
  let nextThreshold = LEVEL_THRESHOLDS[1] ?? null;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      currentThreshold = LEVEL_THRESHOLDS[i];
      nextThreshold = LEVEL_THRESHOLDS[i + 1] ?? null;
      break;
    }
  }

  return { level, currentThreshold, nextThreshold };
}

/** Nomes dos níveis (índice = nível - 1) */
export const LEVEL_NAMES = [
  "Iniciante",
  "Em progresso",
  "Focado",
  "Disciplinado",
  "Máquina",
  "Expert",
  "Mestre",
  "Campeão",
  "Lenda",
  "Imortal",
];

/**
 * Nome do nível para exibição.
 * @param {number} level
 * @returns {string}
 */
export function getLevelName(level) {
  return LEVEL_NAMES[level - 1] ?? "Foco total";
}

/**
 * Progresso (0–100) em direção ao próximo nível.
 * @param {number} points
 * @returns {{ percent: number, current: number, next: number | null }}
 */
export function getProgressToNextLevel(points) {
  const { level, currentThreshold, nextThreshold } = getLevelInfo(points);
  if (nextThreshold == null) {
    return { percent: 100, current: points, next: null };
  }
  const range = nextThreshold - currentThreshold;
  const inLevel = points - currentThreshold;
  const percent = Math.min(100, (inLevel / range) * 100);
  return { percent, current: points, next: nextThreshold };
}

const MESSAGES = [
  "Marque cada atividade concluída e veja seus pontos subirem. Cada check = +10 pts.",
  "Boa! Você está construindo o hábito. Continue marcando o que fizer.",
  "Foco é repetição. Cada dia que você marca te aproxima do próximo nível.",
  "Rotina vira resultado. Que tal fechar uma linha inteira esta semana?",
  "Você está no caminho certo. O próximo nível já está perto.",
  "Expert em formação. Sua consistência está impressionante.",
  "Mestre da rotina. Mantenha o ritmo e suba mais um degrau.",
  "Quase no topo. Mais algumas conclusões e você sobe de nível.",
  "Campeão de disciplina. Continue jogando e batendo seus recordes.",
  "Lenda. Você dominou o jogo da rotina. Mantenha o foco.",
];

/**
 * Mensagem motivacional conforme nível e se acabou de ganhar pontos.
 * @param {number} points
 * @param {number} level
 * @param {boolean} [justEarned]
 * @returns {string}
 */
export function getMessage(points, level, justEarned = false) {
  if (justEarned) {
    const cheers = [
      "+10 pts! Continue assim.",
      "Concluído! +10 pontos.",
      "Mais um! Boa.",
      "Anotado. +10 pts.",
    ];
    return cheers[Math.floor(Math.random() * cheers.length)];
  }
  const index = Math.min(level - 1, MESSAGES.length - 1);
  return MESSAGES[index];
}
