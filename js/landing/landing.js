/**
 * FOCO — Animação de entrada na landing (index.html).
 * Itens entram da lateral com GSAP. Não usar em app.html.
 */

(function () {
  if (typeof gsap === "undefined") return;

  const tagline = document.querySelector(".landing__tagline");
  const headline = document.querySelector(".landing__headline");
  const sub = document.querySelector(".landing__sub");
  const cta = document.querySelector(".landing__cta .btn-entrar");

  const els = [
    { el: tagline, x: 180 },
    { el: headline, x: -160 },
    { el: sub, x: 140 },
    { el: cta, x: -120 },
  ].filter((item) => item.el);

  if (!els.length) return;

  els.forEach((item) => {
    gsap.set(item.el, { opacity: 0, x: item.x });
  });

  gsap.to(
    els.map((item) => item.el),
    {
      opacity: 1,
      x: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: "back.out(1.15)",
      delay: 0.4,
      overwrite: "auto",
    }
  );
})();
