// Leads: listas salvas e pipeline comercial (Kanban com arrastar e soltar, e lista).
import { EMPRESAS, ETAPAS, LISTAS, nomeEmpresa } from "../dados.js";
import { etapaLead, moverLead, tipoCrm } from "../crm.js";
import { avisar, cnpjFmt, dataBr, esc, icone, moeda } from "../util.js";

const membros = (lista) => EMPRESAS.filter((e) => tipoCrm(e) && (e.crm?.lista ?? 1) === lista.id);

function abas(cid, vista) {
  return `<nav class="abas" style="padding:0 40px;background:#fff" aria-label="Leads"><a class="aba ${!cid ? "ativa" : ""}" href="#/leads">Listas salvas <span class="chip cinza">${LISTAS.length}</span></a>
    <a class="aba ${cid ? "ativa" : ""}" href="#/leads/${cid || 1}/${vista || "kanban"}">Pipeline comercial</a></nav>`;
}

function listas() {
  const html = `${abas(null)}<div class="pagina">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><p class="legenda" style="margin:0;font-size:13px">Cada lista nasce de uma busca salva e vira um pipeline com etapas.</p><a class="btn primario" href="#/busca">${icone("mais", 14)}Salvar uma nova busca</a></div>
    <div class="grade-2" style="grid-template-columns:repeat(2,minmax(0,1fr))">${LISTAS.map((l) => {
      const m = membros(l);
      const por = ETAPAS.map(([k, , cor]) => [cor, m.filter((e) => etapaLead(e) === k).length]).filter((x) => x[1]);
      const divida = m.reduce((a, e) => a + e.dividas.federal[0] + e.dividas.estadual[0], 0);
      return `<a class="cartao pad" href="#/leads/${l.id}/kanban" style="display:flex;flex-direction:column;gap:12px;color:var(--tinta)">
        <div style="display:flex;gap:12px;align-items:flex-start"><span style="width:36px;height:36px;border-radius:9px;background:${l.cor};color:#fff;display:flex;align-items:center;justify-content:center">${icone("predio", 17)}</span>
          <div style="flex:1"><b style="font-size:16px">${esc(l.nome)}</b><div class="legenda">${esc(l.descricao)}</div></div><span class="chip cinza">${m.length} empresas</span></div>
        <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;gap:2px">${por.map(([cor, n]) => `<i style="flex:${n};background:${cor}"></i>`).join("")}</div>
        <div style="display:flex;gap:16px;font-size:12px;color:var(--suave);flex-wrap:wrap"><span>Criada em ${dataBr(l.criada)}</span><span>Dívida somada ${moeda(divida)}</span><span style="margin-left:auto;color:var(--marinho-2);font-weight:600">Abrir no Kanban →</span></div></a>`;
    }).join("")}</div></div>`;
  return { titulo: "Leads", html };
}

function pipeline(rota) {
  const cid = Number(rota.partes[0]) || 1;
  const vista = rota.partes[1] || "kanban";
  const lista = LISTAS.find((l) => l.id === cid) || LISTAS[0];
  const m = membros(lista);
  const filtroResp = rota.q.resp || "";
  const visiveis = m.filter((e) => !filtroResp || (e.crm?.resp || "") === filtroResp);
  const cartao = (e) => {
    const cel = e.telefones.find((t) => t[1]);
    return `<div class="lead" draggable="true" data-cnpj="${e.cnpj}"><b>${esc(nomeEmpresa(e))}</b><span class="num legenda">${cnpjFmt(e.cnpj)}</span>
      <span class="legenda">○ ${esc(cel ? cel[0] : e.telefones[0][0])}</span><span class="prox">${icone("calendario", 12)} ${e.crm?.resp ? `Responsável: ${esc(e.crm.resp)}` : "Sem próxima ação"}</span>
      <div style="display:flex;gap:6px;padding-top:8px;border-top:1px solid var(--borda-3)"><a class="btn peq" style="flex:1" href="#/empresa/${e.cnpj}">Perfil</a><a class="btn peq verde" style="flex:1" href="#/empresa/${e.cnpj}/comunicacao/whatsapp">${icone("whats", 12)}WhatsApp</a></div></div>`;
  };
  const corpo = vista === "lista"
    ? `<section class="cartao" style="overflow-x:auto"><table class="tabela" style="min-width:760px"><thead><tr><th>Empresa</th><th>CNPJ</th><th>Etapa</th><th>Responsável</th><th>Dívida</th></tr></thead><tbody>${visiveis.map((e) => { const [, l, cor] = ETAPAS.find((x) => x[0] === etapaLead(e)) || ETAPAS[0]; return `<tr class="clicavel" data-href="#/empresa/${e.cnpj}"><td><b style="font-weight:600">${esc(nomeEmpresa(e))}</b></td><td class="num">${cnpjFmt(e.cnpj)}</td><td><span style="display:flex;gap:6px;align-items:center"><i style="width:8px;height:8px;border-radius:50%;background:${cor}"></i>${esc(l)}</span></td><td>${esc(e.crm?.resp || "—")}</td><td class="num">${moeda(e.dividas.federal[0] + e.dividas.estadual[0])}</td></tr>`; }).join("")}</tbody></table></section>`
    : `<div class="kanban" aria-label="Pipeline">${ETAPAS.map(([k, l, cor]) => { const itens = visiveis.filter((e) => etapaLead(e) === k); return `<section class="coluna" data-etapa="${k}" aria-label="${esc(l)}"><header><i style="background:${cor}"></i><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(l)}</span><span class="legenda">${itens.length}</span></header>${itens.map(cartao).join("")}<span class="legenda" style="padding:2px 4px">+ Adicionar lead</span></section>`; }).join("")}</div>`;
  const html = `${abas(cid, vista)}<div class="pagina">
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <label class="filtro-sel"><span>Lista</span><select data-lista>${LISTAS.map((l) => `<option value="${l.id}" ${l.id === cid ? "selected" : ""}>${esc(l.nome)}</option>`).join("")}</select></label>
      <div class="segmentado">${[["kanban", "Kanban"], ["lista", "Lista"]].map(([v, r]) => `<button data-vista="${v}" class="${v === vista ? "ativo" : ""}">${r}</button>`).join("")}</div>
      <label class="filtro-sel"><span>Responsável</span><select data-resp><option value="">Todos</option>${["Ana Beatriz", "Carlos Menezes"].map((r) => `<option ${r === filtroResp ? "selected" : ""}>${r}</option>`).join("")}</select></label>
      <span class="legenda" style="margin-left:auto">${visiveis.length} empresas ${vista === "kanban" ? "· arraste os cards entre as etapas" : ""}</span>
    </div>${corpo}</div>`;
  return { trilha: [["Leads", "#/leads"], lista.nome], html, montar: (el) => {
    el.querySelector("[data-lista]").addEventListener("change", (ev) => { location.hash = `#/leads/${ev.target.value}/${vista}`; });
    el.querySelector("[data-resp]").addEventListener("change", (ev) => { location.hash = `#/leads/${cid}/${vista}${ev.target.value ? `?resp=${encodeURIComponent(ev.target.value)}` : ""}`; });
    el.querySelectorAll("[data-vista]").forEach((b) => b.addEventListener("click", () => { location.hash = `#/leads/${cid}/${b.dataset.vista}`; }));
    el.querySelectorAll("tr[data-href]").forEach((tr) => tr.addEventListener("click", () => { location.hash = tr.dataset.href; }));
    let arrastado = null;
    el.querySelectorAll(".lead").forEach((c) => {
      c.addEventListener("dragstart", (ev) => { arrastado = c.dataset.cnpj; c.classList.add("arrastando"); ev.dataTransfer.effectAllowed = "move"; ev.dataTransfer.setData("text/plain", arrastado); });
      c.addEventListener("dragend", () => c.classList.remove("arrastando"));
    });
    el.querySelectorAll(".coluna").forEach((col) => {
      col.addEventListener("dragover", (ev) => { ev.preventDefault(); col.classList.add("sobre"); });
      col.addEventListener("dragleave", () => col.classList.remove("sobre"));
      col.addEventListener("drop", (ev) => {
        ev.preventDefault();
        col.classList.remove("sobre");
        const cnpj = ev.dataTransfer.getData("text/plain") || arrastado;
        const e = EMPRESAS.find((x) => x.cnpj === cnpj);
        if (!e || etapaLead(e) === col.dataset.etapa) return;
        moverLead(cnpj, col.dataset.etapa);
        avisar(`${nomeEmpresa(e)} → ${ETAPAS.find((x) => x[0] === col.dataset.etapa)[1]} (registrado no histórico).`);
        window.dispatchEvent(new Event("capta:atualizar"));
      });
    });
  } };
}

export function tela(rota) { return rota.partes.length ? pipeline(rota) : listas(); }
