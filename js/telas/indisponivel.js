// Módulos que o CAPTA mostra como indisponíveis, com o motivo e o caminho para o que já existe (mesmo texto do sistema).
import { esc } from "../util.js";

const M = {
  financeiro: ["Financeiro", "Financeiro não está ligado ao CAPTA", "Receitas, despesas, contas a receber, inadimplência e margens vêm de um sistema financeiro (ERP ou planilha de lançamentos), que não está conectado. O que o CAPTA já mede: honorários contratados nas propostas aceitas, em Visão executiva e Vendas.", [["Visão executiva", "#/exec"], ["Vendas", "#/vendas"]]],
  equipe: ["Equipe", "Equipe não está disponível nesta versão", "O CAPTA ainda não tem cadastro de pessoas, perfis e permissões. Desempenho por pessoa usa o campo “responsável” das propostas, listas e tarefas.", [["Vendas por responsável", "#/vendas"]]],
  metas: ["Metas por área", "Metas por área não estão cadastradas", "O CAPTA não tem cadastro de metas nem de áreas. Sem meta, não há percentual atingido nem ritmo — por isso nada é estimado.", [["Vendas", "#/vendas"], ["Visão executiva", "#/exec"]]],
  chat: ["Chat interno", "Chat interno não está disponível nesta versão", "Conversa entre colegas exige usuários e um servidor compartilhado. Para combinados da equipe, use as notas internas da ficha ou da conversa de WhatsApp — elas nunca são enviadas ao contato.", [["Conversas de WhatsApp", "#/conversas"]]],
  planejamento: ["Planejamento tributário", "Planejamento tributário fica fora do CAPTA", "Simulações de regime, comparação de cenários e premissas tributárias pertencem ao SO Fiscal. O CAPTA mostra só o regime declarado nas fontes (Simples, MEI e ECF por ano), sem inferir nem simular.", [["Buscar empresas", "#/busca"]]],
};

export function tela(rota) {
  const [titulo, cab, texto, acoes] = M[rota.chave];
  return { titulo, html: `<div class="pagina"><section class="cartao" style="padding:40px;display:flex;flex-direction:column;gap:12px;align-items:flex-start;max-width:760px;min-height:320px;justify-content:center">
    <span class="chip cinza quadrado">Indisponível</span><h2 style="margin:0;font-size:22px;letter-spacing:-.015em">${esc(cab)}</h2><p style="margin:0;font-size:14px;line-height:1.6;color:var(--texto)">${esc(texto)}</p>
    <div style="display:flex;gap:8px;margin-top:8px">${acoes.map(([l, h], i) => `<a class="btn ${i === 0 ? "primario" : ""}" href="${h}">${esc(l)}</a>`).join("")}</div></section></div>` };
}
