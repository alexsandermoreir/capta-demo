// Inteligência: Monitoramento (mudanças entre competências e andamentos) e Diários oficiais (publicações × listas de termos).
import { ALTERACOES, PUBLICACOES, empresa, nomeEmpresa } from "../dados.js";
import { avisar, dataBr, esc, icone } from "../util.js";

const TIPO = { divida: ["Débitos", "ambar"], processo: ["Processos", "azul"], regime: ["Regime", "cinza"] };

function monitor() {
  const html = `<div class="pagina">
    <div class="grade-3">
      <div class="cartao kpi"><div class="kpi-topo">Acompanhando</div><span class="valor">14</span><small>empresas em listas e clientes</small></div>
      <div class="cartao kpi"><div class="kpi-topo">Mudanças nos últimos 30 dias</div><span class="valor">${ALTERACOES.length}</span><small>só entre competências diferentes das listas oficiais</small></div>
      <div class="cartao kpi"><div class="kpi-topo">Processos acompanhados</div><span class="valor">6</span><small>andamentos importados pela consulta automática e DataJud</small></div>
    </div>
    <section class="cartao pad"><div class="cartao-titulo"><h3>Mudanças detectadas</h3><small>Cada alteração mostra a fonte e a competência</small></div>
      ${ALTERACOES.map((a) => `<a href="#/empresa/${a.cnpj}/juridico/monitor" style="display:flex;gap:14px;align-items:center;padding:13px 0;border-top:1px solid var(--borda-3);color:var(--tinta)">
        <span class="chip ${TIPO[a.tipo][1]} quadrado" style="width:86px;justify-content:center">${TIPO[a.tipo][0]}</span>
        <div style="flex:1"><b style="font-size:14px">${esc(a.titulo)}</b><div class="legenda">${esc(nomeEmpresa(empresa(a.cnpj)))} · ${esc(a.detalhe)}</div></div>
        <span class="legenda">${dataBr(a.data)}</span>${icone("seta", 14)}</a>`).join("")}</section>
    <div class="aviso cinza">${icone("info", 16)}<span>Reprocessamentos da mesma competência e ajustes de centavos não contam como mudança: só aparecem diferenças reais entre importações.</span></div>
  </div>`;
  return { titulo: "Monitoramento", html };
}

function diarios() {
  const html = `<div class="pagina"><div class="grade-2">
    <section class="cartao pad"><div class="cartao-titulo"><h3>Publicações com correspondência</h3><button class="btn peq primario" data-registrar>${icone("mais", 13)}Registrar publicação</button></div>
      ${PUBLICACOES.map((p) => `<article style="padding:14px 0;border-top:1px solid var(--borda-3);display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="chip borda">${esc(p.veiculo)}</span><span class="chip azul quadrado">${esc(p.tipo)}</span><span class="chip verde quadrado">Correspondência exata</span><span class="legenda" style="margin-left:auto">${dataBr(p.data)}</span></div>
        <p style="margin:0;font-size:13px;line-height:1.55;color:var(--texto)">${esc(p.trecho).replace(esc(p.termo), `<mark style="background:#FAF1E1;color:var(--ambar-escuro);padding:0 2px">${esc(p.termo)}</mark>`)}</p>
        <div style="display:flex;gap:12px;font-size:12px"><a class="link" href="#/empresa/${p.cnpj}">${esc(nomeEmpresa(empresa(p.cnpj)))}</a><button class="link" data-alerta>Criar alerta</button></div></article>`).join("")}</section>
    <section class="cartao pad"><div class="cartao-titulo"><h3>Listas de termos</h3></div>
      ${[["Clientes ativos", "CNPJ, razão social e nome fantasia", 3], ["Leads prioritários", "Razão social", 6]].map(([n, d, q]) => `<div style="padding:12px 0;border-top:1px solid var(--borda-3)"><b style="font-size:14px">${n}</b><div class="legenda">${d} · ${q} empresas</div></div>`).join("")}
      <div class="aviso ambar" style="margin-top:14px">${icone("info", 15)}<span style="font-size:12px">A busca automática no DJEN por termo exige credenciais do CNJ. No CAPTA, as publicações entram por registro e são cruzadas com as listas de termos, com prioridade para o CNPJ.</span></div></section>
  </div></div>`;
  return { titulo: "Diários oficiais", html, montar: (el) => el.querySelectorAll("[data-registrar], [data-alerta]").forEach((b) => b.addEventListener("click", () => avisar("Demonstração: esta ação funciona no CAPTA instalado."))) };
}

export function tela(rota) { return rota.chave === "diarios" ? diarios() : monitor(); }
