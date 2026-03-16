/**
 * FOCO — Modal de login/registro na landing.
 * Abre ao clicar em Log In ou Entrar; alterna entre Entrar e Cadastre-se.
 *
 * Segurança/UX: ao abrir o modal, a view é sempre resetada para login.
 * Assim, "Entrar" / "Log In" nunca levam à área de cadastro, evitando
 * submissão acidental do formulário errado ou confusão de fluxo.
 */

(function () {
  const overlay = document.getElementById("login-overlay");
  const openButtons = document.querySelectorAll(".js-open-login");
  const closeBtn = document.querySelector(".js-close-login");
  const showRegister = document.querySelector(".js-show-register");
  const showLogin = document.querySelector(".js-show-login");
  const loginView = document.querySelector('[data-login-view="login"]');
  const registerView = document.querySelector('[data-login-view="register"]');

  if (!overlay || !openButtons.length) return;

  /** Garante que a view ativa é sempre a de login (estado inicial seguro). */
  function resetToLoginView() {
    registerView?.classList.remove("is-active");
    loginView?.classList.add("is-active");
  }

  function showView(view) {
    if (view === "register") {
      loginView?.classList.remove("is-active");
      registerView?.classList.add("is-active");
    } else {
      registerView?.classList.remove("is-active");
      loginView?.classList.add("is-active");
    }
  }

  var savedScrollY = 0;

  function openModal() {
    resetToLoginView();
    savedScrollY = window.scrollY || window.pageYOffset;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    // Bloqueia apenas o scroll de fundo, sem prender o body em posição fixa.
    // Isso evita travamentos e comportamentos estranhos em mobile e desktop.
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    // Mantém a posição de scroll atual; o body nunca foi "fixado",
    // então não precisamos reposicionar manualmente.
    resetToLoginView();
    openButtons[0]?.focus();
  }

  /* Modal só abre ao clicar em Entrar / Log In / Cadastre-se — não abre automaticamente ao carregar ou ao reiniciar a página. */

  openButtons.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn?.addEventListener("click", closeModal);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay?.classList.contains("is-open")) closeModal();
  });

  showRegister?.addEventListener("click", function (e) {
    e.preventDefault();
    showView("register");
  });

  showLogin?.addEventListener("click", function (e) {
    e.preventDefault();
    showView("login");
  });

  overlay.querySelector(".login-box")?.addEventListener("click", function (e) {
    e.stopPropagation();
  });
})();
