/**
 * FOCO — Planilha: renderização e interação das células por dia
 */

import { TASKS, DAYS } from "./state.js";

/** @typedef {{ id: string, label: string }} TaskItem */

/**
 * Retorna a chave da semana atual (segunda como início).
 * @returns {string}
 */
export function getWeekKey() {
  const now = new Date();
  const start = new Date(now);
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(now.getDate() + diff);
  return start.toISOString().slice(0, 10);
}

/**
 * Gera o id da célula no storage.
 * @param {string} weekKey
 * @param {number} taskIndex
 * @param {string} day
 * @returns {string}
 */
export function cellId(weekKey, taskIndex, day) {
  return `${weekKey}-${taskIndex}-${day}`;
}

/**
 * Verifica se a célula está marcada como concluída.
 * @param {Record<string, number>} checks
 * @param {number} taskIndex
 * @param {string} day
 * @returns {boolean}
 */
export function isDone(checks, taskIndex, day) {
  const weekKey = getWeekKey();
  return !!checks[cellId(weekKey, taskIndex, day)];
}

/**
 * Alterna o estado da célula e retorna se passou a estar concluída (ganhou pontos).
 * @param {import("./storage.js").StoredData} data
 * @param {number} taskIndex
 * @param {string} day
 * @param {string} [weekKey] semana a editar (default: semana atual)
 * @returns {boolean} true se acabou de marcar (ganhou 10 pts)
 */
export function toggle(data, taskIndex, day, weekKey = getWeekKey()) {
  const id = cellId(weekKey, taskIndex, day);
  const wasDone = !!data.checks[id];
  data.checks[id] = wasDone ? 0 : 1;
  return !wasDone;
}

/**
 * Formata o período da semana para exibição (ex: "24 Feb – 2 Mar 2025").
 * @param {string} weekKey "YYYY-MM-DD" (segunda-feira)
 * @returns {string}
 */
export function getWeekLabel(weekKey) {
  const start = new Date(weekKey + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(/\./g, "");
  const year = start.getFullYear();
  return `${fmt(start)} – ${fmt(end)} ${year}`;
}

/**
 * Retorna a chave da semana anterior (segunda anterior).
 * @param {string} weekKey
 * @returns {string}
 */
export function getPrevWeekKey(weekKey) {
  const d = new Date(weekKey + "T12:00:00");
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

/**
 * Retorna a chave da semana seguinte.
 * @param {string} weekKey
 * @returns {string}
 */
export function getNextWeekKey(weekKey) {
  const d = new Date(weekKey + "T12:00:00");
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Gera o HTML do neon checkbox para uma célula (Uiverse 00Kubi).
 * @param {boolean} checked
 * @returns {string}
 */
function neonCheckboxHtml(checked) {
  return `
<label class="neon-checkbox">
  <input type="checkbox" ${checked ? "checked" : ""} />
  <div class="neon-checkbox__frame">
    <div class="neon-checkbox__box">
      <div class="neon-checkbox__check-container">
        <svg viewBox="0 0 24 24" class="neon-checkbox__check">
          <path d="M3,12.5l7,7L21,5"></path>
        </svg>
      </div>
      <div class="neon-checkbox__glow"></div>
      <div class="neon-checkbox__borders">
        <span></span><span></span><span></span><span></span>
      </div>
    </div>
    <div class="neon-checkbox__effects">
      <div class="neon-checkbox__particles">
        <span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span>
      </div>
      <div class="neon-checkbox__rings">
        <div class="ring"></div>
        <div class="ring"></div>
        <div class="ring"></div>
      </div>
      <div class="neon-checkbox__sparks">
        <span></span><span></span><span></span><span></span>
      </div>
    </div>
  </div>
</label>`;
}

/**
 * Renderiza a tabela para a semana indicada e vincula o evento change.
 * @param {HTMLTableSectionElement} tbody
 * @param {TaskItem[]} tasks - lista de atividades (padrão + customizadas)
 * @param {Record<string, number>} checks
 * @param {(taskIndex: number, day: string, cell: HTMLTableCellElement) => void} onCellChange
 * @param {string} [viewWeekKey] semana a exibir (default: semana atual)
 * @param {{
 *   draftRow?: boolean,
 *   onDraftConfirm?: (label: string) => void,
 *   onDraftCancel?: () => void,
 *   onTaskRemove?: (taskIndex: number) => void
 * }} [opts]
 */
export function render(tbody, tasks, checks, onCellChange, viewWeekKey = getWeekKey(), opts = {}) {
  const { draftRow = false, onDraftConfirm, onDraftCancel, onTaskRemove } = opts;

  tbody.innerHTML = tasks
    .map((task, taskIndex) => {
      const cells = DAYS.map((day) => {
        const done = !!checks[cellId(viewWeekKey, taskIndex, day)];
        return `<td class="cell cell-day" data-task-index="${taskIndex}" data-day="${day}" role="gridcell">
        ${neonCheckboxHtml(done)}
      </td>`;
      }).join("");

      const activityClass = task.id.startsWith("custom-") ? "cell-label cell-label-custom" : "cell-label";
      const lastCol = onTaskRemove
        ? `<td class="cell cell-add-col-empty">
        <button type="button" class="btn-remove-item" data-task-index="${taskIndex}" data-task-label="${escapeHtml(task.label)}" aria-label="Remover atividade ${escapeHtml(task.label)}">
          <span class="btn-remove-item__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </span>
        </button>
      </td>`
        : `<td class="cell cell-add-col-empty" aria-hidden="true"></td>`;

      return `
      <tr>
        <td class="cell ${activityClass}" data-activity="${escapeHtml(task.id)}">${escapeHtml(task.label)}</td>
        ${cells}
        ${lastCol}
      </tr>
    `;
    })
    .join("");

  if (draftRow && onDraftConfirm && onDraftCancel) {
    const draftCells = DAYS.map((day) => {
      return `<td class="cell cell-day cell-day-draft" aria-hidden="true">
        <span class="cell-day-draft-placeholder" aria-hidden="true"></span>
      </td>`;
    }).join("");
    tbody.insertAdjacentHTML("beforeend", `
      <tr class="sheet-draft-row" data-draft="true">
        <td class="cell cell-label-draft">
          <input type="text" class="cell-label-input" id="sheet-draft-input" placeholder="Nome da atividade" maxlength="80" autocomplete="off" />
        </td>
        ${draftCells}
        <td class="cell cell-add-col-empty" aria-hidden="true"></td>
      </tr>
    `);

    const input = tbody.querySelector("#sheet-draft-input");
    if (input) {
      input.focus();
      const confirm = () => {
        const label = input.value.trim();
        if (label) onDraftConfirm(label);
        else onDraftCancel();
      };
      const cancel = () => onDraftCancel();
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          confirm();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
      });
      input.addEventListener("blur", () => {
        setTimeout(confirm, 150);
      });
    }
  }

  tbody.querySelectorAll(".cell-day:not(.cell-day-draft) .neon-checkbox input").forEach((input) => {
    const cell = input.closest(".cell-day");
    const taskIndex = parseInt(cell.dataset.taskIndex, 10);
    const day = cell.dataset.day;
    input.addEventListener("change", () => onCellChange(taskIndex, day, /** @type {HTMLTableCellElement} */ (cell)));
  });

  if (onTaskRemove) {
    tbody.querySelectorAll(".btn-remove-item").forEach((btn) => {
      const taskIndex = parseInt(btn.dataset.taskIndex, 10);
      btn.addEventListener("click", () => onTaskRemove(taskIndex));
    });
  }
}
