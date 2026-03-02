/**
 * FOCO — Menu hambúrguer (drawer).
 * Controla abertura/fecho do menu lateral. Os itens do menu são links (Definir metas → metas.html, Rotina → app.html).
 */
(function () {
  const toggleBtn = document.getElementById("app-menu-toggle");
  const overlay = document.getElementById("app-menu-overlay");
  const drawer = document.getElementById("app-menu-drawer");

  function isMenuOpen() {
    return drawer && drawer.classList.contains("is-open");
  }

  function openMenu() {
    if (!drawer || !overlay || !toggleBtn) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    toggleBtn.setAttribute("aria-expanded", "true");
    toggleBtn.setAttribute("aria-label", "Fechar menu");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!drawer || !overlay || !toggleBtn) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", "Abrir menu");
    document.body.style.overflow = "";
  }

  function toggleMenu() {
    if (isMenuOpen()) closeMenu();
    else openMenu();
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleMenu);
  }

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  document.querySelectorAll(".js-app-menu-toggle").forEach(function (el) {
    if (el !== overlay) {
      el.addEventListener("click", toggleMenu);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isMenuOpen()) {
      closeMenu();
    }
  });

  window.addEventListener("foco-unauthorized", function () {
    window.location.href = "index.html";
  });
})();
