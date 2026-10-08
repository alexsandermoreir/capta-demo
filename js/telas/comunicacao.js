// Comunicação: E-mails e Chamadas (listas com dados fictícios; envio e ligação são simulados).
import { EMPRESAS, nomeEmpresa } from "../dados.js";
import { avisar, dataBr, diasAtras, esc, icone, iniciais } from "../util.js";

const EMAILS = [
  [EMPRESAS[0], "saida", "Proposta de parcelamento — PROP-2026-0041", "Enviado pelo Gmail", 1],
  [EMPRESAS[1], "entrada", "Re: Recuperação de créditos de PIS/COFINS", "Recebido", 2],
  [EMPRESAS[5], "saida", "Relatório mensal de processos — setembro", "Enviado pelo Gmail", 6],
  [EMPRESAS[6], "saida", "Apresentação do escritório", "Enviado pelo programa de e-mail (manual)", 9],
];
const CHAMADAS = [
  [EMPRESAS[2], "saida", "Atendeu", "Pediu retorno na sexta à tarde.", "4 min 12 s", 0],
  [EMPRESAS[7], "saida", "Não atendeu", "Tentar de novo amanhã.", "—", 1],
  [EMPRESAS[8], "entrada", "Atendeu", "Interesse na transação da PGFN.", "7 min 40 s", 3],
  [EMPRESAS[3], "saida", "Sem interesse", "Já possui assessoria.", "2 min 05 s", 5],
];

export function tela(rota) {
  if (rota.chave === "chamadas") {
    const html = `<div class="pagina"><div class="grade-4">
      <div class="cartao kpi"><div class="kpi-topo">Chamadas hoje</div><span class="valor">1</span></div><div class="cartao kpi"><div class="kpi-topo">Atendidas</div><span class="valor">50%</span></div>
      <div class="cartao kpi"><div class="kpi-topo">Duração média</div><span class="valor">4 min</span><small>informada por você (sem VoIP)</small></div><div class="cartao kpi"><div class="kpi-topo">Retornos pendentes</div><span class="valor">2</span></div></div>
      <section class="cartao" style="overflow-x:auto"><table class="tabela" style="min-width:760px"><thead><tr><th>Empresa</th><th>Nota</th><th>Duração</th><th>Resultado</th><th>Quando</th></tr></thead><tbody>
        ${CHAMADAS.map(([e, d, r, n, dur, dias]) => `<tr class="clicavel" data-href="#/empresa/${e.cnpj}"><td><span style="display:flex;gap:10px;align-items:center"><span class="iniciais">${iniciais(nomeEmpresa(e))}</span><span><b style="font-weight:600">${esc(nomeEmpresa(e))}</b><div class="legenda">${d === "entrada" ? "Recebida" : "Realizada"} · ${esc(e.telefones[0][0])}</div></span></span></td>
          <td>${esc(n)}</td><td class="num">${dur}</td><td><span class="chip ${r === "Atendeu" ? "verde" : r === "Não atendeu" ? "ambar" : "cinza"} quadrado">${r}</span></td><td>${dias ? dataBr(diasAtras(dias)) : "Hoje"}</td></tr>`).join("")}</tbody></table></section></div>`;
    return { titulo: "Chamadas", html, montar: ligar };
  }
  const html = `<div class="pagina"><div style="display:flex;gap:10px;align-items:center"><div class="pilulas"><span class="pilula ativa">Todos</span><span class="pilula">Enviados</span><span class="pilula">Recebidos</span><span class="pilula">Rascunhos</span></div>
    <button class="btn primario" style="margin-left:auto" data-novo>${icone("email", 14)}Novo e-mail</button></div>
    <div class="aviso cinza">${icone("info", 16)}<span>No CAPTA, com o Gmail conectado o envio sai pela conta Google (com anexos da pasta da empresa); sem ele, abre o seu programa de e-mail e o envio fica registrado como manual.</span></div>
    <section class="cartao">${EMAILS.map(([e, d, a, s, dias]) => `<a href="#/empresa/${e.cnpj}/comunicacao/emails" style="display:flex;gap:14px;align-items:center;padding:14px 20px;border-bottom:1px solid var(--borda-3);color:var(--tinta)">
      <span class="iniciais">${iniciais(nomeEmpresa(e))}</span><div style="flex:1;min-width:0"><b style="font-size:14px">${esc(a)}</b><div class="legenda">${d === "entrada" ? "De" : "Para"}: ${esc(nomeEmpresa(e))} · ${esc(e.email || "contato da empresa")}</div></div>
      <span class="chip ${s.startsWith("Enviado pelo Gmail") ? "verde" : s === "Recebido" ? "azul" : "cinza"} quadrado">${esc(s)}</span><span class="legenda">${dataBr(diasAtras(dias))}</span></a>`).join("")}</section></div>`;
  return { titulo: "E-mails", html, montar: ligar };
}
function ligar(el) {
  el.querySelectorAll("tr[data-href]").forEach((tr) => tr.addEventListener("click", () => { location.hash = tr.dataset.href; }));
  el.querySelector("[data-novo]")?.addEventListener("click", () => avisar("Demonstração: no CAPTA, o e-mail é escrito aqui, com modelos e anexos, e enviado só depois da sua confirmação."));
}
