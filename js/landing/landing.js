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

/**
 * Pré-aquece a API assim que a landing carregar,
 * para que o primeiro login não pegue o backend/Mongo "frio".
 */
(function warmupApi() {
  try {
    if (typeof window === "undefined" || typeof fetch === "undefined") return;

    let base = "";
    if (window.FOCO_API_URL) {
      base = window.FOCO_API_URL;
    } else if (window.location.port === "5500") {
      base = "http://localhost:3001";
    } else {
      base = window.location.origin || "";
    }

    if (!base) return;

    const url = `${base.replace(/\/$/, "")}/health`;
    fetch(url, { method: "GET", cache: "no-store", mode: "cors" }).catch(() => {});
  } catch (_) {}
})();
