// Ficha da empresa: cabeçalho, abas e subabas como no CAPTA. Jurídico › Processos simula a consulta automática por CNPJ
// (TRT3, TRF6 e TJMG em paralelo), com estado por tribunal, falha isolada, deduplicação e detalhes de cada processo.
import { ALTERACOES, CONVERSAS, EMPRESAS, ETAPAS, PROPOSTAS, ETAPA_PROPOSTA, empresa, nomeEmpresa } from "../dados.js";
import {
  FONTES, alternarFavorito, cadastrarProcesso, consultaDe, etapaLead, favoritos, gravarConsulta, marcarProcesso, notasDe,
  processosDe, registrarAndamento, registrarNota, resultadoSimulado, retirarProcesso, tipoCrm, tornarCliente,
} from "../crm.js";
import { avisar, cnpjFmt, dataBr, dialogo, esc, icone, iniciais, moeda, num } from "../util.js";

const ABAS = [
  ["resumo", "Resumo"], ["cadastro", "Cadastro", [["dados", "Dados cadastrais"], ["tributario", "Regime e histórico"], ["contatos", "Contatos"]]],
  ["juridico", "Jurídico", [["processos", "Processos"], ["debitos", "Débitos"], ["monitor", "Mudanças recentes"]]],
  ["planejamento", "Planejamento"], ["comunicacao", "Comunicação", [["whatsapp", "WhatsApp"], ["emails", "E-mails"], ["ligacoes", "Ligações"], ["reunioes", "Reuniões"]]],
  ["propostas", "Propostas"], ["grupo", "Grupo"], ["arquivos", "Arquivos"], ["notas", "Notas"],
];
const COR_AREA = { Tributário: ["#1C3253", "#EDF0F5"], Trabalhista: ["#8A5A7A", "#F4ECF1"], Civil: ["#2E7552", "#E8F2EC"] };
const POLO = { ativo: "Polo ativo", passivo: "Polo passivo", terceiro: "Terceiro interessado" };
const consultando = {};   // cnpj -> {TRT3: "rodando"|"ok"|"falha", ...} durante a simulação

export function tela(rota) {
  const e = empresa(rota.partes[0]);
  if (!e) return { trilha: [["Clientes e empresas", "#/clientes"], "Empresa não encontrada"], html: `<div class="pagina"><div class="vazio">Empresa não encontrada nesta demonstração. <a href="#/busca">Buscar empresas</a></div></div>` };
  const aba = rota.partes[1] || "resumo";
  const def = ABAS.find((a) => a[0] === aba) || ABAS[0];
  const sub = rota.partes[2] || (def[2] ? def[2][0][0] : "");
  const procs = processosDe(e.cnpj);
  const html = `${cabecalho(e, aba, procs.length)}${def[2] ? `<div style="padding:16px 32px 0" class="pilulas">${def[2].map(([k, l]) => `<a class="pilula ${k === sub ? "ativa" : ""}" href="#/empresa/${e.cnpj}/${def[0]}/${k}">${l}</a>`).join("")}</div>` : ""}
    <div class="ficha-corpo">${conteudo(e, def[0], sub, procs)}</div>`;
  return { trilha: [["Clientes e empresas", "#/clientes"], nomeEmpresa(e)], html, montar: (el) => montar(el, e, def[0], sub) };
}

function cabecalho(e, aba, nProc) {
  const t = tipoCrm(e);
  const fav = favoritos().has(e.cnpj);
  const celular = e.telefones.find((x) => x[1]);
  return `<section class="ficha-topo" aria-label="Cabeçalho da empresa">
    <div class="ficha-cab">
      <div class="ficha-avatar">${iniciais(nomeEmpresa(e))}</div>
      <div class="ficha-nome"><h2>${esc(nomeEmpresa(e))}
        ${t ? `<span class="chip ${t === "cliente" ? "verde" : "azul"} quadrado">${t === "cliente" ? "Cliente" : "Lead"}</span>` : ""}
        <span class="chip ${e.situacao === "Ativa" ? "cinza" : "vermelho"} quadrado">${esc(e.situacao)}</span>
        <button class="icone-btn" style="width:30px;height:30px;border:none;color:${fav ? "#C08A1E" : "#6F6B64"}" data-fav aria-pressed="${fav}" title="${fav ? "Tirar dos favoritos" : "Favoritar"}">${icone("estrela", 17, fav ? 'fill="#C08A1E"' : "")}</button></h2>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:13px;color:var(--suave)">
          <span class="chip cinza quadrado">${t === "cliente" ? esc(e.crm?.numero || "EMP-000099") : t === "lead" ? "Lead · sem número interno" : "Fora do CRM"}</span>
          <span>${esc(e.razao)} · <span class="num">${cnpjFmt(e.cnpj)}</span> · ${esc(e.cnae)} · ${esc(e.municipio)}/MG</span></div></div>
      <div class="ficha-acoes">
        <button class="btn" data-ligar>${icone("tel", 15)}Ligar</button>
        <a class="btn" href="#/empresa/${e.cnpj}/comunicacao/whatsapp">${icone("whats", 15)}WhatsApp</a>
        <a class="btn" href="#/empresa/${e.cnpj}/comunicacao/emails">${icone("email", 15)}E-mail</a>
        <button class="btn" data-proposta>${icone("doc", 15)}Criar proposta</button>
        ${t === "cliente" ? `<button class="btn primario" data-apresentacao>Gerar apresentação</button>` : `<button class="btn primario" data-cliente>${icone("usuario", 15)}Salvar como cliente</button>`}
      </div>
    </div>
    <nav class="abas" aria-label="Abas da empresa">${ABAS.map(([k, l]) => `<a class="aba ${k === aba ? "ativa" : ""}" href="#/empresa/${e.cnpj}/${k}">${l}${k === "juridico" && nProc ? `<span class="chip cinza">${nProc}</span>` : ""}</a>`).join("")}
      <span style="margin-left:auto;align-self:center;padding-bottom:6px" class="legenda">${celular ? `${icone("whats", 13)} ${esc(celular[0])}` : ""}</span></nav>
  </section>`;
}

function conteudo(e, aba, sub, procs) {
  if (aba === "resumo") return resumo(e);
  if (aba === "cadastro") return cadastro(e, sub);
  if (aba === "juridico") return sub === "debitos" ? debitos(e) : sub === "monitor" ? mudancas(e) : processos(e, procs);
  if (aba === "planejamento") return `<div class="aviso cinza" style="max-width:760px">${icone("info", 16)}<span><b>Planejamento tributário fica fora do CAPTA.</b> Simulações de regime, cenários e premissas pertencem ao SO Fiscal. O CAPTA mostra só o regime declarado nas fontes. <a href="#/empresa/${e.cnpj}/cadastro/tributario">Ver regime declarado</a></span></div>`;
  if (aba === "comunicacao") return comunicacao(e, sub);
  if (aba === "propostas") return propostas(e);
  if (aba === "grupo") return grupo(e);
  if (aba === "arquivos") return arquivos(e);
  return notas(e);
}

// ------------------------------------------------------------------ resumo
function resumo(e) {
  const d = e.dividas;
  const total = d.federal[0] + d.estadual[0] + d.municipal[0];
  const nInsc = d.federal[1] + d.estadual[1] + d.municipal[1];
  const pctF = total ? (d.federal[0] / total) * 100 : 0;
  const pctE = total ? (d.estadual[0] / total) * 100 : 0;
  const nota = notasDe(e.cnpj)[0];
  return `<div class="grade-2">
    <section class="cartao pad" aria-label="Débitos identificados">
      <div class="cartao-titulo"><div><h3>Débitos identificados</h3><small>Dívida ativa e pendências fiscais por esfera</small></div><span class="chip borda">${icone("calendario", 12)} Base importada em 11/09/2026</span></div>
      ${total ? `<div style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap"><span class="num" style="font-size:40px;font-weight:600;letter-spacing:-.02em">${moeda(total)}</span><span class="chip ambar quadrado">${nInsc} inscrições vigentes</span></div>
        <div style="display:flex;height:10px;border-radius:5px;overflow:hidden;gap:3px;margin:16px 0"><i style="width:${pctF}%;background:#1C3253"></i><i style="width:${pctE}%;background:#6C84A8"></i><i style="flex:1;background:#B9C6D8"></i></div>`
        : `<div class="debito-ok" style="margin:6px 0 16px"><b>${icone("check", 15)} Nenhum débito identificado</b><span>Federal, estadual e municipal consultados nas bases importadas.</span></div>`}
      <div class="grade-3">
        <div class="esfera"><b style="font-size:13px;display:flex;gap:6px;align-items:center"><i style="width:8px;height:8px;border-radius:2px;background:#1C3253"></i>Federal</b><b class="v">${moeda(d.federal[0])}</b><span>${d.federal[1]} inscrição(ões) em dívida ativa · ${d.federal[2]} ajuizada(s)</span><span class="legenda">Origem: PGFN</span></div>
        <div class="esfera"><b style="font-size:13px;display:flex;gap:6px;align-items:center"><i style="width:8px;height:8px;border-radius:2px;background:#6C84A8"></i>Estadual</b><b class="v">${moeda(d.estadual[0])}</b><span>${d.estadual[1]} inscrição(ões)</span><span class="legenda">Origem: SEF/MG · lista de 09/2026</span></div>
        <div class="esfera"><b style="font-size:13px;display:flex;gap:6px;align-items:center"><i style="width:8px;height:8px;border-radius:2px;background:#B9C6D8"></i>Municipal</b>${e.municipio === "Belo Horizonte" ? `<b class="v">${moeda(d.municipal[0])}</b><span>${d.municipal[1]} inscrição(ões)</span>` : `<b class="v indisp" style="font-size:20px">Não consultado</b><span>A fonte municipal disponível cobre só Belo Horizonte</span>`}<span class="legenda">Origem: PBH</span></div>
      </div>
      <div style="display:flex;justify-content:space-between;gap:12px;margin-top:16px;padding-top:14px;border-top:1px solid var(--borda-3);font-size:12px;color:var(--suave);flex-wrap:wrap"><span>Valores publicados pela fonte na competência indicada; podem ter sido atualizados, parcelados ou quitados depois.</span><a class="link" href="#/empresa/${e.cnpj}/juridico/debitos">Ver detalhamento →</a></div>
    </section>
    <section class="cartao pad" aria-label="Localização"><div class="cartao-titulo"><h3>Localização</h3><a class="link" href="#/config/integ">Configurar mapa</a></div>
      <div class="mapa-mini" style="height:220px">${icone("pino", 20)}<b style="color:var(--tinta);font-size:13px">Mapa não configurado</b><span style="max-width:260px">A base não tem coordenada para este endereço, e o CAPTA não estima posição a partir do endereço.</span></div>
      <p style="margin:14px 0 2px;font-size:14px">${esc(e.endereco)}, ${esc(e.bairro)}</p><p class="legenda" style="margin:0">${esc(e.municipio)}/MG · CEP ${esc(e.cep)}</p></section>
  </div>
  <div class="grade-2">
    <section class="cartao pad" aria-label="Dados da empresa"><div class="cartao-titulo"><h3>Dados da empresa</h3><small>Fonte: Receita Federal · 09/2026</small></div>
      <div class="dados-grade"><div><span class="rotulo-campo">Natureza jurídica</span><b>${esc(e.natureza)}</b></div><div><span class="rotulo-campo">Porte</span><b>${esc(e.porte)}</b></div><div><span class="rotulo-campo">Capital social</span><b class="num">${moeda(e.capital)}</b></div>
        <div><span class="rotulo-campo">Regime tributário</span><b>${esc(e.regime)}</b></div><div><span class="rotulo-campo">Abertura</span><b>${dataBr(e.abertura)}</b></div><div><span class="rotulo-campo">Inscrição estadual</span><b class="indisp">Não informado</b></div></div>
      <div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--borda-3)"><span class="rotulo-campo">Quadro societário</span>
        ${e.socios.map(([n, q, a]) => `<div style="display:flex;gap:12px;align-items:center;padding:10px 12px;border-radius:10px;background:var(--fundo);margin-top:8px"><span class="iniciais">${iniciais(n)}</span><div><b style="font-size:14px">${esc(n)}</b><div class="legenda">${esc(q)} · desde ${a}</div></div></div>`).join("")}</div></section>
    <section class="cartao pad" aria-label="Contatos"><div class="cartao-titulo"><h3>Contatos</h3><small>${e.telefones.length + (e.email ? 1 : 0)} canais</small></div>
      ${e.telefones.map(([t, cel]) => `<div class="contato-linha"><i>${icone(cel ? "whats" : "tel", 16)}</i><div><b style="font-size:14px">${esc(t)}</b><div class="legenda">${cel ? "Celular" : "Fixo"} · cadastro CNPJ (Receita)</div></div></div>`).join("")}
      ${e.email ? `<div class="contato-linha"><i>${icone("email", 16)}</i><div><b style="font-size:14px">${esc(e.email)}</b><div class="legenda">E-mail · cadastro CNPJ (Receita)</div></div></div>` : ""}
      <div style="margin-top:14px;padding:14px;border-radius:10px;background:var(--fundo)"><span class="legenda">${icone("doc", 12)} Última nota</span><p style="margin:6px 0;font-size:13px" class="${nota ? "" : "indisp"}">${nota ? esc(nota.texto) : "Nenhuma nota registrada."}</p><a class="link" href="#/empresa/${e.cnpj}/notas">Registrar nota</a></div></section>
  </div>`;
}

// ------------------------------------------------------------------ cadastro
function cadastro(e, sub) {
  if (sub === "contatos") return `<section class="cartao pad" style="max-width:820px"><div class="cartao-titulo"><h3>Contatos</h3><button class="btn peq" data-contato>${icone("mais", 13)}Adicionar contato</button></div>
    ${e.telefones.map(([t, cel]) => `<div class="contato-linha"><i>${icone(cel ? "whats" : "tel", 16)}</i><div style="flex:1"><b>${esc(t)}</b><div class="legenda">${cel ? "Celular (aceita WhatsApp)" : "Telefone fixo"} · Receita Federal</div></div><span class="chip verde quadrado">Válido</span></div>`).join("")}
    ${e.email ? `<div class="contato-linha"><i>${icone("email", 16)}</i><div style="flex:1"><b>${esc(e.email)}</b><div class="legenda">E-mail · Receita Federal</div></div></div>` : ""}</section>`;
  if (sub === "tributario") return `<section class="cartao pad" style="max-width:820px"><div class="cartao-titulo"><h3>Regime e histórico</h3><small>Fontes: Receita (Simples/MEI) e ECF por ano · nada é deduzido</small></div>
    ${[["2026", e.regime], ["2025", e.regime.includes("desenquadrado") ? "Simples Nacional (até 12/2025)" : e.regime.split(" ·")[0]], ["2024", e.regime.split(" ·")[0]], ["2023", e.regime.split(" ·")[0]]]
      .map(([a, r], i) => `<div style="display:flex;gap:16px;padding:12px 0;border-top:${i ? "1px solid var(--borda-3)" : "none"}"><b class="num" style="width:48px">${a}</b><span style="flex:1">${esc(r)}</span><span class="legenda">${i === 0 ? "Receita 09/2026" : "ECF " + a}</span></div>`).join("")}</section>`;
  return `<section class="cartao pad"><div class="cartao-titulo"><h3>Dados cadastrais</h3><small>Fonte: Receita Federal · 09/2026</small></div>
    <div class="dados-grade"><div><span class="rotulo-campo">Razão social</span><b>${esc(e.razao)}</b></div><div><span class="rotulo-campo">Nome fantasia</span><b>${esc(e.fantasia)}</b></div><div><span class="rotulo-campo">CNPJ</span><b class="num">${cnpjFmt(e.cnpj)} · ${e.filial ? "filial" : "matriz"}</b></div>
      <div><span class="rotulo-campo">Situação cadastral</span><b>${esc(e.situacao)}</b></div><div><span class="rotulo-campo">Data de abertura</span><b>${dataBr(e.abertura)}</b></div><div><span class="rotulo-campo">Natureza jurídica</span><b>${esc(e.natureza)}</b></div>
      <div><span class="rotulo-campo">CNAE principal</span><b>${esc(e.cnae)} · ${esc(e.cnaeDesc)}</b></div><div><span class="rotulo-campo">Porte</span><b>${esc(e.porte)}</b></div><div><span class="rotulo-campo">Capital social</span><b class="num">${moeda(e.capital)}</b></div>
      <div><span class="rotulo-campo">Endereço</span><b>${esc(e.endereco)} — ${esc(e.bairro)}</b></div><div><span class="rotulo-campo">Município</span><b>${esc(e.municipio)}/MG · CEP ${esc(e.cep)}</b></div><div><span class="rotulo-campo">E-mail</span><b class="${e.email ? "" : "indisp"}">${esc(e.email || "Não informado")}</b></div></div></section>`;
}

// ------------------------------------------------------------------ jurídico › processos
function painelConsulta(e) {
  const c = consultaDe(e.cnpj);
  const rodando = consultando[e.cnpj];
  const procs = processosDe(e.cnpj);
  const fontes = FONTES.map((f) => {
    const est = rodando?.[f.id] || (c ? c.fontes[f.id].estado : "nunca");
    const n = procs.filter((p) => p.tribunal === f.id).length;
    const [cls, ic, txt] = est === "rodando" ? ["rodando", '<span class="spinner"></span>', `Consultando ${f.id}…`]
      : est === "ok" ? ["ok", "✓", `${n} processo${n === 1 ? "" : "s"}`] : est === "falha" ? ["falha", "⚠", "Consulta indisponível no momento"] : ["", "–", "Ainda não consultado"];
    return `<span class="fonte ${cls}" title="${esc(f.nome)} · DJEN (CNJ) · busca ${esc(f.metodo)}">${ic} <b>${f.id}</b> ${txt}</span>`;
  }).join("");
  const falhou = c && Object.values(c.fontes).some((x) => x.estado === "falha") && !rodando;
  const sub = rodando ? `Consultando ${FONTES.filter((f) => rodando[f.id] === "rodando").map((f) => f.id).join(", ")} pelo CNPJ ${cnpjFmt(e.cnpj)}…`
    : c ? `Última consulta: ${new Date(c.em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} · ${procs.length} processo(s) no total · atualiza sozinha a cada 24 h ao abrir a ficha`
      : "Ainda não consultado. A consulta usa o CNPJ desta empresa nas fontes públicas dos tribunais.";
  return `<section class="cartao pad" aria-label="Consulta automática de processos" style="display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div style="display:flex;flex-direction:column;gap:2px;min-width:0"><b style="font-size:14px">Consulta automática de processos · TRT3, TRF6, TJMG</b><span class="legenda" aria-live="polite">${sub}</span></div>
      <button class="link" style="margin-left:auto" data-detalhes-consulta>Detalhes da consulta</button>
      <button class="btn primario peq" data-atualizar ${rodando ? "disabled" : ""}>${rodando ? '<span class="spinner" style="border-color:rgba(255,255,255,.4);border-top-color:#fff"></span>Consultando…' : `${icone("atualizar", 13)}Atualizar processos`}</button></div>
    <div class="fontes" role="list" aria-label="Fontes consultadas">${fontes}</div>
    ${falhou ? '<span style="font-size:12px;color:var(--ambar)">Uma fonte falhou; os resultados das outras continuam válidos. Veja “Detalhes da consulta”.</span>' : ""}
  </section>`;
}

function processos(e, procs) {
  const filtro = sessionStorage.getItem(`filtro-trib-${e.cnpj}`) || "";
  const busca = sessionStorage.getItem(`busca-proc-${e.cnpj}`) || "";
  const itens = procs.filter((p) => (!filtro || p.tribunal === filtro) && (!busca || p.numero.replace(/\D/g, "").includes(busca.replace(/\D/g, "")) || (p.classe || "").toLowerCase().includes(busca.toLowerCase())));
  const tribunais = [...new Set([...procs.map((p) => p.tribunal), "TRT3", "TRF6", "TJMG"])];
  return `${painelConsulta(e)}
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <label class="caixa-busca" style="flex:1 1 260px;max-width:360px">${icone("busca", 16)}<input type="search" data-busca-proc value="${esc(busca)}" placeholder="Número do processo ou classe" aria-label="Buscar processos"></label>
      <label class="filtro-sel"><span>Tribunal</span><select data-filtro-trib><option value="">Todos</option>${tribunais.map((t) => `<option ${t === filtro ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      <span class="legenda">${itens.length} processo(s) · Fontes: consulta automática (DJEN/CNJ) e cadastro manual</span>
      <button class="link" style="margin-left:auto" data-cadastrar>${icone("mais", 13)} Cadastrar processo</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">${itens.length ? itens.map((p) => cartaoProcesso(e, p)).join("")
      : `<div class="vazio">${procs.length ? "Nenhum processo com a busca e os filtros escolhidos." : consultaDe(e.cnpj) ? "As fontes consultadas não trazem processos com o CNPJ desta empresa. Isso não garante que ela não tenha processos: a consulta cobre processos com comunicação publicada no DJEN (CNJ)." : "A consulta automática ainda não rodou para esta empresa."}</div>`}</div>
    <p class="legenda" style="line-height:1.6;margin:0">Processos entram pela consulta automática por CNPJ (DJEN, do CNJ: TRT3 e TJMG pelo CNPJ citado no teor; TRF6 pela razão social, a confirmar) ou por cadastro manual. Um mesmo número nunca é gravado duas vezes. Campos que a fonte não publica aparecem como indisponíveis.</p>`;
}

function cartaoProcesso(e, p) {
  const [cor, suave] = COR_AREA[p.area] || ["#8A857D", "#F0EEEA"];
  const origem = p.origem === "manual" ? ["Manual", "cinza", "Cadastrado por você"] : p.vinculo === "nome" ? ["Automática · pela razão social", "ambar", "Destinatário com a mesma razão social: confira"] : ["Automática · pelo CNPJ", "azul", "O CNPJ desta empresa aparece na fonte"];
  const lado = (polo) => {
    const l = (p.partes || []).filter((x) => x[1] === polo);
    const nossa = l.find((x) => x[2]);
    const primeiro = nossa || l[0];
    return `<div class="lado ${primeiro?.[2] ? "nosso" : ""}"><small>${POLO[polo]}</small><b style="font-size:14px;${primeiro ? "" : "font-style:italic;font-weight:400;color:var(--suave)"}">${esc(primeiro?.[0] || "Não informado")}</b>${primeiro?.[2] ? '<span class="chip quadrado" style="background:#fff;color:var(--marinho);align-self:flex-start;font-size:11px">Esta empresa</span>' : ""}${l.length > 1 ? `<span class="legenda">+${l.length - 1} parte(s)</span>` : ""}</div>`;
  };
  return `<div class="processo"><div class="faixa" style="background:${cor}"></div><article class="cartao" aria-label="Processo ${esc(p.numero)}">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="num" style="font-weight:500;color:var(--texto)">${esc(p.numero)}</span>
      <span class="chip" style="background:${suave};color:${cor}"><i style="width:6px;height:6px;border-radius:50%;background:${cor}"></i>${esc(p.area || "Área não informada")}</span>
      <span class="chip ${origem[1]} quadrado" title="${origem[2]}">${origem[0]}</span><span class="chip borda">${esc(p.tribunal)}</span>
      ${(p.etiquetas || []).map((t) => `<span class="chip azul quadrado">${esc(t)}</span>`).join("")}
      <span class="legenda" style="margin-left:auto">${p.ultimaPublicacao ? `Última publicação ${dataBr(p.ultimaPublicacao)}` : "Sem publicação registrada"}</span>
      <button class="icone-btn" style="width:30px;height:30px;border:none;color:${p.favorito ? "#C08A1E" : "#6F6B64"}" data-fav-proc="${p.id}" aria-pressed="${p.favorito}" title="Favorito">${icone("estrela", 16, p.favorito ? 'fill="#C08A1E"' : "")}</button></div>
    <b style="font-size:18px;font-weight:600;letter-spacing:-.01em">${esc(p.assunto || p.classe || "Processo sem título")}</b>
    <div class="lados">${lado("ativo")}<div style="display:flex;align-items:center;justify-content:center;color:var(--apagado)">×</div>${lado("passivo")}</div>
    <div class="grade-3"><div><span class="rotulo-campo">Valor da causa</span><div class="num ${p.valor == null ? "indisp" : ""}" style="font-size:15px;font-weight:600;margin-top:3px">${p.valor == null ? "Não informado" : moeda(p.valor)}</div></div>
      <div><span class="rotulo-campo">Classe</span><div style="font-size:14px;font-weight:500;margin-top:3px">${esc(p.classe || "Não informado")}</div></div>
      <div><span class="rotulo-campo">Órgão julgador</span><div style="font-size:14px;font-weight:500;margin-top:3px">${esc(p.orgao || "Não informado")}</div></div></div>
    <div style="display:flex;flex-direction:column;gap:10px;padding-top:14px;border-top:1px solid var(--borda-3)">
      <div style="display:flex;justify-content:space-between;gap:12px;font-size:12px;flex-wrap:wrap"><span style="color:var(--suave);font-weight:500">Andamentos recentes</span><span class="legenda">${p.origem === "manual" ? `Cadastro manual · ${esc(p.tribunal)}` : `DJEN (CNJ) · ${esc(p.tribunal)} · complementado pelo DataJud`}</span></div>
      ${p.andamentos?.length ? `<div class="andamentos">${p.andamentos.slice(0, 3).map((a) => `<div class="andamento"><i></i><div><b class="num" style="font-size:12px;color:var(--tinta-2)">${dataBr(a.data)}</b><div>${esc(a.texto)}</div></div></div>`).join("")}</div>` : '<span class="legenda">Nenhum andamento registrado.</span>'}
      <div style="display:flex;gap:14px;font-size:12px;flex-wrap:wrap"><button class="link" data-detalhes-proc="${p.id}">Detalhes</button><button class="link" data-andamento="${p.id}">+ Andamento</button><button class="link" data-retirar="${p.id}" style="color:var(--suave)">Retirar</button></div>
    </div></article></div>`;
}

function detalhesProcesso(e, p) {
  const ind = "indisponível na fonte";
  const v = (x) => (x == null || x === "" ? ind : x);
  const linhas = [["Número CNJ", p.numero], ["Tribunal", p.tribunal], ["Órgão julgador", p.orgao], ["Classe processual", p.classe], ["Assunto", p.assunto],
    ["Polo da empresa", POLO[p.polo]], ["Partes", (p.partes || []).map((x) => `${x[0]} (${POLO[x[1]] || x[1]})`).join("; ")],
    ["Data de distribuição", p.distribuido && dataBr(p.distribuido)], ["Última movimentação", p.andamentos?.[0] && `${dataBr(p.andamentos[0].data)} · ${p.andamentos[0].texto}`],
    ["Última publicação no DJEN", p.ultimaPublicacao && dataBr(p.ultimaPublicacao)], ["Situação", p.situacao], ["Grau / instância", p.grau],
    ["Sistema de origem", p.origem === "manual" ? "Cadastro manual" : "DJEN (CNJ) + DataJud"],
    ["Vínculo com a empresa", p.origem === "manual" ? "Informado por você" : p.vinculo === "nome" ? "Razão social igual à de um destinatário (confira)" : "CNPJ citado na fonte"],
    ["Última consulta", consultaDe(e.cnpj) && new Date(consultaDe(e.cnpj).em).toLocaleString("pt-BR")]];
  dialogo({ titulo: `Processo ${p.numero}`, subtitulo: p.origem === "manual" ? "Cadastrado manualmente" : "Encontrado pela consulta automática", confirmar: null, cancelar: "Fechar", largura: 640,
    campos: [{ tipo: "html", html: `<dl style="margin:0;display:grid;grid-template-columns:190px minmax(0,1fr);gap:8px 14px">${linhas.map(([k, x]) => `<dt class="legenda" style="font-size:13px">${k}</dt><dd style="margin:0;${x == null || x === "" ? "color:var(--apagado);font-style:italic" : ""}">${esc(v(x))}</dd>`).join("")}</dl>` },
      { tipo: "aviso", nivel: "cinza", texto: "Demonstração: no CAPTA, o link oficial abre o inteiro teor da última comunicação no site do tribunal." }] });
}

function simularConsulta(e, el) {
  if (consultando[e.cnpj]) return;
  const r = resultadoSimulado(e.cnpj);
  consultando[e.cnpj] = Object.fromEntries(FONTES.map((f) => [f.id, "rodando"]));
  window.dispatchEvent(new Event("capta:atualizar"));
  const fim = {};
  FONTES.forEach((f) => setTimeout(() => {
    fim[f.id] = r[f.id];
    consultando[e.cnpj] = { ...consultando[e.cnpj], [f.id]: r[f.id].estado };
    if (Object.keys(fim).length === FONTES.length) {
      gravarConsulta(e.cnpj, fim);
      delete consultando[e.cnpj];
      const n = Object.values(fim).reduce((a, x) => a + x.n, 0);
      avisar(`Consulta concluída: ${n} processo(s) encontrados${Object.values(fim).some((x) => x.estado === "falha") ? "; uma fonte ficou indisponível" : ""}.`);
    }
    if (location.hash.includes(`/empresa/${e.cnpj}/juridico`) || location.hash === `#/empresa/${e.cnpj}/juridico`) window.dispatchEvent(new Event("capta:atualizar"));
  }, Math.min(r[f.id].ms, 4200) * 0.6 + 400));
}

// ------------------------------------------------------------------ jurídico › débitos e mudanças
function debitos(e) {
  const d = e.dividas;
  const linhas = [];
  for (let i = 0; i < Math.min(d.federal[1], 6); i++) linhas.push(["Federal", ["IRPJ", "CSLL", "COFINS", "PIS", "Contribuição previdenciária", "Simples Nacional"][i % 6], `80.${6 + (i % 3)}.2${3 + (i % 3)}.0${String(48210 + i * 77)}-${i}`, d.federal[0] / d.federal[1], i < d.federal[2] ? "Ajuizada" : "Ativa em cobrança", "PGFN 06/2026"]);
  for (let i = 0; i < d.estadual[1]; i++) linhas.push(["Estadual", "ICMS", `PTA 01.000${23456 + i}-89`, d.estadual[0] / d.estadual[1], "Inscrita", "SEF/MG 09/2026 · sem data de inscrição"]);
  for (let i = 0; i < d.municipal[1]; i++) linhas.push(["Municipal", "ISSQN", `IPTU/ISS 2025-${1200 + i}`, d.municipal[0] / d.municipal[1], "Inscrita", "PBH 12/2025"]);
  return `<section class="cartao" style="overflow-x:auto"><div style="padding:18px 22px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><b style="font-size:15px">Inscrições em dívida ativa</b><div class="legenda">Só inscrições vigentes; totais somam a empresa como devedora principal</div></div><b class="num" style="font-size:18px">${moeda(d.federal[0] + d.estadual[0] + d.municipal[0])}</b></div>
    ${linhas.length ? `<table class="tabela" style="min-width:760px"><thead><tr><th>Esfera</th><th>Natureza</th><th>Inscrição</th><th>Valor</th><th>Situação</th><th>Fonte</th></tr></thead><tbody>${linhas.map((l) => `<tr><td>${l[0]}</td><td>${esc(l[1])}</td><td class="num">${esc(l[2])}</td><td class="num">${moeda(l[3])}</td><td><span class="chip ${l[4] === "Ajuizada" ? "vermelho" : "ambar"} quadrado">${l[4]}</span></td><td class="legenda">${esc(l[5])}</td></tr>`).join("")}</tbody></table>` : '<div class="vazio" style="margin:0 22px 22px">Sem débito identificado nas bases consultadas. Isso não significa que a empresa não tenha dívidas.</div>'}</section>`;
}
function mudancas(e) {
  const itens = ALTERACOES.filter((a) => a.cnpj === e.cnpj);
  return `<section class="cartao pad" style="max-width:900px"><div class="cartao-titulo"><h3>Mudanças recentes</h3><small>Só diferenças entre competências das listas oficiais e andamentos de processos acompanhados</small></div>
    ${itens.length ? itens.map((a) => `<div style="display:flex;gap:12px;padding:12px 0;border-top:1px solid var(--borda-3)"><span class="chip ${a.tipo === "divida" ? "ambar" : a.tipo === "processo" ? "azul" : "cinza"} quadrado">${a.tipo === "divida" ? "Débitos" : a.tipo === "processo" ? "Processos" : "Regime"}</span><div style="flex:1"><b style="font-size:14px">${esc(a.titulo)}</b><div class="legenda">${esc(a.detalhe)}</div></div><span class="legenda">${dataBr(a.data)}</span></div>`).join("") : '<div class="vazio">Nenhuma mudança detectada entre as últimas competências.</div>'}</section>`;
}

// ------------------------------------------------------------------ comunicação, propostas, grupo, arquivos, notas
function comunicacao(e, sub) {
  if (sub === "whatsapp") {
    const c = CONVERSAS.find((x) => x.cnpj === e.cnpj);
    return c ? `<section class="cartao pad" style="max-width:820px"><div class="cartao-titulo"><h3>Conversa com ${esc(c.contato)}</h3><a class="btn peq primario" href="#/conversas/${c.id}">Abrir no WhatsApp do CAPTA</a></div>
      ${c.mensagens.slice(-3).map(([d, t]) => `<div class="bolha ${d === "saida" ? "minha" : d === "nota" ? "nota" : ""}" style="margin-top:8px;max-width:100%">${esc(t)}</div>`).join("")}</section>`
      : `<div class="vazio">Nenhuma conversa de WhatsApp com esta empresa. <a href="#/conversas">Abrir conversas</a></div>`;
  }
  const rotulo = { emails: ["E-mails da empresa", "Nenhum e-mail trocado com esta empresa ainda.", "Novo e-mail"], ligacoes: ["Ligações", "Nenhuma ligação registrada para esta empresa.", "Ligar agora"], reunioes: ["Reuniões", "Nenhuma reunião marcada.", "Nova reunião"] }[sub];
  return `<section class="cartao pad" style="max-width:820px"><div class="cartao-titulo"><h3>${rotulo[0]}</h3><button class="btn peq primario" data-acao-com>${rotulo[2]}</button></div><div class="vazio">${rotulo[1]}</div></section>`;
}
function propostas(e) {
  const itens = PROPOSTAS.filter((p) => p.cnpj === e.cnpj);
  return `<section class="cartao" style="overflow-x:auto"><div style="padding:18px 22px;display:flex;justify-content:space-between"><b style="font-size:15px">Propostas da empresa</b><button class="btn peq primario" data-proposta>${icone("mais", 13)}Criar proposta</button></div>
    ${itens.length ? `<table class="tabela"><thead><tr><th>Número</th><th>Título</th><th>Etapa</th><th>Honorários</th><th>Responsável</th></tr></thead><tbody>${itens.map((p) => `<tr class="clicavel" data-href="#/propostas/${p.id}"><td class="num">${p.numero}</td><td>${esc(p.titulo)}</td><td><span class="chip ${ETAPA_PROPOSTA[p.etapa][1]} quadrado">${ETAPA_PROPOSTA[p.etapa][0]}</span></td><td class="num">${moeda(p.fixo)}${p.mensal ? ` + ${moeda(p.mensal)}/mês` : ""}</td><td>${esc(p.resp)}</td></tr>`).join("")}</tbody></table>` : '<div class="vazio" style="margin:0 22px 22px">Nenhuma proposta para esta empresa.</div>'}</section>`;
}
function grupo(e) {
  const irmas = EMPRESAS.filter((x) => x.cnpj.slice(0, 8) === e.cnpj.slice(0, 8));
  if (irmas.length < 2) return `<div class="vazio">Esta empresa não faz parte de um grupo econômico. <button class="link" data-grupo>Criar grupo econômico</button></div>`;
  return `<section class="cartao pad" style="max-width:900px"><div class="cartao-titulo"><h3>Grupo Pão de Serra · GRP-000001</h3><small>Mesma raiz de CNPJ</small></div>
    ${irmas.map((x, i) => `<a href="#/empresa/${x.cnpj}/grupo" style="display:flex;gap:12px;align-items:center;padding:12px 0;border-top:1px solid var(--borda-3);color:var(--tinta)"><span class="iniciais">${iniciais(nomeEmpresa(x))}</span><div style="flex:1"><b>${esc(nomeEmpresa(x))}</b><div class="legenda num">${cnpjFmt(x.cnpj)} · ${x.filial ? "filial" : "matriz"}</div></div>${i === 0 ? '<span class="chip azul quadrado">Empresa mestre</span>' : '<span class="chip cinza quadrado">Integrante</span>'}</a>`).join("")}</section>`;
}
function arquivos(e) {
  const t = tipoCrm(e);
  const lista = t === "cliente" ? [["Propostas", "PROP-2026-0041_v2.pdf", "184 KB"], ["Procurações", "Procuracao_assinada.pdf", "92 KB"], ["Documentos", "Contrato_social.pdf", "1,2 MB"]] : [];
  return `<section class="cartao pad" style="max-width:900px"><div class="cartao-titulo"><h3>Pasta da empresa</h3><button class="btn peq" data-enviar-arq>${icone("clipe", 13)}Enviar arquivo</button></div>
    ${lista.length ? lista.map(([p, n, k]) => `<div style="display:flex;gap:12px;align-items:center;padding:11px 0;border-top:1px solid var(--borda-3)">${icone("doc", 18)}<div style="flex:1"><b style="font-size:14px">${esc(n)}</b><div class="legenda">${p} · ${k}</div></div><button class="btn peq" data-baixar>Baixar</button></div>`).join("") : `<div class="vazio">A pasta é criada quando a empresa vira cliente (número EMP).</div>`}</section>`;
}
function notas(e) {
  const ns = notasDe(e.cnpj);
  return `<section class="cartao pad" style="max-width:820px"><div class="cartao-titulo"><h3>Notas internas</h3><small>Visíveis só para a equipe</small></div>
    <form data-nota style="display:flex;flex-direction:column;gap:10px"><textarea class="entrada" name="texto" style="height:90px;padding:10px 12px" placeholder="Escreva uma nota sobre esta empresa" required></textarea><button class="btn primario" style="align-self:flex-end">Salvar nota</button></form>
    ${ns.map((n) => `<div style="padding:12px 0;border-top:1px solid var(--borda-3)"><div style="font-size:14px">${esc(n.texto)}</div><div class="legenda">${new Date(n.em).toLocaleString("pt-BR")}</div></div>`).join("")}</section>`;
}

// ------------------------------------------------------------------ eventos
function montar(el, e, aba, sub) {
  const raiz = el;
  raiz.querySelector("[data-fav]")?.addEventListener("click", () => { avisar(alternarFavorito(e.cnpj) ? "Empresa favoritada." : "Empresa retirada dos favoritos."); window.dispatchEvent(new Event("capta:atualizar")); });
  raiz.querySelector("[data-ligar]")?.addEventListener("click", () => avisar(`Demonstração: no CAPTA, o computador discaria ${e.telefones[0][0]} e depois você registraria o resultado.`));
  raiz.querySelectorAll("[data-proposta]").forEach((b) => b.addEventListener("click", () => avisar("Demonstração: no CAPTA, abre uma proposta nova em rascunho para esta empresa.")));
  raiz.querySelector("[data-apresentacao]")?.addEventListener("click", () => avisar("Demonstração: no CAPTA, gera uma apresentação em PDF (16:9 ou A4) com os dados reais da empresa."));
  raiz.querySelector("[data-cliente]")?.addEventListener("click", () => { tornarCliente(e.cnpj); avisar("Empresa salva como cliente."); window.dispatchEvent(new Event("capta:atualizar")); });
  raiz.querySelectorAll("tr[data-href]").forEach((tr) => tr.addEventListener("click", () => { location.hash = tr.dataset.href; }));
  raiz.querySelectorAll("[data-acao-com], [data-grupo], [data-enviar-arq], [data-baixar], [data-contato]").forEach((b) => b.addEventListener("click", () => avisar("Demonstração: esta ação funciona no CAPTA instalado.")));
  raiz.querySelector("[data-nota]")?.addEventListener("submit", (ev) => { ev.preventDefault(); const t = new FormData(ev.target).get("texto").trim(); if (t) { registrarNota(e.cnpj, t); avisar("Nota salva."); window.dispatchEvent(new Event("capta:atualizar")); } });
  if (aba !== "juridico" || (sub && sub !== "processos")) return;
  // processos
  if (!consultaDe(e.cnpj) && !consultando[e.cnpj]) setTimeout(() => simularConsulta(e, raiz), 300);   // 1ª abertura: consulta sozinha
  raiz.querySelector("[data-atualizar]")?.addEventListener("click", () => simularConsulta(e, raiz));
  raiz.querySelector("[data-detalhes-consulta]")?.addEventListener("click", () => {
    const c = consultaDe(e.cnpj);
    dialogo({ titulo: "Detalhes da consulta automática", subtitulo: `CNPJ ${cnpjFmt(e.cnpj)} · ${nomeEmpresa(e)}`, confirmar: null, cancelar: "Fechar", largura: 640,
      campos: [...FONTES.flatMap((f) => { const r = c?.fontes[f.id]; return [{ tipo: "info", texto: `${f.nome} — ${r ? (r.estado === "ok" ? `Sucesso · ${r.n} processo(s) · ${(r.ms / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} s` : "Falha · HTTP 503 · Consulta indisponível no momento") : "Ainda não consultada"}` },
        { tipo: "aviso", nivel: f.id === "TRF6" ? "ambar" : "azul", texto: `Fonte: DJEN (CNJ), busca ${f.metodo}. Só aparecem processos com intimação, citação ou edital publicados no DJEN.` }]; }),
        { tipo: "aviso", nivel: "cinza", texto: "O CNPJ é enviado só às fontes públicas listadas acima (API oficial do CNJ). Nesta demonstração, a consulta é simulada com dados fictícios." }] });
  });
  const busca = raiz.querySelector("[data-busca-proc]");
  busca?.addEventListener("input", () => { sessionStorage.setItem(`busca-proc-${e.cnpj}`, busca.value); clearTimeout(busca._t); busca._t = setTimeout(() => { window.dispatchEvent(new Event("capta:atualizar")); setTimeout(() => { const b = document.querySelector("[data-busca-proc]"); b?.focus(); b?.setSelectionRange(b.value.length, b.value.length); }, 0); }, 350); });
  raiz.querySelector("[data-filtro-trib]")?.addEventListener("change", (ev) => { sessionStorage.setItem(`filtro-trib-${e.cnpj}`, ev.target.value); window.dispatchEvent(new Event("capta:atualizar")); });
  const procs = processosDe(e.cnpj);
  raiz.querySelectorAll("[data-detalhes-proc]").forEach((b) => b.addEventListener("click", () => detalhesProcesso(e, procs.find((p) => p.id === b.dataset.detalhesProc))));
  raiz.querySelectorAll("[data-fav-proc]").forEach((b) => b.addEventListener("click", () => { const p = procs.find((x) => x.id === b.dataset.favProc); marcarProcesso(p.id, "favProc", !p.favorito); window.dispatchEvent(new Event("capta:atualizar")); }));
  raiz.querySelectorAll("[data-andamento]").forEach((b) => b.addEventListener("click", () => dialogo({ titulo: "Registrar andamento", campos: [{ tipo: "area", nome: "texto", rotulo: "Andamento", obrigatorio: true }], confirmar: "Registrar",
    aoConfirmar: (v) => { registrarAndamento(b.dataset.andamento, v.texto.trim()); avisar("Andamento registrado."); window.dispatchEvent(new Event("capta:atualizar")); } })));
  raiz.querySelectorAll("[data-retirar]").forEach((b) => b.addEventListener("click", () => dialogo({ titulo: "Retirar processo", confirmar: "Retirar", campos: [{ tipo: "info", texto: "O processo sai da lista desta empresa. Nada é apagado: no CAPTA o registro é mantido e a consulta automática não o recria." }],
    aoConfirmar: () => { retirarProcesso(b.dataset.retirar); avisar("Processo retirado (registro mantido)."); window.dispatchEvent(new Event("capta:atualizar")); } })));
  raiz.querySelector("[data-cadastrar]")?.addEventListener("click", () => dialogo({
    titulo: "Cadastrar processo", subtitulo: nomeEmpresa(e),
    campos: [{ tipo: "texto", nome: "numero", rotulo: "Número CNJ", obrigatorio: true, dica: "0000000-00.0000.0.00.0000" },
      { tipo: "seletor", nome: "tribunal", rotulo: "Tribunal", opcoes: ["TJMG", "TRT3", "TRF6", "Outro"], valor: "TJMG" },
      { tipo: "texto", nome: "classe", rotulo: "Classe", dica: "Ex.: Execução Fiscal" },
      { tipo: "seletor", nome: "polo", rotulo: "Polo desta empresa", opcoes: [{ valor: "passivo", rotulo: "Polo passivo" }, { valor: "ativo", rotulo: "Polo ativo" }], valor: "passivo" }],
    confirmar: "Cadastrar",
    aoConfirmar: (v) => {
      const d = v.numero.replace(/\D/g, "");
      if (d.length !== 20) throw new Error("Número CNJ: informe os 20 dígitos (NNNNNNN-DD.AAAA.J.TR.OOOO).");
      if (processosDe(e.cnpj).some((p) => p.numero.replace(/\D/g, "") === d)) throw new Error("Este processo já está cadastrado para esta empresa.");
      const fmt = `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d[13]}.${d.slice(14, 16)}.${d.slice(16)}`;
      cadastrarProcesso(e.cnpj, { numero: fmt, tribunal: v.tribunal, classe: v.classe || null, polo: v.polo, area: null, orgao: null,
        partes: [[e.razao, v.polo, true]] });
      avisar(`Processo ${fmt} cadastrado.`);
      window.dispatchEvent(new Event("capta:atualizar"));
    },
  }));
}
export { simularConsulta };
