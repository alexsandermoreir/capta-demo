// Configurações: organização, integrações (estado honesto: nada conectado na demonstração) e dados da demonstração.
import { ORGANIZACAO } from "../dados.js";
import { avisar, dialogo, esc, icone, restaurarDemonstracao } from "../util.js";

const NAV = [["org", "Organização e numeração"], ["integ", "Integrações"], ["notif", "Notificações"], ["demo", "Dados da demonstração"]];
const INTEG = [
  ["WhatsApp Business", "API oficial da Meta (Cloud API)", "Envio com consentimento e janela de 24 h; webhook HTTPS para receber mensagens e status."],
  ["Conta Google", "Drive, Agenda/Meet e Gmail (OAuth)", "Pastas das empresas, reuniões com convites e e-mails com anexos."],
  ["Processos por CNPJ (DJEN · CNJ)", "API pública, sem chave", "Consulta automática de TRT3, TRF6 e TJMG ao abrir a ficha."],
  ["Tribunais (DataJud · CNJ)", "Chave pública da API", "Complementa processos pelo número: distribuição, grau, assuntos e movimentações."],
  ["Google Maps", "Maps Embed API", "Mapa só com coordenadas oficiais; nada é estimado pelo endereço."],
  ["Telefonia", "Provedor VoIP (opcional)", "Sem provedor: chamadas pelo aplicativo do sistema (tel:) e registro manual."],
];

export function tela(rota) {
  const sec = rota.partes[0] || "org";
  let corpo;
  if (sec === "integ") {
    corpo = `<div style="display:flex;flex-direction:column;gap:12px">${INTEG.map(([n, s, d], i) => `<section class="cartao pad" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
      <span style="width:40px;height:40px;border-radius:10px;background:var(--azul-claro);color:var(--marinho);display:flex;align-items:center;justify-content:center">${icone(["whats", "calendario", "balanca", "balanca", "pino", "tel"][i], 18)}</span>
      <div style="flex:1;min-width:220px"><b style="font-size:15px">${esc(n)}</b><div class="legenda">${esc(s)} · ${esc(d)}</div></div>
      <span class="chip ${i === 2 ? "verde" : "cinza"} quadrado">${i === 2 ? "Ativa (simulada)" : "Não configurado"}</span><button class="btn peq" data-conf="${esc(n)}">Configurar</button></section>`).join("")}
      <div class="aviso cinza">${icone("info", 16)}<span>Estados verdadeiros: no CAPTA, uma integração só aparece como “conectado” depois de um teste real. Segredos ficam no cofre do sistema (ou no .env do servidor), nunca no banco nem no navegador.</span></div></div>`;
  } else if (sec === "demo") {
    corpo = `<section class="cartao pad" style="max-width:720px;display:flex;flex-direction:column;gap:12px"><b style="font-size:15px">Dados da demonstração</b>
      <p style="margin:0;font-size:13px;line-height:1.6;color:var(--texto)">Todas as empresas, pessoas, CNPJs e processos desta versão são <b>fictícios</b>. O que você muda (favoritos, etapas do Kanban, notas, processos cadastrados, consultas) fica guardado só neste navegador.</p>
      <button class="btn" style="align-self:flex-start" data-restaurar>${icone("atualizar", 14)}Restaurar dados originais da demonstração</button></section>`;
  } else if (sec === "notif") {
    corpo = `<section class="cartao pad" style="max-width:720px">${[["Mudanças em débitos das empresas acompanhadas", true], ["Andamentos novos em processos acompanhados", true], ["Mensagens recebidas no WhatsApp", true], ["Propostas perto de vencer", false]]
      .map(([t, on]) => `<label style="display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--borda-3);font-size:14px">${t}<input type="checkbox" ${on ? "checked" : ""} data-notif></label>`).join("")}</section>`;
  } else {
    corpo = `<section class="cartao pad" style="max-width:820px;display:flex;flex-direction:column;gap:16px"><b style="font-size:15px">Organização</b>
      <div class="dados-grade" style="grid-template-columns:repeat(2,minmax(0,1fr))">
        <label class="campo">Nome do escritório<input value="${esc(ORGANIZACAO.escritorio)}"></label><label class="campo">Responsável padrão<input value="${esc(ORGANIZACAO.responsavel)}"></label>
        <label class="campo">Prefixo dos clientes<input value="EMP-" disabled></label><label class="campo">Prefixo das propostas<input value="PROP-AAAA-" disabled></label></div>
      <button class="btn primario" style="align-self:flex-start" data-salvar>Salvar</button></section>`;
  }
  const html = `<div class="pagina" style="display:grid;grid-template-columns:240px minmax(0,1fr);gap:24px;align-items:start">
    <nav class="cartao" style="padding:8px;display:flex;flex-direction:column;gap:2px" aria-label="Seções">${NAV.map(([k, l]) => `<a class="subitem ${k === sec ? "ativo" : ""}" href="#/config/${k}"><span>${l}</span></a>`).join("")}</nav>
    <div>${corpo}</div></div>`;
  return { titulo: "Configurações", html, montar: (el) => {
    el.querySelectorAll("[data-conf]").forEach((b) => b.addEventListener("click", () => dialogo({ titulo: `Configurar ${b.dataset.conf}`, confirmar: null, cancelar: "Fechar",
      campos: [{ tipo: "aviso", nivel: "azul", texto: "No CAPTA instalado, esta tela traz o passo a passo, os campos de configuração e o botão “Testar conexão”. Nesta demonstração nenhuma integração é conectada e nenhum dado sai do navegador." }] })));
    el.querySelector("[data-restaurar]")?.addEventListener("click", () => { restaurarDemonstracao(); avisar("Dados originais da demonstração restaurados."); location.hash = "#/inicio"; });
    el.querySelector("[data-salvar]")?.addEventListener("click", () => avisar("Demonstração: configurações não são gravadas."));
    el.querySelectorAll("[data-notif]").forEach((c) => c.addEventListener("change", () => avisar("Preferência de notificação alterada (demonstração).")));
  } };
}
