// Arquivos: pastas EMP (clientes) e GRP (grupos), como no CAPTA.
import { EMPRESAS, nomeEmpresa } from "../dados.js";
import { tipoCrm } from "../crm.js";
import { avisar, esc, icone } from "../util.js";

export function tela() {
  const clientes = EMPRESAS.filter((e) => tipoCrm(e) === "cliente");
  const html = `<div class="pagina">
    <div style="display:flex;gap:10px;align-items:center"><label class="caixa-busca" style="flex:1;max-width:380px">${icone("busca", 16)}<input placeholder="Buscar arquivos ou empresas" aria-label="Buscar arquivos"></label>
      <button class="btn" style="margin-left:auto" data-acao>${icone("pasta", 14)}Copiar caminho da pasta</button></div>
    <div class="grade-3">${[...clientes.map((e) => [`${e.crm?.numero || "EMP-000099"} - ${nomeEmpresa(e)}`, `#/empresa/${e.cnpj}/arquivos`, "3 arquivos"]), ["GRP-000001 - Grupo Pão de Serra", `#/empresa/${EMPRESAS[0].cnpj}/grupo`, "Pasta do grupo"]]
      .map(([n, h, d]) => `<a class="cartao pad" href="${h}" style="display:flex;gap:12px;align-items:center;color:var(--tinta)"><span style="color:var(--marinho)">${icone("pasta", 28)}</span><div style="min-width:0"><b style="font-size:14px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n)}</b><span class="legenda">${d}</span></div></a>`).join("")}</div>
    <div class="aviso cinza">${icone("info", 16)}<span>No CAPTA, cada cliente tem uma pasta própria (no computador ou no servidor, e opcionalmente no Google Drive). Retirar um arquivo nunca o apaga.</span></div></div>`;
  return { titulo: "Arquivos", html, montar: (el) => el.querySelector("[data-acao]").addEventListener("click", () => avisar("Demonstração: no CAPTA, o caminho da pasta vai para a área de transferência.")) };
}
