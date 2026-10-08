// CAPTA — demonstração web. Moldura (menu lateral, barra superior, discador) e roteador por hash (#/...),
// que funciona no GitHub Pages sem servidor. Cada tela fica em js/telas/*.js e devolve { titulo|trilha, html, montar }.
import { EMPRESAS, CONVERSAS, LISTAS, ALTERACOES, ORGANIZACAO, PROPOSTAS, nomeEmpresa } from "./dados.js";
import { avisar, cnpjFmt, digitos, esc, estado, icone, iconePath, iniciais, salvarEstado } from "./util.js";
import { favoritos, tipoCrm } from "./crm.js";

const GRUPOS = [
  ["inicio", "Visão geral", "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"],
  ["empresas", "Empresas", "M5 20.5V4.5h10v16M15 9.5h4v11M8 8h4M8 12h4M8 16h4M3 20.5h18",
    [["busca", "Buscar empresas"], ["clientes", "Clientes e empresas", "clientes"], ["favoritos", "Favoritos", "favoritos"]]],
  ["captacao", "Captação", "M3.5 4h4.5v16H3.5zM9.75 4h4.5v11h-4.5zM16 4h4.5v7H16z",
    [["leads", "Leads", "leads"], ["propostas", "Propostas", "propostas"], ["atendimento", "Modo atendimento"]]],
  ["comunicacao", "Comunicação", "M4 20l1.2-3.6A8 8 0 1112 20a8 8 0 01-4.2-1.2z",
    [["conversas", "WhatsApp", null, "conversas"], ["emails", "E-mails"], ["chamadas", "Chamadas"], ["agenda", "Agenda"], ["chat", "Chat interno"]]],
  ["intel", "Inteligência", "M12 12L18.5 5.5M20 12a8 8 0 11-8-8M16 12a4 4 0 11-4-4",
    [["planejamento", "Planejamento tributário"], ["processos", "Busca de processos"], ["diarios", "Diários oficiais"], ["monitor", "Monitoramento", null, "monitor"]]],
  ["gestao", "Gestão", "M4 18l5-6 4 3 7-8M15 7h5v5",
    [["exec", "Visão executiva"], ["vendas", "Vendas"], ["financeiro", "Financeiro"], ["equipe", "Equipe"], ["metas", "Metas por área"]]],
  ["arquivos", "Arquivos", "M3.5 6.5h6l2 2h9v10h-17z"],
  ["config", "Configurações", "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M16 4v4M10 10v4M18 16v4"],
];

const TELAS = {
  inicio: () => import("./telas/inicio.js"), busca: () => import("./telas/busca.js"), clientes: () => import("./telas/busca.js"),
  favoritos: () => import("./telas/busca.js"), empresa: () => import("./telas/ficha.js"), leads: () => import("./telas/leads.js"),
  propostas: () => import("./telas/propostas.js"), atendimento: () => import("./telas/atendimento.js"),
  conversas: () => import("./telas/conversas.js"), emails: () => import("./telas/comunicacao.js"), chamadas: () => import("./telas/comunicacao.js"),
  agenda: () => import("./telas/agenda.js"), processos: () => import("./telas/processos.js"), diarios: () => import("./telas/inteligencia.js"),
  monitor: () => import("./telas/inteligencia.js"), exec: () => import("./telas/gestao.js"), vendas: () => import("./telas/gestao.js"),
  arquivos: () => import("./telas/arquivos.js"), config: () => import("./telas/config.js"),
  financeiro: () => import("./telas/indisponivel.js"), equipe: () => import("./telas/indisponivel.js"), metas: () => import("./telas/indisponivel.js"),
  chat: () => import("./telas/indisponivel.js"), planejamento: () => import("./telas/indisponivel.js"),
};
const ATIVO = { empresa: "clientes" };

export function lerRota() {
  const h = decodeURIComponent(location.hash.replace(/^#/, "")) || "/inicio";
  const [caminho, consulta = ""] = h.split("?");
  const partes = caminho.split("/").filter(Boolean);
  return { chave: partes[0] || "inicio", partes: partes.slice(1), q: Object.fromEntries(new URLSearchParams(consulta)), bruto: h };
}
export const ir = (hash) => { location.hash = hash; };

// ------------------------------------------------------------------ contadores do menu
function contadores() {
  const s = estado();
  const favs = favoritos();
  return {
    clientes: EMPRESAS.filter((e) => tipoCrm(e) === "cliente").length, favoritos: EMPRESAS.filter((e) => favs.has(e.cnpj)).length,
    leads: EMPRESAS.filter((e) => tipoCrm(e) === "lead").length, propostas: PROPOSTAS.filter((p) => !["aceite", "recusada"].includes(p.etapa)).length,
    conversas: CONVERSAS.reduce((a, c) => a + (s.lidas?.includes(c.id) ? 0 : c.naoLidas), 0), monitor: ALTERACOES.length,
  };
}

function lateral(ativo) {
  const s = estado();
  const cont = contadores();
  const abertos = s.menuAberto || {};
  const grupos = GRUPOS.map(([k, label, d, itens]) => {
    const tem = itens ? itens.some((i) => i[0] === ativo) : k === ativo;
    if (!itens) return `<a class="grupo ${tem ? "ativo simples" : ""}" href="#/${k}" title="${label}" ${tem ? 'aria-current="page"' : ""}>${iconePath(d)}<span>${label}</span></a>`;
    const aberto = abertos[k] ?? tem;
    const soma = itens.reduce((a, i) => a + (Number(cont[i[3]]) || 0), 0);
    return `<button class="grupo ${tem ? "ativo" : ""}" data-grupo="${k}" aria-expanded="${aberto}" title="${label}">${iconePath(d)}<span>${label}</span>
      ${!aberto && soma ? `<i class="selo">${soma}</i>` : ""}<svg class="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A857D" stroke-width="2"><path d="${aberto ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"}"></path></svg></button>
      ${aberto ? `<div class="subitens">${itens.map(([ik, l, c, b]) => `<a class="subitem ${ik === ativo ? "ativo" : ""}" href="#/${ik}" ${ik === ativo ? 'aria-current="page"' : ""}><span>${l}</span>${c && cont[c] ? `<span class="contagem">${cont[c]}</span>` : ""}${b && cont[b] ? `<span class="selo">${cont[b]}</span>` : ""}</a>`).join("")}</div>` : ""}`;
  }).join("");
  return `<aside class="lateral" aria-label="Menu principal">
    <a class="marca" href="#/inicio" title="CAPTA · Visão geral"><div class="marca-icone"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.7" stroke-linecap="round"><path d="M12 12L18.5 5.5"></path><path d="M20 12a8 8 0 11-8-8"></path><path d="M16 12a4 4 0 11-4-4"></path><circle cx="12" cy="12" r="1.2" fill="#FFFFFF"></circle></svg></div>
      <div class="marca-texto"><b>CAPTA</b><span>Empresas</span></div></a>
    <nav class="menu">${grupos}</nav>
    <button class="recolher" data-recolher>${icone("painel", 16)}<span>Recolher menu</span></button>
  </aside>`;
}

function topo(t) {
  const nome = ORGANIZACAO.responsavel;
  const cab = t.trilha
    ? `<nav class="trilha" aria-label="Trilha"><a href="${t.trilha[0][1]}">${esc(t.trilha[0][0])}</a>${icone("seta", 14)}<b aria-current="page" title="${esc(t.trilha[1])}">${esc(t.trilha[1])}</b></nav>`
    : `<h1>${esc(t.titulo || "")}</h1>`;
  return `<header class="topo">
    <button class="icone-btn menu-movel" data-menu-movel aria-label="Abrir menu">${icone("menu", 18)}</button>
    ${cab}
    <span class="demo-selo" title="Versão de demonstração com dados fictícios">Demonstração · dados fictícios</span>
    <form class="busca-global" role="search" data-busca-global>${icone("busca", 17)}
      <input id="busca-global" type="search" placeholder="Buscar por CNPJ, razão social ou nome fantasia" aria-label="Buscar por CNPJ, razão social ou nome fantasia" autocomplete="off">
      <span class="atalho">Ctrl K</span><div class="sugestoes" hidden></div></form>
    <div style="position:relative"><button class="icone-btn" data-sino aria-label="Notificações">${icone("sino", 18)}${ALTERACOES.length ? '<span class="ponto-alerta"></span>' : ""}</button></div>
    <a class="usuario" href="#/config/org" title="${esc(nome)}"><span class="avatar">${iniciais(nome)}</span><div><b>${esc(nome)}</b><small>${esc(ORGANIZACAO.papel)}</small></div></a>
  </header>`;
}

// ------------------------------------------------------------------ renderização
const raiz = document.getElementById("app");
let geracao = 0;

async function navegar(manterRolagem = false) {
  const rota = lerRota();
  const rolagem = window.scrollY;
  if (!TELAS[rota.chave]) { location.replace("#/inicio"); return; }
  const minha = ++geracao;
  let mod;
  try {
    mod = await TELAS[rota.chave]();
  } catch (e) {
    console.error(e);
    raiz.innerHTML = `<div class="pagina"><div class="aviso ambar">Não foi possível abrir esta tela: ${esc(e.message)}</div></div>`;
    return;
  }
  if (minha !== geracao) return;
  const tela = mod.tela(rota);
  const ativo = ATIVO[rota.chave] || rota.chave;
  const recolhido = estado().recolhido ?? window.innerWidth < 1200;
  raiz.innerHTML = `<a class="pular" href="#conteudo">Pular para o conteúdo</a>
    <div class="app ${recolhido && window.innerWidth >= 900 ? "recolhido" : ""}">${lateral(ativo)}
      <div class="principal">${topo(tela)}<main id="conteudo" class="conteudo" tabindex="-1">${tela.html}</main></div></div>
    <button class="discador-btn" data-discador><i>${icone("tel", 16)}</i>Discador</button>`;
  document.title = `${tela.trilha ? tela.trilha[1] : tela.titulo} · CAPTA`;
  ligarMoldura();
  tela.montar?.(raiz.querySelector("#conteudo"), rota);
  window.scrollTo(0, manterRolagem ? rolagem : 0);
}

function ligarMoldura() {
  const app = raiz.querySelector(".app");
  raiz.querySelectorAll("[data-grupo]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.grupo;
    if (app.classList.contains("recolhido")) { const g = GRUPOS.find((x) => x[0] === k); ir(`#/${g[3][0][0]}`); return; }
    salvarEstado((s) => { s.menuAberto = { ...(s.menuAberto || {}), [k]: b.getAttribute("aria-expanded") !== "true" }; });
    navegarMantendo();
  }));
  raiz.querySelector("[data-recolher]").addEventListener("click", () => {
    salvarEstado((s) => { s.recolhido = !app.classList.contains("recolhido"); });
    app.classList.toggle("recolhido");
  });
  raiz.querySelector("[data-menu-movel]").addEventListener("click", () => app.classList.toggle("menu-aberto"));
  raiz.querySelectorAll(".lateral a").forEach((a) => a.addEventListener("click", () => app.classList.remove("menu-aberto")));
  // busca global: sugestões por CNPJ, razão social ou fantasia
  const form = raiz.querySelector("[data-busca-global]");
  const campo = form.querySelector("input");
  const sug = form.querySelector(".sugestoes");
  const achar = (t) => {
    const d = digitos(t);
    const n = t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return EMPRESAS.filter((e) => (d.length >= 3 && e.cnpj.includes(d)) || (n.length >= 2 && `${e.razao} ${e.fantasia}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(n))).slice(0, 6);
  };
  campo.addEventListener("input", () => {
    const t = campo.value.trim();
    const r = t ? achar(t) : [];
    sug.hidden = !t;
    sug.innerHTML = r.length ? r.map((e) => `<a href="#/empresa/${e.cnpj}">${esc(nomeEmpresa(e))}<small>${cnpjFmt(e.cnpj)} · ${esc(e.municipio)}/MG</small></a>`).join("")
      + `<a href="#/busca?q=${encodeURIComponent(t)}"><b style="font-size:13px">Ver todos os resultados para “${esc(t)}”</b></a>`
      : `<a href="#/busca?q=${encodeURIComponent(t)}">Buscar “${esc(t)}” em Buscar empresas</a>`;
  });
  campo.addEventListener("blur", () => setTimeout(() => { sug.hidden = true; }, 150));
  form.addEventListener("submit", (e) => { e.preventDefault(); const t = campo.value.trim(); if (t) ir(`#/busca?q=${encodeURIComponent(t)}`); });
  // notificações
  raiz.querySelector("[data-sino]").addEventListener("click", (e) => {
    const box = e.currentTarget.parentElement;
    const aberto = box.querySelector(".painel-notificacoes");
    if (aberto) { aberto.remove(); return; }
    box.insertAdjacentHTML("beforeend", `<div class="painel-notificacoes" role="dialog" aria-label="Notificações"><header><b>Notificações</b><button class="link" data-lidas>Marcar todas como lidas</button></header>
      <div style="overflow-y:auto;padding:6px">${ALTERACOES.map((a) => { const emp = EMPRESAS.find((x) => x.cnpj === a.cnpj); return `<a class="notificacao" href="#/empresa/${a.cnpj}/juridico/monitor"><span style="width:8px;height:8px;margin-top:6px;border-radius:50%;background:var(--marinho);flex:none"></span><span style="display:flex;flex-direction:column;gap:2px"><b style="font-size:13px;font-weight:600">${esc(a.titulo)}</b><span style="font-size:12px;color:var(--suave)">${esc(nomeEmpresa(emp))} · ${esc(a.detalhe)}</span></span></a>`; }).join("")}</div></div>`);
    box.querySelector("[data-lidas]").addEventListener("click", () => { box.querySelector(".painel-notificacoes").remove(); box.querySelector(".ponto-alerta")?.remove(); avisar("Notificações marcadas como lidas."); });
  });
  raiz.querySelector("[data-discador]").addEventListener("click", alternarDiscador);
}

function alternarDiscador() {
  const aberto = document.querySelector(".discador");
  if (aberto) { aberto.remove(); return; }
  const d = document.createElement("div");
  d.className = "discador";
  d.setAttribute("role", "dialog");
  d.setAttribute("aria-label", "Discador");
  d.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:15px">Discador</b><button class="icone-btn" style="width:32px;height:32px" data-fechar aria-label="Fechar">${icone("fechar", 14)}</button></div>
    <input class="entrada" data-numero placeholder="(31) 00000-0000" inputmode="tel" style="font-size:18px;text-align:center;font-weight:600">
    <div class="teclado">${"123456789*0#".split("").map((k) => `<button type="button" data-k="${k}">${k}</button>`).join("")}</div>
    <button class="btn primario" data-ligar>${icone("tel", 15)}Ligar</button>
    <small style="color:var(--suave);text-align:center">Chamadas pelo aplicativo do sistema (tel:) · nenhum provedor VoIP configurado</small>`;
  document.body.append(d);
  const campo = d.querySelector("[data-numero]");
  d.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { campo.value += b.dataset.k; campo.focus(); }));
  d.querySelector("[data-fechar]").addEventListener("click", () => d.remove());
  d.querySelector("[data-ligar]").addEventListener("click", () => {
    if (digitos(campo.value).length < 10) { avisar("Informe DDD e número.", "erro"); return; }
    avisar(`Demonstração: no CAPTA, o computador discaria ${campo.value} e depois você registraria o resultado.`);
  });
}

export function navegarMantendo() { navegar(true); }
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); document.getElementById("busca-global")?.focus(); }
});
window.addEventListener("hashchange", () => navegar(false));
window.addEventListener("capta:atualizar", () => navegar(true));   // a tela mudou dados: redesenha sem voltar ao topo
navegar();
