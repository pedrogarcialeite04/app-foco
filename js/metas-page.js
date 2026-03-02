/**
 * FOCO — Página Definir metas (metas.html).
 * Mantém uma lista de metas em localStorage (foco-metas) e, quando o usuário está logado,
 * sincroniza com a API (backend) para não depender de localhost nem apenas do navegador.
 * Avisos e confirmações são estilizados (toast e modais), sem window.alert/confirm/prompt.
 */
(async function () {
  const METAS_KEY = "foco-metas";
  const LEGACY_KEY = "foco-meta";

  const input = document.getElementById("metas-page-input");
  const addBtn = document.querySelector(".js-metas-page-add");
  const listEl = document.getElementById("metas-list");
  const feedbackEl = document.querySelector(".js-metas-feedback");

  const toastEl = document.getElementById("metas-toast");
  const toastMessageEl = document.getElementById("metas-toast-message");
  const confirmOverlay = document.getElementById("metas-confirm-overlay");
  const confirmMessageEl = document.getElementById("metas-confirm-message");
  const confirmCancelBtn = document.querySelector(".js-metas-confirm-cancel");
  const confirmOkBtn = document.querySelector(".js-metas-confirm-ok");
  const editOverlay = document.getElementById("metas-edit-overlay");
  const editInputEl = document.getElementById("metas-edit-input");
  const editCancelBtn = document.querySelector(".js-metas-edit-cancel");
  const editOkBtn = document.querySelector(".js-metas-edit-ok");
  let toastTimeout = null;

  /**
   * Backend: deteta token e base URL da API (mesma lógica de api.js, mas sem imports).
   */
  function getToken() {
    try {
      return localStorage.getItem("foco-token") || null;
    } catch {
      return null;
    }
  }

  function getApiBase() {
    if (typeof window === "undefined") return "";
    if (window.FOCO_API_URL) return window.FOCO_API_URL;
    if (window.location.port === "5500") return "http://localhost:3001";
    return window.location.origin || "";
  }

  function metasAuthHeaders() {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * @typedef {{ id: string, text: string, done: boolean, createdAt: string }} MetaItem
   */

  /** @returns {MetaItem[]} */
  function loadMetasFromLocal() {
    try {
      const raw = localStorage.getItem(METAS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
      // Migração simples do formato antigo (texto único)
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy && legacy.trim()) {
        const metas = [
          {
            id: String(Date.now()),
            text: legacy.trim(),
            done: false,
            createdAt: new Date().toISOString(),
          },
        ];
        saveMetasToLocal(metas);
        localStorage.removeItem(LEGACY_KEY);
        return metas;
      }
    } catch (_) {}
    return [];
  }

  /** @param {MetaItem[]} metas */
  function saveMetasToLocal(metas) {
    try {
      localStorage.setItem(METAS_KEY, JSON.stringify(metas));
      localStorage.removeItem(LEGACY_KEY);
    } catch (_) {}
  }

  /**
   * Carrega metas: se houver token tenta API, senão usa apenas localStorage.
   * Mesmo com falha na API mantém funcional no navegador.
   * @returns {Promise<MetaItem[]>}
   */
  async function loadMetas() {
    const token = getToken();
    if (!token) {
      return loadMetasFromLocal();
    }

    try {
      const res = await fetch(`${getApiBase()}/api/metas`, {
        method: "GET",
        headers: metasAuthHeaders(),
      });
      if (!res.ok) throw new Error("Erro ao carregar metas");
      const data = await res.json().catch(() => ({ items: [] }));
      const items = Array.isArray(data.items) ? data.items : [];
      saveMetasToLocal(items);
      return items;
    } catch (_) {
      // Falha na API → continua funcional com os dados locais.
      return loadMetasFromLocal();
    }
  }

  /**
   * Salva metas: sempre em localStorage e, se logado, também no backend.
   * @param {MetaItem[]} metas
   */
  function saveMetas(metas) {
    saveMetasToLocal(metas);
    const token = getToken();
    if (!token) return;

    // Sincronização assíncrona, sem bloquear a UI.
    fetch(`${getApiBase()}/api/metas`, {
      method: "PUT",
      headers: metasAuthHeaders(),
      body: JSON.stringify({ items: metas }),
    }).catch(() => {});
  }

  /**
   * Notifica o painel de pontos (metas-main) para somar bônus e persistir (localStorage + API).
   * @param {number} delta - valor a somar (ex.: +30 ao concluir, -30 ao reabrir)
   */
  function notifyMetaBonus(delta) {
    if (typeof delta !== "number" || !Number.isFinite(delta)) return;
    window.dispatchEvent(new CustomEvent("foco-apply-meta-bonus", { detail: { delta } }));
  }

  /**
   * Mostra aviso estilizado (toast) na página, sem notificação do sistema.
   * @param {string} message
   * @param {boolean} [isError]
   */
  function showFeedback(message, isError) {
    if (toastTimeout) clearTimeout(toastTimeout);
    if (!toastEl || !toastMessageEl) return;
    toastMessageEl.textContent = message;
    toastEl.classList.toggle("is-error", !!isError);
    toastEl.removeAttribute("hidden");
    toastEl.setAttribute("data-visible", "true");
    if (feedbackEl) {
      feedbackEl.textContent = message;
      feedbackEl.hidden = false;
      feedbackEl.classList.toggle("is-error", !!isError);
    }
    toastTimeout = setTimeout(function () {
      toastEl.setAttribute("data-visible", "false");
      if (feedbackEl) feedbackEl.hidden = true;
      toastTimeout = null;
      setTimeout(function () {
        toastEl.setAttribute("hidden", "");
      }, 320);
    }, 2500);
  }

  /**
   * Modal de confirmação estilizado (substitui window.confirm).
   * @param {string} message
   * @returns {Promise<boolean>}
   */
  function showConfirm(message) {
    return new Promise(function (resolve) {
      if (!confirmOverlay || !confirmMessageEl) {
        resolve(false);
        return;
      }
      confirmMessageEl.textContent = message;
      confirmOverlay.removeAttribute("hidden");
      confirmOverlay.setAttribute("aria-hidden", "false");
      confirmOverlay.setAttribute("data-visible", "true");

      function onEscape(e) {
        if (e.key === "Escape") {
          teardown();
          close(false);
        }
      }

      function teardown() {
        window.removeEventListener("keydown", onEscape);
      }

      function close(result) {
        teardown();
        confirmOverlay.setAttribute("data-visible", "false");
        confirmOverlay.setAttribute("aria-hidden", "true");
        confirmOverlay.setAttribute("hidden", "");
        resolve(result);
      }

      confirmCancelBtn && confirmCancelBtn.addEventListener("click", function () {
        close(false);
      }, { once: true });
      confirmOkBtn && confirmOkBtn.addEventListener("click", function () {
        close(true);
      }, { once: true });
      confirmOverlay.addEventListener("click", function (e) {
        if (e.target === confirmOverlay) close(false);
      }, { once: true });
      window.addEventListener("keydown", onEscape);
    });
  }

  /**
   * Modal de edição com input (substitui window.prompt).
   * @param {string} defaultValue
   * @returns {Promise<string|null>} texto editado ou null se cancelar
   */
  function showEdit(defaultValue) {
    return new Promise(function (resolve) {
      if (!editOverlay || !editInputEl) {
        resolve(null);
        return;
      }
      editInputEl.value = defaultValue;
      editOverlay.removeAttribute("hidden");
      editOverlay.setAttribute("aria-hidden", "false");
      editOverlay.setAttribute("data-visible", "true");
      editInputEl.focus();

      function onEscape(e) {
        if (e.key === "Escape") {
          teardown();
          close(null);
        }
      }

      function teardown() {
        window.removeEventListener("keydown", onEscape);
      }

      function close(result) {
        teardown();
        editOverlay.setAttribute("data-visible", "false");
        editOverlay.setAttribute("aria-hidden", "true");
        editOverlay.setAttribute("hidden", "");
        resolve(result);
      }

      editCancelBtn && editCancelBtn.addEventListener("click", function () {
        close(null);
      }, { once: true });
      editOkBtn && editOkBtn.addEventListener("click", function () {
        close(editInputEl.value.trim());
      }, { once: true });
      editOverlay.addEventListener("click", function (e) {
        if (e.target === editOverlay) close(null);
      }, { once: true });
      window.addEventListener("keydown", onEscape);
    });
  }

  /** @param {MetaItem[]} metas */
  function renderMetas(metas) {
    if (!listEl) return;
    if (!metas.length) {
      listEl.innerHTML =
        '<p class="metas-section__empty">Nenhuma meta criada ainda. Adicione a primeira acima.</p>';
      return;
    }
    listEl.innerHTML = metas
      .map(function (meta) {
        const doneClass = meta.done ? " meta-card--done" : "";
        const badge = meta.done ? '<span class="meta-card__badge">Concluída</span>' : "";
        return (
          '<article class="meta-card' +
          doneClass +
          '" data-id="' +
          meta.id +
          '">' +
          '<div class="meta-card__header">' +
          "<h3 class=\"meta-card__title\">Meta</h3>" +
          badge +
          "</div>" +
          '<p class="meta-card__text">' +
          escapeHtml(meta.text) +
          "</p>" +
          '<div class="meta-card__actions">' +
          '<button type="button" class="meta-card__btn" data-action="toggle">' +
          (meta.done ? "Reabrir" : "Concluir") +
          "</button>" +
          '<button type="button" class="meta-card__btn" data-action="edit">Editar</button>' +
          '<button type="button" class="meta-card__btn meta-card__btn--danger" data-action="delete">Excluir</button>' +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  let metas = await loadMetas();
  renderMetas(metas);

  if (addBtn && input) {
    addBtn.addEventListener("click", function () {
      const value = input.value.trim();
      if (!value) {
        showFeedback("Escreva uma meta antes de adicionar.", true);
        return;
      }
      const item = {
        id: String(Date.now()),
        text: value,
        done: false,
        createdAt: new Date().toISOString(),
      };
      metas.push(item);
      saveMetas(metas);
      renderMetas(metas);
      input.value = "";
      showFeedback("Meta adicionada.", false);
    });
  }

  if (listEl) {
    listEl.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const card = btn.closest(".meta-card");
      if (!card) return;
      const id = card.getAttribute("data-id");
      if (!id) return;

      const index = metas.findIndex(function (m) {
        return m.id === id;
      });
      if (index === -1) return;

      if (action === "toggle") {
        const wasDone = metas[index].done;
        metas[index].done = !metas[index].done;

        if (!wasDone && metas[index].done) {
          notifyMetaBonus(30);
          showFeedback("Parabéns! Você concluiu uma meta e ganhou +30 pontos. Continue avançando.", false);

          // Pequena celebração visual no card concluído
          card.classList.add("meta-card--celebrate");
          setTimeout(function () {
            card.classList.remove("meta-card--celebrate");
          }, 900);
        } else if (wasDone && !metas[index].done) {
          notifyMetaBonus(-30);
          showFeedback("Meta reaberta. Pontos ajustados.", false);
        }

        saveMetas(metas);
        renderMetas(metas);
      } else if (action === "edit") {
        const current = metas[index].text;
        showEdit(current).then(function (next) {
          if (next != null) {
            metas[index].text = next || current;
            saveMetas(metas);
            renderMetas(metas);
            showFeedback("Meta atualizada.", false);
          }
        });
      } else if (action === "delete") {
        showConfirm("Tem certeza que deseja excluir esta meta?").then(function (ok) {
          if (!ok) return;

          if (metas[index].done) {
            notifyMetaBonus(-30);
          }

          metas.splice(index, 1);
          saveMetas(metas);
          renderMetas(metas);
          showFeedback("Meta excluída.", false);
        });
      }
    });
  }
})();
