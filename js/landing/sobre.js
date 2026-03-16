/**
 * FOCO — Página Sobre: animações ao rolar com GSAP ScrollTrigger.
 * Hero, card e CTAs surgem ao entrar na viewport.
 */
(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  var hero = document.querySelector(".js-sobre-hero");
  var card = document.querySelector(".js-sobre-card");
  var ctas = document.querySelector(".js-sobre-ctas");

  if (!hero && !card && !ctas) return;

  /* Hero: já está no topo, surge ao carregar */
  if (hero) {
    gsap.fromTo(hero, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
  }

  /* Card de conteúdo: surge ao rolar até ele.
   * toggleActions \"restart none none restart\" repete o efeito sempre
   * que o utilizador volta a encontrar o card, sem deixá-lo invisível.
   */
  if (card) {
    gsap.fromTo(
      card,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "restart none none restart",
        },
      }
    );
  }

  /* CTAs: surgem ao chegar no rodapé da página (mesma lógica de restart). */
  if (ctas) {
    gsap.fromTo(
      ctas,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ctas,
          start: "top 92%",
          toggleActions: "restart none none restart",
        },
      }
    );
  }
})();
