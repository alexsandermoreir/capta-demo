// Visão geral (meu dia): compromissos de hoje, próximas ações, alterações detectadas, pipeline e empresas recentes.
import { AGENDA, ALTERACOES, EMPRESAS, ETAPAS, ORGANIZACAO, PROPOSTAS, empresa, nomeEmpresa } from "../dados.js";
import { etapaLead, tipoCrm } from "../crm.js";
import { dataBr, esc, icone, iniciais, moeda } from "../util.js";

export function tela() {
  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const hoje = AGENDA.filter((a) => a.dia === 0);
  const proximas = [...AGENDA.filter((a) => a.dia !== 0).sort((a, b) => a.dia - b.dia)];
  const leads = EMPRESAS.filter((e) => tipoCrm(e));
  const porEtapa = ETAPAS.map(([k, l, cor]) => ({ k, l, cor, n: leads.filter((e) => etapaLead(e) === k).length })).filter((x) => x.n);
  const total = porEtapa.reduce((a, x) => a + x.n, 0) || 1;
  const abertas = PROPOSTAS.filter((p) => p.etapa === "envio");
  const dataLonga = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, (c) => c.toUpperCase());
  const quando = (d) => (d < 0 ? `<span class="chip vermelho quadrado">Atrasada</span>` : d === 1 ? "Amanhã" : `Em ${d} dias`);
  const html = `<div class="pagina">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap">
      <div><h2 style="margin:0;font-size:24px;font-weight:600;letter-spacing:-.015em">${saudacao}, ${esc(ORGANIZACAO.responsavel.split(" ")[0])}.</h2>
      <p style="margin:6px 0 0;color:var(--suave);font-size:13px">${dataLonga} · ${hoje.length} compromisso(s) · ${proximas.length} próximas ações · ${ALTERACOES.length} alterações detectadas</p></div>
      <a class="btn primario" href="#/atendimento">${icone("tel", 15)}Iniciar modo atendimento</a>
    </div>
    <div class="grade-3">
      <section class="cartao pad" aria-label="Hoje"><div class="cartao-titulo"><h3>Hoje</h3><a class="link" href="#/agenda">Agenda</a></div>
        ${hoje.length ? hoje.map((a) => `<a href="#/empresa/${a.cnpj}" style="display:flex;gap:12px;padding:10px 0;border-top:1px solid var(--borda-3);color:var(--tinta)"><b class="num" style="font-size:13px;width:44px">${a.hora}</b><span style="display:flex;flex-direction:column;gap:2px"><span style="font-size:13px;font-weight:500">${esc(a.titulo)}</span><small style="color:var(--suave)">${a.tipo === "reuniao" ? "Reunião" : "Tarefa"} · ${esc(nomeEmpresa(empresa(a.cnpj)))}</small></span></a>`).join("") : '<p class="legenda">Nenhum compromisso para hoje.</p>'}</section>
      <section class="cartao pad" aria-label="Próximas ações"><div class="cartao-titulo"><h3>Próximas ações</h3><a class="link" href="#/leads">Leads</a></div>
        ${proximas.slice(0, 4).map((a) => `<a href="#/empresa/${a.cnpj}" style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid var(--borda-3);color:var(--tinta);font-size:13px"><span>${esc(a.titulo)}</span><small style="color:var(--suave);white-space:nowrap">${quando(a.dia)}</small></a>`).join("")}</section>
      <section class="cartao pad" aria-label="Alterações detectadas"><div class="cartao-titulo"><h3>Alterações detectadas</h3><a class="link" href="#/monitor">Monitoramento</a></div>
        ${ALTERACOES.slice(0, 4).map((a) => `<a href="#/empresa/${a.cnpj}/juridico/monitor" style="display:flex;flex-direction:column;gap:2px;padding:10px 0;border-top:1px solid var(--borda-3);color:var(--tinta)"><span style="font-size:13px;font-weight:500">${esc(a.titulo)}</span><small style="color:var(--suave)">${esc(nomeEmpresa(empresa(a.cnpj)))} · ${dataBr(a.data)}</small></a>`).join("")}</section>
    </div>
    <div class="grade-2">
      <section class="cartao pad" aria-label="Pipeline"><div class="cartao-titulo"><h3>Pipeline · ${new Date().toLocaleDateString("pt-BR", { month: "long" })} · ${leads.length} empresas em listas ativas</h3><a class="link" href="#/leads/1/kanban">Abrir pipeline</a></div>
        <div style="display:flex;height:34px;border-radius:8px;overflow:hidden;gap:2px">${porEtapa.map((x) => `<div title="${esc(x.l)}: ${x.n}" style="flex:${x.n};background:${x.cor};color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center">${x.n}</div>`).join("")}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:14px">${porEtapa.map((x) => `<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--texto)"><i style="width:8px;height:8px;border-radius:50%;background:${x.cor}"></i>${esc(x.l)} · ${Math.round((x.n / total) * 100)}%</span>`).join("")}</div>
        <div class="grade-3" style="margin-top:18px">
          <div class="cartao" style="padding:14px 16px;box-shadow:none"><small class="legenda">Propostas aguardando aceite</small><div style="font-size:20px;font-weight:600;margin-top:4px">${abertas.length}</div></div>
          <div class="cartao" style="padding:14px 16px;box-shadow:none"><small class="legenda">Valor em aberto</small><div class="num" style="font-size:20px;font-weight:600;margin-top:4px">${moeda(abertas.reduce((a, p) => a + p.fixo, 0))}</div></div>
          <div class="cartao" style="padding:14px 16px;box-shadow:none"><small class="legenda">Clientes ativos</small><div style="font-size:20px;font-weight:600;margin-top:4px">${EMPRESAS.filter((e) => tipoCrm(e) === "cliente").length}</div></div>
        </div></section>
      <section class="cartao pad" aria-label="Empresas recentes"><div class="cartao-titulo"><h3>Empresas recentes</h3></div>
        ${EMPRESAS.slice(0, 6).map((e, i) => `<a href="#/empresa/${e.cnpj}" style="display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--borda-3);color:var(--tinta)"><span class="iniciais">${iniciais(nomeEmpresa(e))}</span><span style="flex:1;font-size:13px;font-weight:500">${esc(nomeEmpresa(e))}</span><small class="legenda">${i === 0 ? "hoje" : `há ${i} dia${i > 1 ? "s" : ""}`}</small></a>`).join("")}</section>
    </div>
  </div>`;
  return { titulo: "Visão geral", html };
}
