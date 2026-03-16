/**
 * FOCO — Animações GSAP (entrada, scroll e feedback)
 * ScrollTrigger na tabela: efeito de entrada uma vez ao rolar; estado final permanece durante toda a sessão.
 */

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

/**
 * Configura ScrollTrigger na tabela: animação de entrada toca uma vez ao entrar na viewport
 * e o resultado fica permanente (não reverte ao rolar nem após interações).
 */
function setupScrollAnimations() {
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  /* Timeline da tabela: entrada do .main + cabeçalho + linhas em cascata */
  const tlTable = gsap.timeline({ paused: true });
  tlTable.fromTo(
    ".main",
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" }
  );
  tlTable.from(
    ".app-sheet .sheet thead tr",
    {
      opacity: 0,
      y: -12,
      duration: 0.4,
      ease: "power2.out",
    },
    "-=0.4"
  );
  tlTable.from(
    ".app-sheet .sheet tbody tr",
    {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.06,
      ease: "power2.out",
    },
    "-=0.25"
  );

  /* ScrollTrigger: uma única execução ao entrar na zona; estado final fica permanente */
  const stTable = ScrollTrigger.create({
    trigger: ".app-sheet",
    start: "top 85%",
    end: "bottom 15%",
    animation: tlTable,
    toggleActions: "play none none none",
    once: true, /* dispara uma vez; depois o trigger é removido e a tabela permanece animada */
  });

  /* Se a tabela já estiver na zona do trigger no load, toca a animação imediatamente */
  ScrollTrigger.refresh();
  if (stTable && stTable.progress >= 0.01) {
    tlTable.play();
  }

  /* Timeline do footer: idem, aplicável quantas vezes rolar. */
  const tlFooter = gsap.timeline({ paused: true });
  tlFooter.fromTo(
    ".footer",
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
  );

  ScrollTrigger.create({
    trigger: ".footer",
    start: "top 92%",
    end: "top 50%",
    animation: tlFooter,
    toggleActions: "play reverse play reverse",
  });

  ScrollTrigger.refresh();
}

/**
 * Recalcula posições do ScrollTrigger (útil após troca de semana ou mudanças no DOM da tabela).
 */
export function refreshScrollTrigger() {
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.refresh();
  }
}

/**
 * Entrada da página: header e painel no load; ScrollTrigger cuida da tabela e do footer ao rolar.
 */
export function runEntryAnimations() {
  if (!gsap) return;

  /* Estado inicial das seções que entram no scroll (permite repetir ao rolar) */
  gsap.set([".main", ".footer"], { opacity: 0, y: 24 });

  /* Entrada do header e do painel (topo da página) */
  gsap.to(".app-header", {
    opacity: 1,
    y: 0,
    duration: 0.85,
    ease: "power3.out",
    overwrite: "auto",
  });

  gsap.to(".app-game-panel", {
    opacity: 1,
    y: 0,
    duration: 0.7,
    delay: 0.12,
    ease: "power3.out",
    overwrite: "auto",
  });

  if (ScrollTrigger) {
    setupScrollAnimations();
  } else {
    gsap.to(".main", { opacity: 1, y: 0, duration: 0.5, delay: 0.25 });
    gsap.from(".app-sheet .sheet tbody tr", {
      opacity: 0,
      x: -24,
      duration: 0.5,
      stagger: 0.06,
      delay: 0.35,
      ease: "power3.out",
    });
    gsap.to(".footer", { opacity: 1, y: 0, duration: 0.5, delay: 0.5 });
  }
}

/**
 * Efeito de "pop" ao ganhar pontos.
 * @param {HTMLElement} element
 */
export function animatePointsPop(element) {
  if (!gsap || !element) return;

  gsap.fromTo(
    element,
    { scale: 1.25 },
    { scale: 1, duration: 0.4, ease: "back.out(1.4)" }
  );
}

/**
 * Anima as linhas da tabela ao trocar de semana (entrada suave).
 */
export function animateTableRowsIn() {
  if (!gsap) return;

  gsap.from(".app-sheet .sheet tbody tr", {
    opacity: 0,
    y: 12,
    duration: 0.4,
    stagger: 0.04,
    ease: "power2.out",
  });
}
