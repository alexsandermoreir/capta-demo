// Tela de login do CAPTA (layout da tela "Entrar" do CAPTA: painel azul-marinho com a marca e o cartão de entrada).
import { entrar, estadoAuth } from "../auth.js";
import { esc } from "../util.js";

const MARCA = (cor, fundo, t) => `<div style="width:${t}px;height:${t}px;border-radius:10px;background:${fundo};display:flex;align-items:center;justify-content:center"><svg width="${t * 0.6}" height="${t * 0.6}" viewBox="0 0 24 24" fill="none" stroke="${cor}" stroke-width="1.7" stroke-linecap="round"><path d="M12 12L18.5 5.5"></path><path d="M20 12a8 8 0 11-8-8"></path><path d="M16 12a4 4 0 11-4-4"></path><circle cx="12" cy="12" r="1.2" fill="${cor}"></circle></svg></div>`;
const GOOGLE = `<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"></path><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"></path><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"></path><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"></path></svg>`;

export function htmlLogin() {
  const s = estadoAuth();
  const ocupado = ["entrando", "concluido", "verificando", "saindo"].includes(s.fase);
  const rotulo = { verificando: "Verificando sua sessão…", entrando: "Conectando com o Google…", concluido: "Entrando…", saindo: "Saindo…" }[s.fase] || "Continuar com Google";
  return `<div class="login">
    <aside class="login-marca" aria-hidden="true">
      <div style="display:flex;align-items:center;gap:12px">${MARCA("#1C3253", "#FFFFFF", 40)}<b style="font-size:20px;letter-spacing:-.01em">CAPTA</b></div>
      <div style="margin-top:auto;display:flex;flex-direction:column;gap:16px;max-width:480px"><span class="login-slogan">Inteligência empresarial e relacionamento comercial em um só lugar.</span>
        <span style="font-size:16px;line-height:1.55;color:#C9D3E2">Encontre empresas, acompanhe débitos e processos, converse com clientes e feche propostas com a equipe.</span></div>
      <div style="display:flex;gap:20px;font-size:12px;color:#9AABC4;flex-wrap:wrap"><span>© ${new Date().getFullYear()} CAPTA</span><span>Demonstração com dados fictícios</span></div>
    </aside>
    <main class="login-corpo" id="conteudo">
      <div class="login-topo-movel">${MARCA("#FFFFFF", "#1C3253", 34)}<b style="font-size:17px">CAPTA</b></div>
      <section class="login-cartao" aria-label="Entrar no CAPTA">
        <div style="display:flex;flex-direction:column;gap:8px"><h1 style="margin:0;font-size:28px;font-weight:600;letter-spacing:-.02em">Bem-vindo ao CAPTA</h1>
          <p style="margin:0;font-size:14px;color:var(--suave);line-height:1.55">Entre com a sua conta Google para acessar empresas, processos, propostas e conversas do seu escritório.</p></div>
        ${s.erro ? `<div class="login-alerta erro" role="alert"><b>${esc(s.erro.titulo)}</b><span>${esc(s.erro.texto)}</span></div>` : ""}
        ${s.aviso ? `<div class="login-alerta info" role="status">${esc(s.aviso)}</div>` : ""}
        ${s.fase === "concluido" ? `<div class="login-alerta ok" role="status">✓ Tudo certo${s.usuario?.nome ? `, ${esc(s.usuario.nome.split(" ")[0])}` : ""}! Abrindo o CAPTA…</div>` : ""}
        <button type="button" class="login-google" data-entrar ${ocupado ? 'disabled aria-busy="true"' : ""}>${ocupado ? '<span class="spinner"></span>' : GOOGLE}${rotulo}</button>
        <p class="legenda" style="margin:0;line-height:1.5">O login é feito pelo Google (Firebase Authentication). O CAPTA não vê nem guarda a sua senha.</p>
      </section>
    </main>
  </div>`;
}

export function ligarLogin(raiz) {
  raiz.querySelector("[data-entrar]")?.addEventListener("click", () => entrar());
}
