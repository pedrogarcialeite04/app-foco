(function () {
  "use strict";

  const DAYS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
  const STORAGE_KEY = "foco-rotina";

  const $body = document.getElementById("sheet-body");
  const $newTask = document.getElementById("new-task");
  const $addTask = document.getElementById("add-task");

  let data = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.tasks) && typeof parsed.checks === "object") {
          return parsed;
        }
      }
    } catch (_) {}
    return { tasks: [], checks: {} };
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getWeekKey() {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    return start.toISOString().slice(0, 10);
  }

  function cellId(taskIndex, day) {
    return `${getWeekKey()}-${taskIndex}-${day}`;
  }

  function isDone(taskIndex, day) {
    return !!data.checks[cellId(taskIndex, day)];
  }

  function toggle(taskIndex, day) {
    const id = cellId(taskIndex, day);
    data.checks[id] = data.checks[id] ? 0 : 1;
    save();
    render();
  }

  function addTask(label) {
    const name = (label || "").trim();
    if (!name) return;
    data.tasks.push(name);
    save();
    render();
    $newTask.value = "";
    $newTask.focus();
  }

  function removeTask(index) {
    data.tasks.splice(index, 1);
    const week = getWeekKey();
    const newChecks = {};
    for (const [key, val] of Object.entries(data.checks)) {
      const parts = key.split("-");
      if (parts.length < 3) continue;
      const keyTaskIndex = parseInt(parts[parts.length - 2], 10);
      const day = parts[parts.length - 1];
      if (keyTaskIndex === index) continue;
      const newIndex = keyTaskIndex > index ? keyTaskIndex - 1 : keyTaskIndex;
      const prefix = parts.slice(0, -2).join("-");
      newChecks[prefix + "-" + newIndex + "-" + day] = val;
    }
    data.checks = newChecks;
    save();
    render();
  }

  function render() {
    if (data.tasks.length === 0) {
      $body.innerHTML =
        '<tr><td colspan="8" class="empty-message"><strong>Nenhuma tarefa ainda</strong>Adicione uma tarefa acima para começar a registrar sua rotina.</td></tr>';
      return;
    }

    $body.innerHTML = data.tasks
      .map((task, taskIndex) => {
        const cells = DAYS.map(
          (day) =>
            `<td class="cell cell-day ${isDone(taskIndex, day) ? "done" : ""}" 
                data-task="${taskIndex}" 
                data-day="${day}" 
                tabindex="0"
                role="gridcell"
                aria-selected="${isDone(taskIndex, day)}"
                title="Clique para ${isDone(taskIndex, day) ? "desmarcar" : "marcar"} como concluído"></td>`
        ).join("");

        return `
          <tr>
            <td class="cell cell-label">${escapeHtml(task)}</td>
            ${cells}
          </tr>
        `;
      })
      .join("");

    $body.querySelectorAll(".cell-day").forEach((cell) => {
      cell.addEventListener("click", onCellClick);
      cell.addEventListener("keydown", onCellKeydown);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function onCellClick(e) {
    const cell = e.target.closest(".cell-day");
    if (!cell) return;
    const taskIndex = parseInt(cell.dataset.task, 10);
    const day = cell.dataset.day;
    toggle(taskIndex, day);
  }

  function onCellKeydown(e) {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    e.target.click();
  }

  $addTask.addEventListener("click", () => addTask($newTask.value));
  $newTask.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask($newTask.value);
  });

  render();
})();
