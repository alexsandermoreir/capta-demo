// Agenda: mês com reuniões e tarefas, e a lista dos próximos compromissos.
import { AGENDA, empresa, nomeEmpresa } from "../dados.js";
import { avisar, dialogo, esc, icone } from "../util.js";

const DIAS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

export function tela(rota) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const desloc = Number(rota.q.mes || 0);
  const ref = new Date(hoje.getFullYear(), hoje.getMonth() + desloc, 1);
  const inicio = new Date(ref);
  inicio.setDate(1 - ((ref.getDay() + 6) % 7));
  const eventos = AGENDA.map((a) => { const d = new Date(hoje); d.setDate(d.getDate() + a.dia); return { ...a, data: d }; });
  const mesmoDia = (a, b) => a.toDateString() === b.toDateString();
  const celulas = Array.from({ length: 42 }, (_, i) => { const d = new Date(inicio); d.setDate(inicio.getDate() + i); return d; });
  const titulo = ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const proximos = eventos.filter((e) => e.data >= hoje).sort((a, b) => a.data - b.data);
  const html = `<div class="pagina"><div class="grade-2">
    <section class="cartao" aria-label="Calendário"><div style="display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid var(--borda-3)">
      <a class="btn peq" href="#/agenda?mes=${desloc - 1}" aria-label="Mês anterior">‹</a><a class="btn peq" href="#/agenda">Hoje</a><a class="btn peq" href="#/agenda?mes=${desloc + 1}" aria-label="Próximo mês">›</a>
      <b style="font-size:16px;text-transform:capitalize;margin-left:6px">${titulo}</b><button class="btn primario peq" style="margin-left:auto" data-novo>${icone("mais", 13)}Nova reunião</button></div>
      <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr))">${DIAS.map((d) => `<div style="padding:8px 10px;font-size:11px;font-weight:600;color:var(--apagado);border-bottom:1px solid var(--borda-3)">${d}</div>`).join("")}
        ${celulas.map((d) => { const ev = eventos.filter((e) => mesmoDia(e.data, d)); const fora = d.getMonth() !== ref.getMonth(); const eh = mesmoDia(d, hoje);
          return `<div style="min-height:96px;padding:6px 8px;border-right:1px solid var(--borda-3);border-bottom:1px solid var(--borda-3);background:${fora ? "#FBFAF8" : "#fff"}">
            <span style="font-size:12px;font-weight:600;${eh ? "background:var(--marinho);color:#fff;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center" : `color:${fora ? "var(--fraco)" : "var(--tinta-2)"}`}">${d.getDate()}</span>
            ${ev.map((e) => `<a href="#/empresa/${e.cnpj}" title="${esc(e.titulo)}" style="display:block;margin-top:4px;padding:3px 6px;border-radius:5px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:${e.tipo === "reuniao" ? "var(--azul-claro)" : "var(--ambar-claro)"};color:${e.tipo === "reuniao" ? "var(--marinho)" : "var(--ambar-escuro)"}">${e.hora} ${esc(e.titulo)}</a>`).join("")}</div>`; }).join("")}</div></section>
    <section class="cartao pad" aria-label="Próximos compromissos"><div class="cartao-titulo"><h3>Próximos compromissos</h3><small>${proximos.length}</small></div>
      ${proximos.map((e) => `<a href="#/empresa/${e.cnpj}" style="display:flex;gap:12px;padding:11px 0;border-top:1px solid var(--borda-3);color:var(--tinta)"><div style="width:46px;text-align:center"><b style="font-size:18px">${e.data.getDate()}</b><div class="legenda" style="text-transform:uppercase">${e.data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</div></div>
        <div><b style="font-size:13px">${esc(e.titulo)}</b><div class="legenda">${e.hora} · ${e.tipo === "reuniao" ? "Reunião · pendente de sincronização com o Google Agenda" : "Tarefa"} · ${esc(nomeEmpresa(empresa(e.cnpj)))}</div></div></a>`).join("")}</section>
  </div></div>`;
  return { titulo: "Agenda", html, montar: (el) => el.querySelector("[data-novo]").addEventListener("click", () => dialogo({
    titulo: "Nova reunião", campos: [{ tipo: "texto", nome: "t", rotulo: "Título", obrigatorio: true }, { tipo: "texto", nome: "q", rotulo: "Quando", entrada: "datetime-local" },
      { tipo: "aviso", nivel: "azul", texto: "No CAPTA, a reunião fica “pendente de sincronização” até você mandá-la ao Google Agenda, que cria o link do Meet e envia os convites." }],
    confirmar: "Salvar no CAPTA", aoConfirmar: () => avisar("Demonstração: reunião não gravada (dados fictícios)."),
  })) };
}
