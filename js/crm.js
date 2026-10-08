// "CRM" da demonstração: dados fictícios + o que o visitante muda na tela (favoritos, etapas, processos cadastrados,
// consultas, notas), guardado no próprio navegador (localStorage). Nada sai do navegador.
import { EMPRESAS, PROCESSOS, CONSULTA_FONTES } from "./dados.js";
import { estado, salvarEstado, hojeIso } from "./util.js";

export function favoritos() {
  return new Set(estado().favoritos ?? [EMPRESAS[0].cnpj, EMPRESAS[5].cnpj]);
}
export function alternarFavorito(cnpj) {
  const f = favoritos();
  f.has(cnpj) ? f.delete(cnpj) : f.add(cnpj);
  salvarEstado((s) => { s.favoritos = [...f]; });
  return f.has(cnpj);
}

export function etapaLead(e) { return estado().etapas?.[e.cnpj] ?? e.crm?.etapa ?? "novo"; }
export function moverLead(cnpj, etapa) { salvarEstado((s) => { s.etapas = { ...(s.etapas || {}), [cnpj]: etapa }; }); }

export function tipoCrm(e) { return estado().clientes?.includes(e.cnpj) ? "cliente" : e.crm?.tipo || null; }
export function tornarCliente(cnpj) { salvarEstado((s) => { s.clientes = [...new Set([...(s.clientes || []), cnpj])]; }); }

// ------------------------------------------------------------------ processos (fictícios + cadastrados pelo visitante)
export function processosDe(cnpj) {
  const s = estado();
  const consultado = s.consultas?.[cnpj];
  const retirados = new Set(s.retirados || []);
  const base = PROCESSOS.filter((p) => p.cnpj === cnpj && (p.origem === "manual" || consultado))
    .map((p) => ({ ...p, favorito: s.favProc?.[p.id] ?? p.favorito, etiquetas: s.etiquetas?.[p.id] ?? p.etiquetas,
      andamentos: [...(s.andamentos?.[p.id] || []), ...p.andamentos] }));
  const manuais = (s.processosManuais || []).filter((p) => p.cnpj === cnpj);
  return [...manuais, ...base].filter((p) => !retirados.has(p.id));
}
export function cadastrarProcesso(cnpj, dados) {
  const id = `m${Date.now()}`;
  salvarEstado((s) => {
    s.processosManuais = [{ id, cnpj, origem: "manual", vinculo: null, etiquetas: [], favorito: false, andamentos: [], partes: [], ultimaPublicacao: null, ...dados }, ...(s.processosManuais || [])];
  });
  return id;
}
export function marcarProcesso(id, campo, valor) { salvarEstado((s) => { s[campo] = { ...(s[campo] || {}), [id]: valor }; }); }
export function retirarProcesso(id) { salvarEstado((s) => { s.retirados = [...new Set([...(s.retirados || []), id])]; }); }
export function registrarAndamento(id, texto) {
  salvarEstado((s) => { s.andamentos = { ...(s.andamentos || {}), [id]: [{ data: hojeIso(), texto }, ...((s.andamentos || {})[id] || [])] }; });
}

// Consulta automática simulada: cada fonte responde com os processos fictícios daquele tribunal (ou falha, se configurado).
export const FONTES = [
  { id: "TRT3", nome: "TRT3 · Justiça do Trabalho (MG)", metodo: "pelo CNPJ" },
  { id: "TRF6", nome: "TRF6 · Justiça Federal (MG)", metodo: "pela razão social (vínculo a confirmar)" },
  { id: "TJMG", nome: "TJMG · Justiça Estadual (MG)", metodo: "pelo CNPJ" },
];
export function consultaDe(cnpj) { return estado().consultas?.[cnpj] || null; }
export function resultadoSimulado(cnpj) {
  const falhas = CONSULTA_FONTES[cnpj.slice(0, 8)] || {};
  return Object.fromEntries(FONTES.map((f) => [f.id, falhas[f.id] === "falha"
    ? { estado: "falha", n: 0, ms: 20000 + Math.round(Math.random() * 3000) }
    : { estado: "ok", n: PROCESSOS.filter((p) => p.cnpj === cnpj && p.tribunal === f.id && p.origem === "automatica").length, ms: 900 + Math.round(Math.random() * 2400) }]));
}
export function gravarConsulta(cnpj, fontes) {
  salvarEstado((s) => { s.consultas = { ...(s.consultas || {}), [cnpj]: { em: new Date().toISOString(), fontes } }; });
}

export function notasDe(cnpj) { return estado().notas?.[cnpj] || []; }
export function registrarNota(cnpj, texto) {
  salvarEstado((s) => { s.notas = { ...(s.notas || {}), [cnpj]: [{ texto, em: new Date().toISOString() }, ...((s.notas || {})[cnpj] || [])] }; });
}
