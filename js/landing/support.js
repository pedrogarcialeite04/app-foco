/**
 * FOCO — Modal de Suporte (landing).
 * Envia mensagens para pedrogarciaa123rd@gmail.com via Formspree.
 *
 * Configuração: crie um formulário em https://formspree.io com o email
 * pedrogarciaa123rd@gmail.com e substitua FORMSPREE_FORM_ID pelo ID do formulário.
 */

(function () {
  const FORMSPREE_FORM_ID = "mzdayqjl";
  const FORMSPREE_URL = "https://formspree.io/f/" + FORMSPREE_FORM_ID;

  const overlay = document.getElementById("support-overlay");
  const box = overlay?.querySelector(".support-box");
  const openBtn = document.querySelector(".js-open-suporte");
  const closeBtn = document.querySelector(".js-close-suporte");
  const form = document.querySelector(".js-support-form");
  const formWrap = document.querySelector(".support-box__form-wrap");
  const loaderWrap = document.querySelector(".support-box__loader-wrap");
  const successWrap = document.querySelector(".support-box__success-wrap");

  if (!overlay || !openBtn || !form) return;

  var savedScrollY = 0;

  function openModal() {
    resetState();
    savedScrollY = window.scrollY || window.pageYOffset;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    // Bloqueia apenas o scroll de fundo para o modal de suporte,
    // sem travar o body em posição fixa (melhor para touch e desktop).
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    // Mantém posição de scroll; como não fixamos o body,
    // não precisamos restaurar manualmente.
    resetState();
    openBtn?.focus();
  }

  function resetState() {
    box?.classList.remove("support-box--sending", "support-box--success");
    form.reset();
    if (loaderWrap) {
      loaderWrap.hidden = true;
      loaderWrap.setAttribute("aria-busy", "false");
    }
    if (successWrap) successWrap.hidden = true;
  }

  function setSending(active) {
    if (active) {
      box?.classList.add("support-box--sending");
      box?.classList.remove("support-box--success");
      if (loaderWrap) {
        loaderWrap.hidden = false;
        loaderWrap.setAttribute("aria-busy", "true");
      }
      if (successWrap) successWrap.hidden = true;
    } else {
      box?.classList.remove("support-box--sending");
      if (loaderWrap) {
        loaderWrap.hidden = true;
        loaderWrap.setAttribute("aria-busy", "false");
      }
    }
  }

  function setSuccess() {
    box?.classList.remove("support-box--sending");
    box?.classList.add("support-box--success");
    if (loaderWrap) {
      loaderWrap.hidden = true;
      loaderWrap.setAttribute("aria-busy", "false");
    }
    if (successWrap) successWrap.hidden = false;
  }

  function showLoaderWithGSAP() {
    if (typeof gsap === "undefined") {
      setSending(true);
      return;
    }
    setSending(true);
    const loader = loaderWrap?.querySelector(".support-loader");
    if (loader) {
      gsap.set(loader, { scale: 0, opacity: 0 });
      gsap.to(loader, {
        scale: 1,
        opacity: 1,
        duration: 0.35,
        ease: "back.out(1.2)",
      });
    }
  }

  function hideLoaderShowSuccessGSAP() {
    const loader = loaderWrap?.querySelector(".support-loader");
    if (typeof gsap !== "undefined" && loader) {
      gsap.to(loader, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: function () {
          setSuccess();
          const successEl = successWrap?.querySelector("p");
          if (successEl) {
            gsap.fromTo(
              successWrap,
              { opacity: 0, scale: 0.95 },
              { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }
            );
          }
        },
      });
    } else {
      setSuccess();
    }
  }

  openBtn.addEventListener("click", function (e) {
    e.preventDefault();
    openModal();
  });

  closeBtn?.addEventListener("click", closeModal);

  /** Abre o modal ao carregar a página se o URL tiver #suporte (ex.: vindo de sobre.html). */
  if (window.location.hash === "#suporte") {
    openModal();
  }

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });

  overlay.querySelector(".support-box")?.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay?.classList.contains("is-open")) closeModal();
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (FORMSPREE_FORM_ID === "YOUR_FORMSPREE_FORM_ID") {
      alert(
        "Configure o Formspree: em js/landing/support.js substitua YOUR_FORMSPREE_FORM_ID pelo ID do seu formulário em formspree.io (email: pedrogarciaa123rd@gmail.com)."
      );
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const fd = new FormData(form);
    fd.set("_replyto", fd.get("email") || "");
    fd.append("_subject", "FOCO Suporte: " + (fd.get("subject") || ""));

    showLoaderWithGSAP();

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setTimeout(function () {
          hideLoaderShowSuccessGSAP();
        }, 1200);
      } else {
        const data = await res.json().catch(function () { return {}; });
        setSending(false);
        alert(
          data.errors?.map(function (err) { return err.message; }).join("\n") ||
            "Falha ao enviar. Tente mais tarde."
        );
      }
    } catch (err) {
      setSending(false);
      alert("Erro de rede. Verifique a ligação e tente novamente.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
