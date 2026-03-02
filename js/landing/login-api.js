/**
 * FOCO — Integração login/registro com a API.
 * Intercepta envio dos formulários, chama o backend e redireciona para app.html com sessão.
 */
import { login, register, setToken, setStoredUser } from "../api.js";

(function init() {
  const loginForm = document.querySelector(".js-login-form");
  const registerForm = document.querySelector(".js-register-form");

  function goToApp() {
    window.location.href = "app.html";
  }

  function showError(el, message) {
    let msg = el.querySelector(".js-login-error");
    if (!msg) {
      msg = document.createElement("p");
      msg.className = "js-login-error";
      msg.setAttribute("role", "alert");
      msg.style.color = "var(--color-danger, #f87171)";
      msg.style.marginTop = "0.5rem";
      msg.style.fontSize = "0.875rem";
      el.appendChild(msg);
    }
    msg.textContent = message;
  }

  function clearError(form) {
    const msg = form?.querySelector(".js-login-error");
    if (msg) msg.remove();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearError(loginForm);
      const email = loginForm.querySelector("#login-email")?.value;
      const password = loginForm.querySelector("#login-password")?.value;
      if (!email?.trim() || !password) {
        showError(loginForm, "Preencha email e senha.");
        return;
      }
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        const { user, token } = await login(email, password);
        setToken(token);
        setStoredUser(user);
        goToApp();
      } catch (err) {
        showError(loginForm, err.message || "Falha ao entrar.");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearError(registerForm);
      const name = registerForm.querySelector("#reg-name")?.value;
      const email = registerForm.querySelector("#reg-email")?.value;
      const password = registerForm.querySelector("#reg-password")?.value;
      const repeat = registerForm.querySelector("#reg-repeat")?.value;
      if (!name?.trim() || !email?.trim() || !password) {
        showError(registerForm, "Preencha todos os campos.");
        return;
      }
      if (password.length < 6) {
        showError(registerForm, "Senha deve ter no mínimo 6 caracteres.");
        return;
      }
      if (password !== repeat) {
        showError(registerForm, "As senhas não coincidem.");
        return;
      }
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        const { user, token } = await register(name, email, password);
        setToken(token);
        setStoredUser(user);
        goToApp();
      } catch (err) {
        showError(registerForm, err.message || "Falha ao cadastrar.");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
})();
