// Propostas com aceite: lista (por etapa) e a proposta (verificação antes do envio + documento).
import { ETAPA_PROPOSTA, ORGANIZACAO, PROPOSTAS, empresa, nomeEmpresa } from "../dados.js";
import { avisar, cnpjFmt, dataBr, dialogo, esc, icone, moeda } from "../util.js";

function lista(rota) {
  const sit = rota.q.situacao || "todas";
  const itens = PROPOSTAS.filter((p) => sit === "todas" || p.etapa === sit);
  const cards = [["todas", "Todas", PROPOSTAS.length], ...Object.entries(ETAPA_PROPOSTA).map(([k, [l]]) => [k, l, PROPOSTAS.filter((p) => p.etapa === k).length])];
  const html = `<div class="pagina">
    <div style="display:flex;gap:10px;flex-wrap:wrap">${cards.map(([k, l, n]) => `<a class="cartao" href="#/propostas?situacao=${k}" style="padding:12px 16px;min-width:130px;color:var(--tinta);${k === sit ? "border-color:var(--marinho);box-shadow:0 0 0 3px rgba(28,50,83,.08)" : ""}"><small class="legenda">${l}</small><div style="font-size:20px;font-weight:600">${n}</div></a>`).join("")}
      <button class="btn primario" style="margin-left:auto;align-self:center" data-nova>${icone("mais", 14)}Nova proposta</button></div>
    <section class="cartao" style="overflow-x:auto"><table class="tabela" style="min-width:880px"><thead><tr><th>Proposta</th><th>Empresa</th><th>Situação</th><th>Valores</th><th>Validade</th><th>Responsável</th></tr></thead><tbody>
      ${itens.map((p) => { const e = empresa(p.cnpj); const [l, cor] = ETAPA_PROPOSTA[p.etapa]; return `<tr class="clicavel" data-href="#/propostas/${p.id}"><td><b class="num" style="font-weight:600">${p.numero}</b><div class="legenda">${esc(p.titulo)} · v${p.versao}</div></td>
        <td>${esc(nomeEmpresa(e))}<div class="legenda num">${cnpjFmt(e.cnpj)}</div></td><td><span class="chip ${cor} quadrado">${l}</span>${p.enviada ? `<div class="legenda">Enviada em ${dataBr(p.enviada)}</div>` : ""}</td>
        <td class="num">Fixo ${moeda(p.fixo)}${p.mensal ? `<div class="legenda">Mensal ${moeda(p.mensal)}</div>` : ""}</td><td>${p.validade ? dataBr(p.validade) : "—"}</td><td>${esc(p.resp)}</td></tr>`; }).join("")}
    </tbody></table>${itens.length ? "" : '<div class="vazio" style="margin:16px">Nenhuma proposta nesta situação.</div>'}</section></div>`;
  return { titulo: "Propostas", html, montar: (el) => {
    el.querySelectorAll("tr[data-href]").forEach((tr) => tr.addEventListener("click", () => { location.hash = tr.dataset.href; }));
    el.querySelector("[data-nova]").addEventListener("click", () => avisar("Demonstração: no CAPTA, escolha a empresa e a proposta nasce como rascunho numerado."));
  } };
}

function detalhe(rota) {
  const p = PROPOSTAS.find((x) => String(x.id) === rota.partes[0]);
  if (!p) return { trilha: [["Propostas", "#/propostas"], "Não encontrada"], html: '<div class="pagina"><div class="vazio">Proposta não encontrada.</div></div>' };
  const e = empresa(p.cnpj);
  const [l, cor] = ETAPA_PROPOSTA[p.etapa];
  const itensVer = [["Partes e identificação completas", true], ["Resumo executivo revisado", true], ["Objeto e escopo revisados", true], ["Honorários com valor e vencimento", true],
    ["Despesas e reembolsos revisados", p.etapa !== "rascunho"], ["Responsabilidades revisadas", p.etapa !== "rascunho"], ["Vigência e encerramento revisados", p.etapa !== "rascunho"], ["Revisão jurídica do aceite", p.etapa !== "rascunho"]];
  const ok = itensVer.filter((x) => x[1]).length;
  const html = `<div class="pagina"><div class="grade-2">
    <article class="cartao" style="padding:40px 48px;display:flex;flex-direction:column;gap:16px;font-size:14px;line-height:1.6" aria-label="Documento para o cliente">
      <div style="display:flex;justify-content:space-between;gap:12px;border-bottom:2px solid var(--marinho);padding-bottom:14px"><b style="font-size:16px;color:var(--marinho)">${esc(ORGANIZACAO.escritorio)}</b><span class="legenda">${p.numero} · v${p.versao}</span></div>
      <b style="font-size:13px;letter-spacing:.06em;color:var(--suave)">PROPOSTA DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS</b>
      <h2 style="margin:0;font-size:24px;letter-spacing:-.015em">${esc(p.titulo)}</h2>
      <p style="margin:0"><b>Contratante:</b> ${esc(e.razao)} · CNPJ ${cnpjFmt(e.cnpj)} · ${esc(e.endereco)}, ${esc(e.municipio)}/MG.</p>
      <p style="margin:0"><b>1. Resumo executivo.</b> Atuação para ${esc(p.titulo.toLowerCase())}, com acompanhamento das fontes oficiais e relatórios periódicos ao contratante.</p>
      <p style="margin:0"><b>2. Honorários.</b> Valor fixo de ${moeda(p.fixo)}${p.mensal ? ` e honorários mensais de ${moeda(p.mensal)}` : ""}, conforme as condições desta proposta.</p>
      <p style="margin:0"><b>3. Vigência.</b> ${p.validade ? `Proposta válida até ${dataBr(p.validade)}.` : "Proposta aceita."} Aceite registrado no CAPTA com comprovante.</p>
      <div style="margin-top:12px;padding:14px;border:1px dashed var(--borda-4);border-radius:10px;color:var(--suave);font-size:12px">Documento fictício de demonstração. No CAPTA, o PDF é gerado com o kit de marca do escritório e código de integridade.</div>
    </article>
    <aside style="display:flex;flex-direction:column;gap:16px">
      <section class="cartao pad"><div class="cartao-titulo"><h3>Situação</h3><span class="chip ${cor} quadrado">${l}</span></div>
        <div class="legenda" style="line-height:1.7">${esc(nomeEmpresa(e))}<br>Responsável: ${esc(p.resp)}${p.enviada ? `<br>Enviada em ${dataBr(p.enviada)}` : ""}${p.aceita ? `<br>Aceita em ${dataBr(p.aceita)}` : ""}</div></section>
      <section class="cartao pad" aria-label="Verificação antes do envio"><div class="cartao-titulo"><h3>Verificação antes do envio</h3><span class="chip ${ok === 8 ? "verde" : "ambar"} quadrado">${ok} de 8</span></div>
        ${itensVer.map(([t, v]) => `<div style="display:flex;gap:8px;align-items:center;padding:6px 0;font-size:13px;color:${v ? "var(--tinta)" : "var(--suave)"}"><span style="color:${v ? "var(--verde-vivo)" : "var(--borda-4)"}">${icone(v ? "check" : "info", 15)}</span>${t}</div>`).join("")}
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px"><button class="btn primario" data-enviar ${ok < 8 || ["aceite", "recusada"].includes(p.etapa) ? "disabled" : ""}>${icone("whats", 14)}Enviar por WhatsApp</button>
          <button class="btn" data-enviar ${ok < 8 || ["aceite", "recusada"].includes(p.etapa) ? "disabled" : ""}>Enviar por e-mail</button><button class="btn" data-pdf>${icone("doc", 14)}Gerar PDF</button></div></section>
    </aside></div></div>`;
  return { trilha: [["Propostas", "#/propostas"], `${p.numero} · ${nomeEmpresa(e)}`], html, montar: (el) => {
    el.querySelectorAll("[data-enviar]").forEach((b) => b.addEventListener("click", () => dialogo({ titulo: "Enviar proposta ao cliente", subtitulo: `${p.numero} · ${nomeEmpresa(e)}`, confirmar: "Entendi", cancelar: null,
      campos: [{ tipo: "aviso", nivel: "azul", texto: "No CAPTA, a tela mostra destinatário, texto e anexo (PDF da versão) para você confirmar. Com WhatsApp Business ou Gmail conectados, o envio sai pela integração e só é registrado se o serviço aceitar; sem integração, o envio é manual e confirmado depois." },
        { tipo: "aviso", nivel: "cinza", texto: "Nesta demonstração nada é enviado." }] })));
    el.querySelector("[data-pdf]").addEventListener("click", () => window.print());
  } };
}

export function tela(rota) { return rota.partes.length ? detalhe(rota) : lista(rota); }
