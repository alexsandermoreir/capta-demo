// Utilitários da demonstração: escape de HTML, formatação, ícones, diálogo, avisos e estado local (localStorage).

export const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const digitos = (v) => String(v ?? "").replace(/\D/g, "");
export const cnpjFmt = (d) => { d = digitos(d); return d.length === 14 ? `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}` : d; };
const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const moeda = (v) => MOEDA.format(v || 0);
export const moedaCurta = (v) => (v >= 1e6 ? `R$ ${(v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi` : v >= 1e3 ? `R$ ${(v / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : moeda(v));
export const num = (v) => Number(v || 0).toLocaleString("pt-BR");
export const pct = (v, d = 1) => `${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d })}%`;
export const dataBr = (iso) => { if (!iso) return ""; const [a, m, d] = String(iso).slice(0, 10).split("-"); return `${d}/${m}/${a}`; };
export const hojeIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const diasAtras = (n) => new Date(Date.now() - n * 86400000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const diasAFrente = (n) => diasAtras(-n);
export const horaAgora = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
export function iniciais(nome) {
  const p = String(nome || "").replace(/&/g, " ").split(/\s+/).filter((x) => /^[\p{L}\p{N}]/u.test(x) && !/^(de|da|do|das|dos|e|ltda|me|epp|eireli|s\/?a|sa)$/i.test(x));
  if (!p.length) return "";
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase();
}
export const plural = (n, um, varios) => `${num(n)} ${n === 1 ? um : varios}`;

// ------------------------------------------------------------------ ícones (traço 1.6–1.8, como no CAPTA)
const P = {
  busca: '<circle cx="11" cy="11" r="6.5"></circle><path d="M20 20l-4.2-4.2"></path>',
  sino: '<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 004 0"></path>',
  usuario: '<circle cx="12" cy="8.5" r="3.5"></circle><path d="M5 19.5a7 7 0 0114 0"></path>',
  tel: '<path d="M5 4.5h3.5l1.5 4-2 1.3a10 10 0 005.2 5.2l1.3-2 4 1.5V18a2 2 0 01-2 2A15.5 15.5 0 014 6.5a2 2 0 011-2z"></path>',
  whats: '<path d="M4 20l1.2-3.6A8 8 0 1112 20a8 8 0 01-4.2-1.2z"></path>',
  email: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"></rect><path d="M4 7l8 6 8-6"></path>',
  doc: '<path d="M5.5 3.5h9l4 4v13h-13z"></path><path d="M14.5 3.5v4h4"></path>',
  estrela: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"></path>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"></path>',
  alerta: '<path d="M12 4l9 16H3zM12 10v4M12 17v.5"></path>',
  info: '<circle cx="12" cy="12" r="9"></circle><path d="M12 8v5M12 16h.01"></path>',
  pino: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z"></path><circle cx="12" cy="10" r="2.3"></circle>',
  atualizar: '<path d="M20 12a8 8 0 11-2.3-5.6M20 4v4.5h-4.5"></path>',
  mais: '<path d="M12 5v14M5 12h14"></path>',
  fechar: '<path d="M6 6l12 12M18 6L6 18"></path>',
  seta: '<path d="M9 6l6 6-6 6"></path>',
  baixo: '<path d="M6 9l6 6 6-6"></path>',
  cima: '<path d="M6 15l6-6 6 6"></path>',
  predio: '<path d="M5 20.5V4.5h10v16M15 9.5h4v11M8 8h4M8 12h4M8 16h4M3 20.5h18"></path>',
  pasta: '<path d="M3.5 6.5h6l2 2h9v10h-17z"></path>',
  clipe: '<path d="M8 12.5l5.5-5.5a3 3 0 014.2 4.2l-7 7a5 5 0 01-7-7l6.5-6.5"></path>',
  calendario: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"></path>',
  painel: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"></rect><path d="M9 4.5v15"></path>',
  enviar: '<path d="M4 12l16-8-6 16-2.5-6.5z"></path>',
  balanca: '<path d="M12 4v16M6 20h12M5 8h14M8 8l-3 7h6zM19 8l-3 7h6z"></path>',
  marca: '<path d="M12 12L18.5 5.5"></path><path d="M20 12a8 8 0 11-8-8"></path><path d="M16 12a4 4 0 11-4-4"></path>',
};
export const icone = (nome, t = 16, extra = "") =>
  `<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[nome] || ""}</svg>`;
export const iconePath = (d, t = 18) =>
  `<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"></path></svg>`;

// ------------------------------------------------------------------ avisos (toasts)
export function avisar(texto, tipo = "ok") {
  let box = document.querySelector(".toasts");
  if (!box) { box = document.createElement("div"); box.className = "toasts"; box.setAttribute("role", "status"); document.body.append(box); }
  const t = document.createElement("div");
  t.className = `toast ${tipo === "erro" ? "erro" : ""}`;
  t.textContent = texto;
  box.append(t);
  setTimeout(() => t.remove(), 3800);
}

// ------------------------------------------------------------------ diálogo
// campos: [{tipo: texto|area|seletor|info|aviso, nome, rotulo, opcoes, valor, obrigatorio}]
export function dialogo({ titulo, subtitulo = "", campos = [], confirmar = "Salvar", cancelar = "Cancelar", aoConfirmar, largura = 560 }) {
  const fundo = document.createElement("div");
  fundo.className = "fundo-dialogo";
  const corpo = campos.map((c) => {
    if (c.tipo === "info") return `<p style="margin:0;color:var(--texto)">${esc(c.texto)}</p>`;
    if (c.tipo === "aviso") return `<div class="aviso ${c.nivel || "azul"}">${icone("info", 16)}<span>${esc(c.texto)}</span></div>`;
    if (c.tipo === "html") return c.html;
    const v = esc(c.valor ?? "");
    const ctrl = c.tipo === "area" ? `<textarea name="${c.nome}" ${c.obrigatorio ? "required" : ""}>${v}</textarea>`
      : c.tipo === "seletor" ? `<select name="${c.nome}">${c.opcoes.map((o) => `<option value="${esc(o.valor ?? o)}" ${String(o.valor ?? o) === String(c.valor) ? "selected" : ""}>${esc(o.rotulo ?? o)}</option>`).join("")}</select>`
        : `<input name="${c.nome}" type="${c.entrada || "text"}" value="${v}" ${c.obrigatorio ? "required" : ""} placeholder="${esc(c.dica || "")}">`;
    return `<label class="campo">${esc(c.rotulo)}${ctrl}</label>`;
  }).join("");
  fundo.innerHTML = `<form class="dialogo" style="max-width:${largura}px" role="dialog" aria-modal="true" aria-label="${esc(titulo)}">
    <header><div><h2>${esc(titulo)}</h2>${subtitulo ? `<p>${esc(subtitulo)}</p>` : ""}</div>
      <button type="button" class="icone-btn" data-fechar aria-label="Fechar" style="width:34px;height:34px">${icone("fechar", 16)}</button></header>
    <div class="corpo">${corpo}<p class="erro-dialogo" style="margin:0;color:var(--vermelho);display:none"></p></div>
    <footer>${cancelar ? `<button type="button" class="btn" data-fechar>${esc(cancelar)}</button>` : ""}${confirmar ? `<button type="submit" class="btn primario">${esc(confirmar)}</button>` : ""}</footer>
  </form>`;
  const fechar = () => { fundo.remove(); document.removeEventListener("keydown", tecla); };
  const tecla = (e) => { if (e.key === "Escape") fechar(); };
  document.addEventListener("keydown", tecla);
  fundo.addEventListener("mousedown", (e) => { if (e.target === fundo) fechar(); });
  fundo.querySelectorAll("[data-fechar]").forEach((b) => b.addEventListener("click", fechar));
  fundo.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const valores = Object.fromEntries(new FormData(e.target).entries());
    try {
      if (aoConfirmar?.(valores) !== false) fechar();
    } catch (err) {
      const p = fundo.querySelector(".erro-dialogo");
      p.textContent = err.message;
      p.style.display = "block";
    }
  });
  document.body.append(fundo);
  (fundo.querySelector("input, textarea, select") || fundo.querySelector("button[type=submit]"))?.focus();
  return fechar;
}

// ------------------------------------------------------------------ estado local da demonstração
// Cada usuário (UID do Firebase) tem o seu próprio estado da demonstração neste navegador.
let CHAVE = "capta-demo-v1";
let cache = null;
export function usarEspacoDoUsuario(uid) {
  const nova = uid ? `capta-demo-v1:${uid}` : "capta-demo-v1";
  if (nova !== CHAVE) { CHAVE = nova; cache = null; }
}
export function estado() {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(CHAVE) || "{}"); } catch { cache = {}; }
  return cache;
}
export function salvarEstado(mudar) {
  const s = estado();
  mudar(s);
  try { localStorage.setItem(CHAVE, JSON.stringify(s)); } catch { /* navegação privada: segue só em memória */ }
}
export function restaurarDemonstracao() {
  cache = {};
  try { localStorage.removeItem(CHAVE); } catch { /* ignora */ }
}

export const emitir = (nome, dados) => window.dispatchEvent(new CustomEvent(nome, { detail: dados }));
