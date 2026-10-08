// Buscar empresas (com filtros, indicadores e cartões), Clientes e empresas (tabela do CRM) e Favoritos.
import { EMPRESAS, ETAPAS, LISTAS, nomeEmpresa } from "../dados.js";
import { alternarFavorito, etapaLead, favoritos, tipoCrm, tornarCliente } from "../crm.js";
import { avisar, cnpjFmt, digitos, esc, icone, moeda, num, pct } from "../util.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const totalDivida = (e) => e.dividas.federal[0] + e.dividas.estadual[0] + e.dividas.municipal[0];
const MUNICIPIOS = [...new Set(EMPRESAS.map((e) => e.municipio))].sort();

function filtrar(f) {
  const t = norm(f.q || "");
  const d = digitos(f.q || "");
  return EMPRESAS.filter((e) => (!t || (d.length >= 3 && e.cnpj.includes(d)) || norm(`${e.razao} ${e.fantasia} ${e.cnaeDesc} ${e.cnae}`).includes(t))
    && (!f.municipio || e.municipio === f.municipio) && (!f.situacao || e.situacao === f.situacao)
    && (!f.regime || (f.regime === "simples" ? /Simples/.test(e.regime) && !/desenquadrado/.test(e.regime) : f.regime === "presumido" ? /Presumido/.test(e.regime) : /Real/.test(e.regime)))
    && (!f.divida || (f.divida === "com" ? totalDivida(e) > 0 : totalDivida(e) === 0)));
}

function cartaoEmpresa(e, favs) {
  const div = totalDivida(e);
  const celular = e.telefones.find((x) => x[1]);
  const tipo = tipoCrm(e);
  const fav = favs.has(e.cnpj);
  return `<article class="cartao" aria-label="${esc(nomeEmpresa(e))}">
    <div class="empresa-cartao">
      <div style="display:flex;flex-direction:column;gap:10px;min-width:0">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="chip borda">${esc(e.regime.split(" ·")[0])}</span>
          ${e.situacao !== "Ativa" ? `<span class="chip vermelho quadrado">${esc(e.situacao)}</span>` : ""}
          ${tipo ? `<span class="chip ${tipo === "cliente" ? "verde" : "azul"} quadrado">${tipo === "cliente" ? "Cliente" : "Lead"}</span>` : ""}
          <span class="legenda">○ ${celular ? "Celular na Receita" : "Sem celular"}</span></div>
        <div><a href="#/empresa/${e.cnpj}" style="font-size:20px;font-weight:600;color:var(--tinta);letter-spacing:-.01em">${esc(nomeEmpresa(e))}</a>
          <div class="legenda" style="margin-top:2px">${esc(e.razao)}</div></div>
        <div style="display:flex;flex-direction:column;gap:5px">
          <div class="linha-dado"><span>CNPJ</span><span class="num">${cnpjFmt(e.cnpj)} <span class="legenda">· ${e.filial ? "filial" : "matriz"}</span></span></div>
          <div class="linha-dado"><span>Atividade</span><span>${esc(e.cnae)} · ${esc(e.cnaeDesc)}</span></div>
          <div class="linha-dado"><span>Endereço</span><span>${esc(e.endereco)} — ${esc(e.bairro)} — ${esc(e.municipio)}/MG</span></div>
        </div>
      </div>
      <div class="divisor"></div>
      ${div ? `<div class="debito-alerta"><b>${icone("alerta", 15)} Débitos identificados</b><span class="total">${moeda(div)}</span>
          <span>${[["Federal", e.dividas.federal[0]], ["Estadual", e.dividas.estadual[0]], ["Municipal", e.dividas.municipal[0]]].filter((x) => x[1]).map((x) => `${x[0]} ${moeda(x[1])}`).join(" · ")}</span>
          <span class="legenda">Bases importadas · Federal 06/2026 · Estadual 09/2026</span></div>`
        : `<div class="debito-ok"><b>${icone("check", 15)} Nenhum débito identificado</b><span>Federal, estadual e municipal consultados nas bases importadas (Municipal 12/2025 · Estadual 09/2026 · Federal 06/2026).</span></div>`}
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;gap:8px;justify-content:flex-end"><button class="icone-btn" style="width:34px;height:34px" title="Relatório da empresa" data-relatorio="${e.cnpj}">${icone("doc", 15)}</button>
          <button class="icone-btn" style="width:34px;height:34px;color:${fav ? "#C08A1E" : "inherit"}" aria-pressed="${fav}" title="${fav ? "Tirar dos favoritos" : "Favoritar"}" data-fav="${e.cnpj}">${icone("estrela", 15, fav ? 'fill="#C08A1E"' : "")}</button></div>
        <div class="mapa-mini">${icone("pino", 16)}<span>${esc(e.bairro)} · ${esc(e.municipio)} · CEP ${esc(e.cep)}</span></div>
      </div>
    </div>
    <div class="empresa-rodape">
      <a class="btn peq" href="#/empresa/${e.cnpj}/comunicacao/whatsapp">${icone("whats", 14)}Mensagem</a>
      <button class="btn peq" data-ligar="${esc(e.telefones[0][0])}">${icone("tel", 14)}Ligar</button>
      <a class="btn peq" href="#/empresa/${e.cnpj}/comunicacao/emails">${icone("email", 14)}E-mail</a>
      <span class="legenda" style="margin-left:auto">Receita 09/2026</span>
      ${tipo === "cliente" ? `<a class="btn peq contorno" href="#/empresa/${e.cnpj}">Abrir ficha</a>` : `<button class="btn peq contorno" data-cliente="${e.cnpj}">${icone("usuario", 14)}Salvar como cliente</button>`}
    </div>
  </article>`;
}

function telaBusca(rota) {
  const f = { q: rota.q.q || "", municipio: rota.q.municipio || "", situacao: rota.q.situacao || "", regime: rota.q.regime || "", divida: rota.q.divida || "" };
  const itens = filtrar(f);
  const favs = favoritos();
  const comDivida = itens.filter((e) => totalDivida(e) > 0).length;
  const sel = (nome, rotulo, opcoes) => `<label class="campo">${rotulo}<select name="${nome}">${opcoes.map(([v, l]) => `<option value="${esc(v)}" ${f[nome] === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`;
  const aplicados = Object.values(f).filter(Boolean).length;
  const html = `<div class="pagina">
    <form class="cartao pad" data-filtros aria-label="Filtros" style="display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><b style="font-size:16px;display:flex;gap:8px;align-items:center">${icone("menu", 16)}Filtros</b><span class="legenda">${aplicados ? `${aplicados} aplicado(s)` : "nenhum aplicado"}</span>
        <span style="margin-left:auto;display:flex;gap:16px"><button type="button" class="link" data-salvar-busca>Salvar busca</button><a class="link" href="#/busca">Limpar filtros</a></span></div>
      <div style="display:grid;grid-template-columns:minmax(0,2fr) repeat(3,minmax(0,1fr));gap:14px">
        <label class="campo">CNAE, atividade, razão social ou CNPJ<input name="q" value="${esc(f.q)}" placeholder="Ex.: padaria, 4711-3/02, 48.213.907"></label>
        ${sel("municipio", "Município", [["", "Todos de MG"], ...MUNICIPIOS.map((m) => [m, m])])}
        ${sel("regime", "Regime tributário", [["", "Qualquer regime"], ["simples", "Simples Nacional"], ["presumido", "Lucro Presumido"], ["real", "Lucro Real"]])}
        ${sel("divida", "Dívida ativa", [["", "Com ou sem"], ["com", "Com dívida identificada"], ["sem", "Sem dívida identificada"]])}
      </div>
      <div style="display:flex;gap:14px;align-items:flex-end;flex-wrap:wrap">
        <div style="width:220px">${sel("situacao", "Situação cadastral", [["", "Todas"], ["Ativa", "Ativa"], ["Baixada", "Baixada"]])}</div>
        <button class="btn primario" style="margin-left:auto;height:42px;min-width:220px">${icone("busca", 15)}Buscar empresas</button>
      </div>
    </form>
    <div class="grade-3">
      <div class="cartao kpi"><div class="kpi-topo">Empresas encontradas<span class="legenda">Minas Gerais</span></div><span class="valor">${num(itens.length)}</span></div>
      <div class="cartao kpi"><div class="kpi-topo">Com dívidas identificadas<span class="chip ambar quadrado">${itens.length ? pct((comDivida / itens.length) * 100) : "0%"} do total</span></div><span class="valor">${num(comDivida)}</span></div>
      <div class="cartao kpi"><div class="kpi-topo">Favoritas<span class="legenda">${LISTAS.length} listas</span></div><span class="valor">${num(itens.filter((e) => favs.has(e.cnpj)).length)}</span></div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><b style="font-size:16px">Resultados</b><span class="legenda">Exibindo 1–${itens.length} de ${itens.length}</span>
      <button class="btn" style="margin-left:auto" data-exportar>${icone("doc", 14)}Exportar</button></div>
    <div style="display:flex;flex-direction:column;gap:14px">${itens.length ? itens.map((e) => cartaoEmpresa(e, favs)).join("") : '<div class="vazio">Nenhuma empresa com estes filtros. <a href="#/busca">Limpar filtros</a></div>'}</div>
  </div>`;
  return { titulo: "Buscar empresas", html, montar: (el) => ligarCartoes(el, () => {
    el.querySelector("[data-filtros]").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const q = new URLSearchParams([...new FormData(ev.target).entries()].filter(([, v]) => v));
      location.hash = `#/busca${q.toString() ? `?${q}` : ""}`;
    });
    el.querySelector("[data-salvar-busca]").addEventListener("click", () => avisar("Demonstração: no CAPTA, a busca fica salva e pode virar uma lista de captação."));
    el.querySelector("[data-exportar]").addEventListener("click", () => exportarCsv(itens));
  }) };
}

function ligarCartoes(el, extra) {
  el.querySelectorAll("[data-fav]").forEach((b) => b.addEventListener("click", () => {
    const ativo = alternarFavorito(b.dataset.fav);
    avisar(ativo ? "Empresa adicionada aos favoritos." : "Empresa retirada dos favoritos.");
    window.dispatchEvent(new Event("capta:atualizar"));
  }));
  el.querySelectorAll("[data-cliente]").forEach((b) => b.addEventListener("click", () => {
    tornarCliente(b.dataset.cliente);
    avisar("Empresa salva como cliente (número EMP gerado na demonstração).");
    window.dispatchEvent(new Event("capta:atualizar"));
  }));
  el.querySelectorAll("[data-ligar]").forEach((b) => b.addEventListener("click", () => avisar(`Demonstração: no CAPTA, o computador discaria ${b.dataset.ligar}.`)));
  el.querySelectorAll("[data-relatorio]").forEach((b) => b.addEventListener("click", () => avisar("Demonstração: no CAPTA, o relatório da empresa sai em PDF.")));
  extra?.();
}

function exportarCsv(itens) {
  const linhas = [["CNPJ", "Nome fantasia", "Razão social", "Município", "Situação", "Regime", "Dívida total"], ...itens.map((e) => [cnpjFmt(e.cnpj), nomeEmpresa(e), e.razao, e.municipio, e.situacao, e.regime, String(totalDivida(e)).replace(".", ",")])];
  const csv = "﻿" + linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = "capta-empresas-demonstracao.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  avisar(`Planilha com ${itens.length} empresa(s) gerada (dados fictícios).`);
}

function telaClientes(rota, soFavoritos) {
  const favs = favoritos();
  const filtro = rota.q.tipo || "todos";
  const base = soFavoritos ? EMPRESAS.filter((e) => favs.has(e.cnpj)) : EMPRESAS.filter((e) => tipoCrm(e));
  const itens = base.filter((e) => soFavoritos || filtro === "todos" || tipoCrm(e) === filtro);
  const etapa = (e) => (ETAPAS.find((x) => x[0] === etapaLead(e)) || ETAPAS[0]);
  const html = `<div class="pagina">
    ${soFavoritos ? "" : `<div class="pilulas">${[["todos", "Todos", base.length], ["cliente", "Clientes", base.filter((e) => tipoCrm(e) === "cliente").length], ["lead", "Leads", base.filter((e) => tipoCrm(e) === "lead").length]]
      .map(([k, l, n]) => `<a class="pilula ${filtro === k ? "ativa" : ""}" href="#/clientes?tipo=${k}">${l} · ${n}</a>`).join("")}<a class="btn" style="margin-left:auto" href="#/busca">${icone("mais", 14)}Cadastrar empresa</a></div>`}
    <section class="cartao" style="overflow-x:auto"><table class="tabela" style="min-width:820px"><thead><tr><th>Empresa</th><th>CNPJ</th><th>Situação no CRM</th><th>Etapa</th><th>Responsável</th><th>Município</th><th></th></tr></thead><tbody>
      ${itens.map((e) => { const [, l, cor] = etapa(e); const t = tipoCrm(e); return `<tr class="clicavel" data-href="#/empresa/${e.cnpj}"><td><div style="display:flex;align-items:center;gap:10px"><span class="iniciais">${esc(nomeIniciais(e))}</span><div><b style="font-weight:600">${esc(nomeEmpresa(e))}</b><div class="legenda">${esc(e.razao)}</div></div></div></td>
        <td class="num">${cnpjFmt(e.cnpj)}</td><td>${t ? `<span class="chip ${t === "cliente" ? "verde" : "azul"} quadrado">${t === "cliente" ? `Cliente · ${esc(e.crm?.numero || "EMP-000099")}` : "Lead"}</span>` : '<span class="legenda">Fora do CRM</span>'}</td>
        <td>${t ? `<span style="display:flex;align-items:center;gap:6px"><i style="width:8px;height:8px;border-radius:50%;background:${cor}"></i>${esc(l)}</span>` : "—"}</td><td>${esc(e.crm?.resp || "—")}</td><td>${esc(e.municipio)}</td>
        <td><button class="icone-btn" style="width:30px;height:30px;color:${favs.has(e.cnpj) ? "#C08A1E" : "inherit"}" data-fav="${e.cnpj}" title="Favorito">${icone("estrela", 14, favs.has(e.cnpj) ? 'fill="#C08A1E"' : "")}</button></td></tr>`; }).join("")}
    </tbody></table>${itens.length ? "" : `<div class="vazio" style="margin:16px">${soFavoritos ? "Nenhuma empresa favorita. Use a estrela nos resultados da busca." : "Nenhuma empresa neste filtro."}</div>`}</section>
  </div>`;
  return { titulo: soFavoritos ? "Favoritos" : "Clientes e empresas", html, montar: (el) => ligarCartoes(el, () => {
    el.querySelectorAll("tr[data-href]").forEach((tr) => tr.addEventListener("click", (ev) => { if (!ev.target.closest("button")) location.hash = tr.dataset.href; }));
  }) };
}
const nomeIniciais = (e) => nomeEmpresa(e).split(" ").filter((w) => /^[A-ZÀ-Ú]/i.test(w) && w.length > 2).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export function tela(rota) {
  if (rota.chave === "clientes") return telaClientes(rota, false);
  if (rota.chave === "favoritos") return telaClientes(rota, true);
  return telaBusca(rota);
}
