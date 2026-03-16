/**
 * FOCO — Página Informações: animações ao rolar com GSAP ScrollTrigger.
 * As caixas de conteúdo (info-section) e o CTA surgem ao entrar na viewport.
 */
(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  var header = document.querySelector(".info__header");
  var sections = gsap.utils.toArray(".info-section");
  var cta = document.querySelector(".info__cta");

  /* Header: já está no topo, surge ao carregar */
  if (header) {
    gsap.fromTo(header, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
  }

  /* Cada secção (caixa) surge ao rolar até ela.
   * Usamos toggleActions \"restart none none restart\" para:
   * - onEnter:    reiniciar animação (fade-in) ao entrar vindo de cima
   * - onLeave:    não fazer nada
   * - onEnterBack:reiniciar animação ao voltar vindo de baixo
   * - onLeaveBack:não fazer nada (não some da tela enquanto ainda visível)
   */
  sections.forEach(function (section) {
    gsap.fromTo(
      section,
      { opacity: 0, y: 44 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        delay: 0.05,
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
          toggleActions: "restart none none restart",
        },
      }
    );
  });

  /* CTA final surge ao chegar nele (mesma lógica de restart). */
  if (cta) {
    gsap.fromTo(
      cta,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cta,
          start: "top 92%",
          toggleActions: "restart none none restart",
        },
      }
    );
  }
})();
