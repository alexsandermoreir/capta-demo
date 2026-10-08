// Busca de processos (Inteligência): pesquisa nos processos já encontrados/cadastrados de todas as empresas.
import { EMPRESAS, PROCESSOS, nomeEmpresa } from "../dados.js";
import { avisar, dataBr, esc, icone, moeda } from "../util.js";

export function tela(rota) {
  const modo = rota.q.modo || "nome";
  const termo = rota.q.termo || "";
  const trib = rota.q.tribunal || "";
  const n = termo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const d = termo.replace(/\D/g, "");
  const itens = PROCESSOS.filter((p) => {
    const e = EMPRESAS.find((x) => x.cnpj === p.cnpj);
    const ok = !termo || (modo === "numero" ? p.numero.replace(/\D/g, "").includes(d) : modo === "cnpj" ? p.cnpj.includes(d) : `${e.razao} ${e.fantasia} ${(p.partes || []).map((x) => x[0]).join(" ")}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(n));
    return ok && (!trib || p.tribunal === trib);
  });
  const html = `<div class="pagina">
    <form class="cartao pad" data-form style="display:flex;flex-direction:column;gap:14px" aria-label="Buscar processos">
      <div class="segmentado" style="align-self:flex-start">${[["nome", "Nome da parte"], ["cnpj", "CNPJ"], ["numero", "Número CNJ"]].map(([v, l]) => `<button type="button" data-modo="${v}" class="${v === modo ? "ativo" : ""}">${l}</button>`).join("")}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><input type="hidden" name="modo" value="${modo}">
        <label class="caixa-busca" style="flex:1 1 320px;height:42px">${icone("busca", 16)}<input name="termo" value="${esc(termo)}" placeholder="${modo === "numero" ? "0000000-00.0000.0.00.0000" : modo === "cnpj" ? "00.000.000/0000-00" : "Razão social ou nome da parte"}"></label>
        <label class="filtro-sel" style="height:42px"><span>Tribunal</span><select name="tribunal"><option value="">Todos</option>${["TRT3", "TRF6", "TJMG"].map((t) => `<option ${t === trib ? "selected" : ""}>${t}</option>`).join("")}</select></label>
        <button class="btn primario" style="height:42px">Buscar</button></div>
      <span class="legenda">Pesquisa nos processos registrados no CAPTA (encontrados pela consulta automática por CNPJ ou cadastrados). Para buscar novos processos de uma empresa, abra a ficha › Jurídico › Processos.</span></form>
    <div style="display:flex;gap:10px;align-items:center"><b style="font-size:16px">${itens.length} processo(s)</b><button class="btn peq" style="margin-left:auto" data-salvar>${icone("estrela", 13)}Salvar busca</button></div>
    <section class="cartao" style="overflow-x:auto"><table class="tabela" style="min-width:900px"><thead><tr><th>Número</th><th>Empresa</th><th>Tribunal</th><th>Classe e órgão</th><th>Valor</th><th>Última publicação</th></tr></thead><tbody>
      ${itens.map((p) => { const e = EMPRESAS.find((x) => x.cnpj === p.cnpj); return `<tr class="clicavel" data-href="#/empresa/${p.cnpj}/juridico/processos"><td class="num"><b style="font-weight:600">${esc(p.numero)}</b><div class="legenda">${p.origem === "manual" ? "Manual" : p.vinculo === "nome" ? "Automática · razão social" : "Automática · CNPJ"}</div></td>
        <td>${esc(nomeEmpresa(e))}<div class="legenda">Polo ${p.polo}</div></td><td><span class="chip borda">${p.tribunal}</span></td><td>${esc(p.classe)}<div class="legenda">${esc(p.orgao)}</div></td><td class="num">${p.valor == null ? "—" : moeda(p.valor)}</td><td>${dataBr(p.ultimaPublicacao)}</td></tr>`; }).join("")}
    </tbody></table>${itens.length ? "" : '<div class="vazio" style="margin:16px">Nenhum processo encontrado com estes critérios.</div>'}</section></div>`;
  return { titulo: "Busca de processos", html, montar: (el) => {
    el.querySelectorAll("[data-modo]").forEach((b) => b.addEventListener("click", () => { location.hash = `#/processos?modo=${b.dataset.modo}`; }));
    el.querySelector("[data-form]").addEventListener("submit", (ev) => { ev.preventDefault(); location.hash = `#/processos?${new URLSearchParams([...new FormData(ev.target).entries()].filter(([, v]) => v))}`; });
    el.querySelectorAll("tr[data-href]").forEach((tr) => tr.addEventListener("click", () => { location.hash = tr.dataset.href; }));
    el.querySelector("[data-salvar]").addEventListener("click", () => avisar("Demonstração: no CAPTA, a busca fica salva e pode virar acompanhamento com alertas."));
  } };
}
