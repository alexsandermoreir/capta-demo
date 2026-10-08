// WhatsApp: pastas, lista de conversas e conversa (com consentimento, janela de 24 h, nota interna e envio simulado).
import { CONVERSAS, empresa, nomeEmpresa } from "../dados.js";
import { avisar, dataBr, esc, estado, horaAgora, icone, iniciais, salvarEstado } from "../util.js";

const quando = (min) => { const d = new Date(Date.now() - min * 60000); return min < 60 * 20 ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : dataBr(d.toISOString()); };

export function tela(rota) {
  const pasta = rota.q.pasta || "todas";
  const aberta = Number(rota.partes[0]);
  if (aberta) salvarEstado((st) => { st.lidas = [...new Set([...(st.lidas || []), aberta])]; });   // abrir a conversa marca como lida
  const s = estado();
  const lidas = new Set(s.lidas || []);
  const extras = s.mensagensWa || {};
  const conv = CONVERSAS.map((c) => ({ ...c, naoLidas: lidas.has(c.id) ? 0 : c.naoLidas }));
  const filtradas = conv.filter((c) => pasta === "todas" || (pasta === "naolidas" ? c.naoLidas : pasta === "encerradas" ? c.status === "encerrada" : c.status === "aberta"));
  const id = Number(rota.partes[0]) || filtradas[0]?.id;
  const atual = conv.find((c) => c.id === id);
  const pastas = [["todas", "Todas", conv.length], ["naolidas", "Não lidas", conv.filter((c) => c.naoLidas).length], ["abertas", "Abertas", conv.filter((c) => c.status === "aberta").length], ["encerradas", "Encerradas", conv.filter((c) => c.status === "encerrada").length]];
  const msgs = atual ? [...atual.mensagens.map(([d, t, min]) => ({ d, t, q: quando(min) })), ...(extras[atual.id] || [])] : [];
  const e = atual && empresa(atual.cnpj);
  const html = `<div class="wa">
    <nav class="wa-pastas" aria-label="Pastas">${pastas.map(([k, l, n]) => `<button class="${k === pasta ? "ativo" : ""}" data-pasta="${k}"><span>${l}</span><span class="legenda">${n}</span></button>`).join("")}
      <div style="margin-top:auto" class="aviso ambar">${icone("info", 15)}<span style="font-size:12px"><b>WhatsApp Business (demonstração).</b> No CAPTA, com a API da Meta conectada, o envio exige consentimento registrado e respeita a janela de 24 h.</span></div></nav>
    <section class="wa-lista" aria-label="Conversas"><div style="padding:16px;border-bottom:1px solid var(--borda-3)"><label class="caixa-busca">${icone("busca", 15)}<input placeholder="Buscar conversas ou empresas" aria-label="Buscar conversas"></label></div>
      <div style="overflow-y:auto">${filtradas.map((c) => { const em = empresa(c.cnpj); const ult = c.mensagens[c.mensagens.length - 1]; return `<a class="wa-item ${c.id === id ? "ativo" : ""}" href="#/conversas/${c.id}${pasta !== "todas" ? `?pasta=${pasta}` : ""}" style="color:var(--tinta)">
        <span class="iniciais" style="width:40px;height:40px">${iniciais(c.contato)}</span><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
        <div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:14px">${esc(c.contato)}</b><small class="legenda">${quando(ult[2])}</small></div>
        <span class="legenda" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nomeEmpresa(em))} · ${esc(c.telefone)}</span>
        <span style="font-size:13px;color:var(--texto);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ult[0] === "nota" ? "Nota: " : ""}${esc(ult[1])}</span>
        <div style="display:flex;gap:6px;align-items:center"><span class="chip ${c.papel === "Cliente" ? "verde" : "azul"} quadrado" style="font-size:11px;padding:1px 7px">${c.papel}</span>${c.naoLidas ? `<span class="selo" style="margin-left:auto">${c.naoLidas}</span>` : ""}</div></div></a>`; }).join("")}</div></section>
    <section class="wa-chat" aria-label="Conversa">${atual ? `
      <header style="display:flex;align-items:center;gap:12px;padding:14px 20px;background:#fff;border-bottom:1px solid var(--borda)"><span class="iniciais" style="width:40px;height:40px">${iniciais(atual.contato)}</span>
        <div style="flex:1;min-width:0"><b style="font-size:15px">${esc(atual.contato)}</b><div class="legenda">${esc(nomeEmpresa(e))} · ${esc(atual.telefone)} · ${atual.status === "aberta" ? "Em atendimento" : "Encerrada"}</div></div>
        <a class="btn peq primario" href="#/empresa/${atual.cnpj}">Perfil da empresa</a></header>
      <div style="padding:10px 20px;background:#fff;border-bottom:1px solid var(--borda-3);font-size:12px;display:flex;flex-direction:column;gap:4px">
        <span>${atual.optin ? '<span style="color:var(--verde)">●</span> Consentimento registrado (opt-in)' : '<span style="color:var(--ambar-vivo)">●</span> Sem consentimento registrado (necessário para enviar pela API) · <button class="link" data-optin>Registrar consentimento</button>'}</span>
        <span>${atual.janela ? '<span style="color:var(--verde)">●</span> Janela de 24 h aberta: mensagens livres permitidas' : '<span style="color:var(--ambar-vivo)">●</span> Fora da janela de 24 h: só modelos aprovados pela Meta'}</span></div>
      <div class="wa-msgs" data-msgs>${msgs.map((m) => `<div class="bolha ${m.d === "saida" ? "minha" : m.d === "nota" ? "nota" : ""}">${m.d === "nota" ? '<b style="font-size:11px;color:var(--ambar-escuro)">Nota interna · visível só para a equipe</b><br>' : ""}${esc(m.t)}<small>${m.q}</small></div>`).join("")}</div>
      <form data-enviar style="display:flex;gap:8px;padding:14px 20px;background:#fff;border-top:1px solid var(--borda)">
        <select name="tipo" class="entrada" style="width:150px"><option value="saida">Mensagem</option><option value="nota">Nota interna</option></select>
        <input name="texto" class="entrada" placeholder="${atual.janela ? "Escreva uma mensagem…" : "Fora da janela: escolha um modelo aprovado"}" autocomplete="off" required>
        <button class="btn primario" style="height:42px">${icone("enviar", 15)}Enviar</button></form>` : '<div class="vazio" style="margin:40px">Nenhuma conversa nesta pasta.</div>'}</section>
  </div>`;
  return { titulo: "WhatsApp", html, montar: (el) => {
    el.querySelectorAll("[data-pasta]").forEach((b) => b.addEventListener("click", () => { location.hash = `#/conversas${b.dataset.pasta !== "todas" ? `?pasta=${b.dataset.pasta}` : ""}`; }));
    const box = el.querySelector("[data-msgs]");
    if (box) box.scrollTop = box.scrollHeight;
    el.querySelector("[data-optin]")?.addEventListener("click", () => avisar("Demonstração: no CAPTA, você registra como o contato autorizou (ex.: pediu contato em 03/10)."));
    el.querySelector("[data-enviar]")?.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const v = Object.fromEntries(new FormData(ev.target).entries());
      if (v.tipo === "saida" && !atual.janela) { avisar("Fora da janela de 24 h a Meta só aceita modelos aprovados.", "erro"); return; }
      salvarEstado((st) => { st.mensagensWa = { ...(st.mensagensWa || {}), [atual.id]: [...((st.mensagensWa || {})[atual.id] || []), { d: v.tipo, t: v.texto, q: horaAgora() }] }; });
      avisar(v.tipo === "nota" ? "Nota interna salva (nunca é enviada ao contato)." : "Demonstração: mensagem registrada; no CAPTA ela sairia pela API após a confirmação.");
      window.dispatchEvent(new Event("capta:atualizar"));
    });
  } };
}
