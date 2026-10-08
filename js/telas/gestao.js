// Gestão: Visão executiva e Vendas, calculadas só das propostas (como no CAPTA: sem financeiro, metas nem unidades).
import { PROPOSTAS, RESPONSAVEIS, empresa, nomeEmpresa } from "../dados.js";
import { dataBr, esc, icone, iniciais, moeda, pct } from "../util.js";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const aceitas = PROPOSTAS.filter((p) => p.etapa === "aceite");
const abertas = PROPOSTAS.filter((p) => p.etapa === "envio");

function exec() {
  const hoje = new Date();
  // fictício: contratado por mês do ano (as aceitas da demonstração + série de exemplo)
  const serie = [6200, 8400, 5100, 12800, 9600, 7300, 14100, 11200, 9800, 0, 0, 0];
  aceitas.forEach((p) => { const m = new Date(p.aceita).getMonth(); serie[m] += p.fixo; });
  const atual = hoje.getMonth();
  const max = Math.max(...serie);
  const total = serie.slice(0, atual + 1).reduce((a, x) => a + x, 0);
  const mensal = aceitas.reduce((a, p) => a + p.mensal, 0);
  const html = `<div class="pagina">
    <div class="aviso ambar">${icone("info", 16)}<span>Faturamento, lucro, margens, unidades e metas dependem de um sistema financeiro e de metas cadastradas, que não estão ligados ao CAPTA. Os números abaixo vêm só do CRM (propostas aceitas). Valores fictícios nesta demonstração.</span></div>
    <div class="grade-4">
      <div class="cartao kpi"><div class="kpi-topo">Contratado em ${hoje.getFullYear()}<span class="chip verde quadrado">+12,4%</span></div><span class="valor">${moeda(total)}</span><small>honorários fixos das propostas aceitas</small></div>
      <div class="cartao kpi"><div class="kpi-topo">Mensalidades contratadas<span class="chip cinza quadrado">${aceitas.filter((p) => p.mensal).length} contrato(s)</span></div><span class="valor">${moeda(mensal)}/mês</span><small>soma dos honorários recorrentes</small></div>
      <div class="cartao kpi"><div class="kpi-topo">Clientes ativos<span class="chip verde quadrado">+2 no ano</span></div><span class="valor">3</span><small>empresas com número EMP</small></div>
      <div class="cartao kpi"><div class="kpi-topo">Propostas em aberto<span class="chip ambar quadrado">${abertas.length} enviada(s)</span></div><span class="valor">${moeda(abertas.reduce((a, p) => a + p.fixo, 0))}</span><small>aguardando aceite, dentro da validade</small></div>
    </div>
    <div class="grade-2">
      <section class="cartao pad"><div class="cartao-titulo"><div><h3>Evolução mensal do contratado</h3><small>${hoje.getFullYear()} · honorários fixos das propostas aceitas no mês · R$ mil</small></div></div>
        <div style="height:220px;display:flex;align-items:flex-end;border-bottom:1px solid var(--borda)">${serie.map((v, i) => `<div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;padding:0 5px" title="${MESES[i]}: ${moeda(v)}">
          <span style="font-size:11px;color:var(--tinta-2)" class="num">${i > atual ? "" : (v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</span>
          <div style="width:100%;max-width:44px;height:${i > atual ? 100 : Math.max(2, (v / max) * 92)}%;border-radius:6px 6px 2px 2px;${i > atual ? "border:1.5px dashed var(--azul-borda)" : "background:var(--marinho)"}"></div></div>`).join("")}</div>
        <div style="display:flex">${MESES.map((m, i) => `<span style="flex:1;text-align:center;font-size:12px;margin-top:6px;color:${i === atual ? "var(--tinta)" : "var(--suave)"};font-weight:${i === atual ? 600 : 400}">${m}</span>`).join("")}</div></section>
      <section class="cartao pad"><div class="cartao-titulo"><h3>Alertas</h3><small>2 ativos</small></div>
        ${[["#C08A1E", "1 proposta enviada há mais de 7 dias sem aceite", "PROP-2026-0041", "#/propostas?situacao=envio"], ["#B03E2E", "1 tarefa atrasada", "Revisão da proposta Horizonte Azul", "#/agenda"]].map(([c, t, m, l]) => `<a href="${l}" style="display:flex;gap:12px;padding:11px 0;border-top:1px solid var(--borda-3);color:var(--tinta)"><span style="width:8px;height:8px;margin-top:6px;border-radius:50%;background:${c};flex:none"></span><div style="flex:1"><b style="font-size:13px">${t}</b><div class="legenda">${m}</div></div><span class="link">Ver →</span></a>`).join("")}
        <div style="padding:14px;border-radius:10px;background:var(--fundo);margin-top:12px"><b style="font-size:13px;color:var(--texto)">Meta anual não cadastrada</b><div class="legenda" style="margin-top:4px">O CAPTA não tem cadastro de metas. Sem meta, não há percentual atingido nem ritmo necessário.</div></div></section>
    </div></div>`;
  return { titulo: "Visão executiva", html };
}

function vendas() {
  const ranking = RESPONSAVEIS.map((r) => { const m = aceitas.filter((p) => p.resp === r); const env = PROPOSTAS.filter((p) => p.resp === r && p.enviada); const fixo = m.reduce((a, p) => a + p.fixo, 0);
    return { r, fixo, mensal: m.reduce((a, p) => a + p.mensal, 0), n: m.length, env: env.length, conv: env.length ? (m.length / env.length) * 100 : null, props: m }; }).sort((a, b) => b.fixo - a.fixo);
  const total = ranking.reduce((a, x) => a + x.fixo, 0) || 1;
  const funil = [["Entraram em listas", 14], ["Com atividade registrada", 9], ["Propostas criadas", PROPOSTAS.length], ["Propostas enviadas", PROPOSTAS.filter((p) => p.enviada).length], ["Propostas aceitas", aceitas.length]];
  const html = `<div class="pagina">
    <div class="grade-4">
      <div class="cartao kpi"><div class="kpi-topo">Contratado no período<span class="chip verde quadrado">+8,1%</span></div><span class="valor">${moeda(total)}</span><small>propostas aceitas</small></div>
      <div class="cartao kpi"><div class="kpi-topo">Propostas aceitas</div><span class="valor">${aceitas.length}</span><small>de ${PROPOSTAS.filter((p) => p.enviada).length} enviadas</small></div>
      <div class="cartao kpi"><div class="kpi-topo">Ticket médio</div><span class="valor">${moeda(total / Math.max(1, aceitas.length))}</span><small>honorários fixos</small></div>
      <div class="cartao kpi"><div class="kpi-topo">Conversão de propostas</div><span class="valor">${pct((aceitas.length / Math.max(1, PROPOSTAS.filter((p) => p.enviada).length)) * 100)}</span><small>aceitas ÷ enviadas</small></div>
    </div>
    <div class="aviso cinza">${icone("info", 16)}<span><b>Metas individuais não cadastradas.</b> O CAPTA não tem cadastro de metas por pessoa nem vendas faturadas (ERP): o ranking mostra o contratado nas propostas aceitas.</span></div>
    <div class="grade-2">
      <section class="cartao" style="overflow-x:auto"><div style="padding:18px 22px"><b style="font-size:15px">Ranking por responsável</b></div><table class="tabela"><thead><tr><th>#</th><th>Responsável</th><th>Participação</th><th>Contratado</th><th>Conversão</th><th>Aceitas</th></tr></thead><tbody>
        ${ranking.map((x, i) => `<tr><td>${i + 1}</td><td><span style="display:flex;gap:10px;align-items:center"><span class="iniciais">${iniciais(x.r)}</span><b style="font-weight:600">${esc(x.r)}</b></span></td><td style="min-width:140px"><div style="display:flex;gap:8px;align-items:center"><div class="barra" style="flex:1"><i style="width:${(x.fixo / total) * 100}%"></i></div><span class="num">${pct((x.fixo / total) * 100)}</span></div></td>
          <td class="num"><b>${moeda(x.fixo)}</b>${x.mensal ? `<div class="legenda">+ ${moeda(x.mensal)}/mês</div>` : ""}</td><td>${x.conv == null ? "—" : pct(x.conv)}</td><td><span class="chip verde quadrado">${x.n} aceita(s)</span></td></tr>`).join("")}
      </tbody></table></section>
      <section class="cartao pad"><div class="cartao-titulo"><h3>Conversão de oportunidades</h3></div>
        ${funil.map(([n, v], i) => `<div style="display:grid;grid-template-columns:150px minmax(0,1fr);gap:12px;align-items:center;margin-bottom:10px"><span style="font-size:13px">${n}</span><div style="height:24px;border-radius:6px;background:var(--marinho);opacity:${1 - i * 0.14};width:${Math.max(14, (v / funil[0][1]) * 100)}%;color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;padding-left:10px">${v}</div></div>`).join("")}
        <div class="legenda" style="margin-top:8px">Propostas aceitas: ${aceitas.map((p) => `${esc(nomeEmpresa(empresa(p.cnpj)))} (${dataBr(p.aceita)})`).join(" · ")}</div></section>
    </div></div>`;
  return { titulo: "Vendas", html };
}

export function tela(rota) { return rota.chave === "vendas" ? vendas() : exec(); }
