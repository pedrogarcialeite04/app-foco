/**
 * FOCO — Cérebro da aplicação: único script declarado no HTML.
 * Orquestra os módulos e a inicialização.
 */

import { TASKS, POINTS_PER_CHECK } from "./state.js";
import { load, save } from "./storage.js";
import { getPoints, getLevelInfo, getProgressToNextLevel, getMessage, getLevelName } from "./game.js";
import { toggle, render, getWeekKey, getWeekLabel, getPrevWeekKey, getNextWeekKey } from "./sheet.js";
import { runEntryAnimations, animatePointsPop, animateTableRowsIn, refreshScrollTrigger } from "./animations.js";

const $sheetBody = document.getElementById("sheet-body");
const $gamePoints = document.getElementById("game-points");
const $gameLevel = document.getElementById("game-level");
const $gameLevelName = document.getElementById("game-level-name");
const $levelProgressBar = document.getElementById("level-progress-bar");
const $levelProgressFill = document.getElementById("level-progress-fill");
const $levelProgressText = document.getElementById("level-progress-text");
const $gameMessage = document.getElementById("game-message");
const $weekLabel = document.getElementById("week-label");
const $weekPrev = document.getElementById("week-prev");
const $weekNext = document.getElementById("week-next");
const $addItemBtn = document.getElementById("sheet-add-item-btn");

let data = { checks: {}, customTasks: [], removedTaskIds: [], metaBonusPoints: 0 };
let viewWeekKey = getWeekKey();
let showDraftRow = false;

function getTasks() {
  const removed = data.removedTaskIds || [];
  const defaults = TASKS.filter((t) => !removed.includes(t.id));
  return [...defaults, ...(data.customTasks || [])];
}

/**
 * Reindexa checks após remover a tarefa no índice removidoIndex.
 * Chave: "YYYY-MM-DD-taskIndex-day" (weekKey tem hífens).
 * @param {Record<string, number>} checks
 * @param {number} removidoIndex
 * @returns {Record<string, number>}
 */
function reindexChecksAfterRemove(checks, removidoIndex) {
  const next = {};
  for (const key of Object.keys(checks)) {
    const parts = key.split("-");
    if (parts.length !== 5) continue;
    const weekKey = parts.slice(0, 3).join("-");
    const idx = parseInt(parts[3], 10);
    const day = parts[4];
    if (Number.isNaN(idx)) continue;
    if (idx === removidoIndex) continue;
    if (idx > removidoIndex) {
      next[`${weekKey}-${idx - 1}-${day}`] = checks[key];
    } else {
      next[key] = checks[key];
    }
  }
  return next;
}

/**
 * Remove a tarefa no índice taskIndex (padrão ou custom) e reindexa checks.
 */
function doRemoveTask(taskIndex) {
  const tasks = getTasks();
  const task = tasks[taskIndex];
  if (!task) return;

  if (task.id.startsWith("custom-")) {
    data.customTasks = (data.customTasks || []).filter((t) => t.id !== task.id);
  } else {
    data.removedTaskIds = data.removedTaskIds || [];
    if (!data.removedTaskIds.includes(task.id)) data.removedTaskIds.push(task.id);
  }

  data.checks = reindexChecksAfterRemove(data.checks, taskIndex);
  save(data);
  showDraftRow = false;
  refreshSheet();
  updateGameUI(false);
  animateTableRowsIn();
}

/**
 * Abre modal de confirmação para remover atividade.
 * @param {string} taskLabel
 * @param {number} taskIndex
 */
function showConfirmRemoveModal(taskLabel, taskIndex) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.setAttribute("aria-labelledby", "modal-title");
  backdrop.innerHTML = `
    <div class="modal-dialog">
      <h2 id="modal-title" class="modal-title">Remover atividade?</h2>
      <p class="modal-text">Remover <strong class="modal-task-label"></strong>? Os pontos dessa atividade serão perdidos e a ação não pode ser desfeita.</p>
      <div class="modal-actions">
        <button type="button" class="modal-btn modal-btn-cancel">Cancelar</button>
        <button type="button" class="modal-btn modal-btn-remove">Remover</button>
      </div>
    </div>
  `;
  const labelEl = backdrop.querySelector(".modal-task-label");
  if (labelEl) labelEl.textContent = `"${taskLabel}"`;

  const close = () => {
    backdrop.remove();
  };

  backdrop.querySelector(".modal-btn-cancel").addEventListener("click", () => close());
  backdrop.querySelector(".modal-btn-remove").addEventListener("click", () => {
    close();
    doRemoveTask(taskIndex);
  });

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  document.body.appendChild(backdrop);
  backdrop.querySelector(".modal-btn-cancel").focus();
}

function showPointsGain(amount, cell) {
  if (!cell) return;
  const el = document.createElement("div");
  el.className = "points-float";
  el.textContent = `+${amount}`;
  cell.appendChild(el);
  setTimeout(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  }, 900);
}

function updateGameUI(justEarned = false) {
  const basePoints = getPoints(data.checks);
  const bonus =
    typeof data.metaBonusPoints === "number" && Number.isFinite(data.metaBonusPoints)
      ? data.metaBonusPoints
      : 0;
  const points = basePoints + bonus;
  const { level } = getLevelInfo(points);
  const progress = getProgressToNextLevel(points);

  $gamePoints.textContent = points;
  $gameLevel.textContent = level;
  if ($gameLevelName) $gameLevelName.textContent = getLevelName(level);

  if (justEarned) {
    animatePointsPop($gamePoints);
  }

  $levelProgressFill.style.width = `${progress.percent}%`;
  $levelProgressBar.setAttribute("aria-valuenow", Math.round(progress.percent));

  if (progress.next != null) {
    $levelProgressText.textContent = `${progress.current} / ${progress.next} pts para o próximo nível`;
  } else {
    $levelProgressText.textContent = "Nível máximo! Mantenha o foco.";
  }

  $gameMessage.textContent = getMessage(points, level, justEarned);
}

const MAX_WEEK_KEY = "2028-01-01"; // Navegação até última semana de 2027

function updateWeekNav() {
  $weekLabel.textContent = getWeekLabel(viewWeekKey);
  $weekPrev.disabled = false;
  $weekNext.disabled = viewWeekKey >= MAX_WEEK_KEY;
}

function onCellClick(taskIndex, day, cell) {
  const justEarned = toggle(data, taskIndex, day, viewWeekKey);
  save(data);
  refreshSheet();
  if (justEarned) {
    showPointsGain(POINTS_PER_CHECK, cell);
  }
  updateGameUI(justEarned);
}

function refreshSheet() {
  const tasks = getTasks();
  render($sheetBody, tasks, data.checks, onCellClick, viewWeekKey, {
    draftRow: showDraftRow,
    onDraftConfirm(label) {
      data.customTasks = data.customTasks || [];
      data.customTasks.push({ id: "custom-" + Date.now(), label });
      save(data);
      showDraftRow = false;
      refreshSheet();
      animateTableRowsIn();
    },
    onDraftCancel() {
      showDraftRow = false;
      refreshSheet();
    },
    onTaskRemove(taskIndex) {
      const tasksList = getTasks();
      const task = tasksList[taskIndex];
      if (!task) return;
      showConfirmRemoveModal(task.label, taskIndex);
    },
  });
}

function onAddItemClick() {
  showDraftRow = true;
  refreshSheet();
  $sheetBody.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function goPrevWeek() {
  viewWeekKey = getPrevWeekKey(viewWeekKey);
  updateWeekNav();
  refreshSheet();
  animateTableRowsIn();
  refreshScrollTrigger();
}

function goNextWeek() {
  viewWeekKey = getNextWeekKey(viewWeekKey);
  updateWeekNav();
  refreshSheet();
  animateTableRowsIn();
  refreshScrollTrigger();
}

$weekPrev.addEventListener("click", goPrevWeek);
$weekNext.addEventListener("click", goNextWeek);
if ($addItemBtn) $addItemBtn.addEventListener("click", onAddItemClick);

(async function init() {
  data = await load();
  refreshSheet();
  updateGameUI(false);
  updateWeekNav();
  runEntryAnimations();
})();
