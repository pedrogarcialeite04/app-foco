/**
 * FOCO — Painel de pontuação na página de metas.
 * Usa os mesmos dados da rotina: API (por usuário/BD) quando logado, localStorage quando não.
 * Tratamento seguro para múltiplos usuários e falhas de rede.
 */
import { load, save } from "./storage.js";
import {
  getPoints,
  getLevelInfo,
  getProgressToNextLevel,
  getMessage,
  getLevelName,
} from "./game.js";
import { runEntryAnimations } from "./animations.js";

const $gamePoints = document.getElementById("game-points");
const $gameLevel = document.getElementById("game-level");
const $gameLevelName = document.getElementById("game-level-name");
const $levelProgressBar = document.getElementById("level-progress-bar");
const $levelProgressFill = document.getElementById("level-progress-fill");
const $levelProgressText = document.getElementById("level-progress-text");
const $gameMessage = document.getElementById("game-message");

function updateGameUI(points) {
  const safePoints = Number.isFinite(points) && points >= 0 ? points : 0;
  const { level } = getLevelInfo(safePoints);
  const progress = getProgressToNextLevel(safePoints);

  if ($gamePoints) $gamePoints.textContent = safePoints;
  if ($gameLevel) $gameLevel.textContent = level;
  if ($gameLevelName) $gameLevelName.textContent = getLevelName(level);

  if ($levelProgressFill) {
    $levelProgressFill.style.width = `${progress.percent}%`;
  }
  if ($levelProgressBar) {
    $levelProgressBar.setAttribute("aria-valuenow", String(Math.round(progress.percent)));
  }

  if ($levelProgressText) {
    if (progress.next != null) {
      $levelProgressText.textContent = `${progress.current} / ${progress.next} pts para o próximo nível`;
    } else {
      $levelProgressText.textContent = "Nível máximo! Mantenha o foco.";
    }
  }

  if ($gameMessage) {
    $gameMessage.textContent = getMessage(safePoints, level, false);
  }
}

function setFallbackMessage() {
  if ($gameMessage) {
    $gameMessage.textContent =
      "Marque atividades na Rotina para ganhar pontos. Se estiver logado, a pontuação é salva na sua conta.";
  }
  if ($levelProgressText) {
    $levelProgressText.textContent = "0 / 100 pts para o próximo nível";
  }
}

function computeTotalPoints(data) {
  const checks = data && typeof data.checks === "object" && data.checks !== null ? data.checks : {};
  const bonus =
    data && typeof data.metaBonusPoints === "number" && Number.isFinite(data.metaBonusPoints)
      ? data.metaBonusPoints
      : 0;
  return getPoints(checks) + bonus;
}

async function refreshScoreboard() {
  try {
    const data = await load();
    const points = computeTotalPoints(data);
    updateGameUI(points);
  } catch {
    updateGameUI(0);
  }
}

(async function initMetasScoreboard() {
  try {
    const data = await load();
    const points = computeTotalPoints(data);
    updateGameUI(points);
    runEntryAnimations();
  } catch {
    updateGameUI(0);
    setFallbackMessage();
  }

  window.addEventListener("foco-apply-meta-bonus", async (e) => {
    const delta = e.detail && typeof e.detail.delta === "number" ? e.detail.delta : 0;
    if (delta === 0) return;
    try {
      const data = await load();
      let bonus =
        typeof data.metaBonusPoints === "number" && Number.isFinite(data.metaBonusPoints)
          ? data.metaBonusPoints
          : 0;
      bonus = Math.max(0, bonus + delta);
      data.metaBonusPoints = bonus;
      save(data);
      const points = getPoints(data.checks || {}) + bonus;
      updateGameUI(points);
    } catch (_) {}
  });
})();

