// Modo atendimento: fila de uma lista, empresa atual com contexto e registro do resultado do contato.
import { EMPRESAS, ETAPAS, nomeEmpresa } from "../dados.js";
import { etapaLead, moverLead, tipoCrm } from "../crm.js";
import { avisar, cnpjFmt, esc, icone, moeda } from "../util.js";

export function tela(rota) {
  const fila = EMPRESAS.filter((e) => tipoCrm(e) === "lead");
  const i = Math.min(Number(rota.q.i || 0), fila.length - 1);
  const e = fila[i];
  const [, etapa, cor] = ETAPAS.find((x) => x[0] === etapaLead(e)) || ETAPAS[0];
  const divida = e.dividas.federal[0] + e.dividas.estadual[0] + e.dividas.municipal[0];
  const html = `<div class="pagina"><div class="grade-2">
    <section class="cartao pad" style="display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="chip cinza quadrado">${i + 1} de ${fila.length}</span><span class="chip quadrado" style="background:#F5F4F1"><i style="width:8px;height:8px;border-radius:50%;background:${cor}"></i>${esc(etapa)}</span>
        <a class="link" style="margin-left:auto" href="#/empresa/${e.cnpj}">Abrir ficha completa →</a></div>
      <div><h2 style="margin:0;font-size:26px;letter-spacing:-.015em">${esc(nomeEmpresa(e))}</h2><div class="legenda num">${esc(e.razao)} · ${cnpjFmt(e.cnpj)} · ${esc(e.municipio)}/MG</div></div>
      <div class="grade-3"><div class="esfera"><span>Débitos identificados</span><b class="v">${moeda(divida)}</b></div><div class="esfera"><span>Regime declarado</span><b style="font-size:15px">${esc(e.regime)}</b></div><div class="esfera"><span>Sócio principal</span><b style="font-size:15px">${esc(e.socios[0][0])}</b></div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${e.telefones.map(([t, cel]) => `<button class="btn" data-ligar="${esc(t)}">${icone(cel ? "whats" : "tel", 14)}${esc(t)}</button>`).join("")}</div>
    </section>
    <form class="cartao pad" data-registro style="display:flex;flex-direction:column;gap:12px"><b style="font-size:15px">Registrar o contato</b>
      <label class="campo">Resultado<select name="r"><option>Atendeu</option><option>Não atendeu</option><option>Retornar</option><option>Sem interesse</option></select></label>
      <label class="campo">Próxima etapa<select name="etapa">${ETAPAS.map(([k, l]) => `<option value="${k}" ${k === etapaLead(e) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
      <label class="campo">Nota<textarea name="n" placeholder="O que foi combinado"></textarea></label>
      <button class="btn primario">Registrar e ir para o próximo</button><a class="btn" href="#/atendimento?i=${(i + 1) % fila.length}">Pular</a></form>
  </div></div>`;
  return { titulo: "Modo atendimento", html, montar: (el) => {
    el.querySelectorAll("[data-ligar]").forEach((b) => b.addEventListener("click", () => avisar(`Demonstração: no CAPTA, o computador discaria ${b.dataset.ligar}.`)));
    el.querySelector("[data-registro]").addEventListener("submit", (ev) => {
      ev.preventDefault();
      moverLead(e.cnpj, new FormData(ev.target).get("etapa"));
      avisar("Contato registrado no histórico da empresa.");
      location.hash = `#/atendimento?i=${(i + 1) % fila.length}`;
    });
  } };
}
