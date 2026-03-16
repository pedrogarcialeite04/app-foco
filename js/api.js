/**
 * FOCO — Cliente da API (auth + rotina).
 * Base URL: window.FOCO_API_URL ou fallback para mesma origem /api (proxy) ou localhost:3001.
 */
const TOKEN_KEY = "foco-token";
const USER_KEY = "foco-user";

function getBaseUrl() {
  if (typeof window !== "undefined" && window.FOCO_API_URL) return window.FOCO_API_URL;
  if (typeof window !== "undefined" && window.location.port === "5500") return "http://localhost:3001";
  return ""; // mesma origem (ex.: /api no mesmo host)
}

function apiBase() {
  const origin = getBaseUrl() || (typeof window !== "undefined" ? window.location.origin : "");
  return origin.endsWith("/api") ? origin.slice(0, -4) : origin;
}

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (_) {}
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: { id, name, email }, token: string }>}
 */
export async function login(email, password) {
  const res = await fetch(`${apiBase()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Falha ao entrar");
  return data;
}

/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: { id, name, email }, token: string }>}
 */
export async function register(name, email, password) {
  const res = await fetch(`${apiBase()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Falha ao cadastrar");
  return data;
}

/**
 * Limpa sessão local e notifica que o usuário foi deslogado (token inválido ou conta removida).
 */
function clearSessionAndNotify() {
  setToken(null);
  setStoredUser(null);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("foco-unauthorized"));
  }
}

/**
 * @returns {Promise<{ checks: Object, customTasks: Array, removedTaskIds: Array }>}
 */
export async function getRotina() {
  const res = await fetch(`${apiBase()}/api/rotina`, { headers: authHeaders() });
  if (res.status === 401) {
    clearSessionAndNotify();
    return null;
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Erro ao carregar rotina");
  return data;
}

/**
 * @param {{ checks: Object, customTasks: Array, removedTaskIds: Array }} payload
 */
export async function putRotina(payload) {
  const res = await fetch(`${apiBase()}/api/rotina`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (res.status === 401) {
    clearSessionAndNotify();
    throw new Error("Sessão expirada ou conta não encontrada. Faça login novamente.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Erro ao salvar rotina");
  return data;
}

export { getToken, setToken, getStoredUser, setStoredUser };
