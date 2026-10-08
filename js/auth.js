// Serviço de autenticação do CAPTA (demonstração): Firebase Authentication + login com Google.
//
// - SDK modular oficial do Firebase (cópia local em assets/vendor/firebase), GoogleAuthProvider via janela (popup), com
//   redirecionamento quando o navegador bloqueia a janela.
// - Sessão mantida pelo próprio Firebase no navegador (browserLocalPersistence): atualizar a página não pede login de novo.
// - Estado único, avisado pelo evento "capta:auth": verificando | login | entrando | concluido | autenticado | erro.
// - Usuário identificado pelo UID do Firebase. perfil() já devolve o formato da evolução multiempresa:
//   UID → usuário CAPTA → tenant → plano → permissões → integrações (hoje fixo: demonstração).
import { configCompleta, firebaseConfig } from "./firebase-config.js";

const estado = { fase: "verificando", usuario: null, erro: null, aviso: null };
let fb = null;   // { auth, m }

export const estadoAuth = () => estado;
export const usuarioAtual = () => estado.usuario;

function mudar(fase, extras = {}) {
  Object.assign(estado, { fase, erro: null, aviso: null }, extras);
  window.dispatchEvent(new CustomEvent("capta:auth", { detail: { ...estado } }));
}

// Perfil CAPTA do usuário. Quando houver backend (CAPTA SaaS), virá de lá pelo UID; na demonstração é fixo.
export function perfil(u = estado.usuario) {
  if (!u) return null;
  return { uid: u.uid, tenant: { id: "demonstracao", nome: "Escritório Demonstração" }, plano: "demonstração", permissoes: ["*"], integracoes: [] };
}

const MENSAGENS = {
  "auth/popup-closed-by-user": [null, "O login foi cancelado. Clique em “Continuar com Google” para tentar de novo."],
  "auth/cancelled-popup-request": [null, "O login foi cancelado. Clique em “Continuar com Google” para tentar de novo."],
  "auth/user-cancelled": [null, "O login foi cancelado."],
  "auth/network-request-failed": ["Sem conexão", "Não foi possível falar com o Google. Verifique sua internet e tente novamente."],
  "auth/unauthorized-domain": ["Endereço não autorizado", "Este endereço ainda não está liberado para login no Firebase. O administrador precisa incluí-lo em Authentication › Configurações › Domínios autorizados."],
  "auth/operation-not-allowed": ["Login com Google desativado", "O login com Google não está ativado no projeto do Firebase."],
  "auth/invalid-api-key": ["Configuração inválida", "A chave pública do Firebase configurada no CAPTA não é válida."],
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.": ["Configuração inválida", "A chave pública do Firebase configurada no CAPTA não é válida."],
  "auth/too-many-requests": ["Muitas tentativas", "Aguarde alguns minutos e tente novamente."],
  "auth/user-disabled": ["Conta desativada", "Esta conta foi desativada. Fale com o administrador do CAPTA."],
  "auth/internal-error": ["Não foi possível entrar", "O Google não concluiu o login. Tente novamente em instantes."],
};
function traduzir(e) {
  const m = MENSAGENS[e?.code || ""];
  if (m) return m[0] ? { erro: { titulo: m[0], texto: m[1] } } : { aviso: m[1] };
  return { erro: { titulo: "Não foi possível entrar", texto: "Algo deu errado ao entrar. Tente novamente; se continuar, fale com o administrador." } };
}

const daConta = (u) => ({ uid: u.uid, email: u.email, nome: u.displayName || (u.email || "").split("@")[0], foto: u.photoURL || null });

async function carregar() {
  if (fb) return fb;
  const [appMod, m] = await Promise.all([import("../assets/vendor/firebase/firebase-app.js"), import("../assets/vendor/firebase/firebase-auth.js")]);
  const auth = m.getAuth(appMod.initializeApp(firebaseConfig));
  auth.languageCode = "pt-BR";
  await m.setPersistence(auth, m.browserLocalPersistence);
  fb = { auth, m };
  return fb;
}

export async function iniciar() {
  if (!configCompleta()) {
    mudar("login", { erro: { titulo: "Login ainda não configurado", texto: "Falta a configuração pública do Firebase (apiKey e appId) em js/firebase-config.js." } });
    return;
  }
  try {
    await carregar();
    await fb.m.getRedirectResult(fb.auth).catch((e) => { if (e?.code) mudar("login", traduzir(e)); });
    // acompanha a sessão o tempo todo: entrar, sair (inclusive em outra aba) e token renovado
    fb.m.onAuthStateChanged(fb.auth, (u) => {
      if (u) {
        estado.usuario = daConta(u);
        if (estado.fase !== "concluido") mudar("autenticado", { usuario: estado.usuario });
      } else if (estado.fase !== "entrando") {
        const deFora = estado.fase === "autenticado";   // saiu por outra aba ou a sessão expirou
        mudar("login", { usuario: null, erro: deFora ? null : estado.erro, aviso: deFora ? "Sua sessão foi encerrada." : estado.aviso });
      }
    });
  } catch (e) {
    mudar("login", traduzir(e));
  }
}

export async function entrar() {
  if (estado.fase === "entrando") return;
  mudar("entrando");
  try {
    await carregar();
    const provedor = new fb.m.GoogleAuthProvider();
    provedor.setCustomParameters({ prompt: "select_account" });
    let cred;
    try {
      cred = await fb.m.signInWithPopup(fb.auth, provedor);
    } catch (e) {
      if (e?.code === "auth/popup-blocked" || e?.code === "auth/operation-not-supported-in-this-environment") {
        await fb.m.signInWithRedirect(fb.auth, provedor);   // navegador bloqueou a janela: segue pelo redirecionamento
        return;
      }
      throw e;
    }
    mudar("concluido", { usuario: daConta(cred.user) });
    setTimeout(() => { if (estado.fase === "concluido") mudar("autenticado", { usuario: estado.usuario }); }, 700);
  } catch (e) {
    mudar("login", traduzir(e));
  }
}

export async function sair() {
  try {
    await carregar();
    mudar("saindo");
    await fb.m.signOut(fb.auth);
  } catch { /* sem conexão: a sessão local é encerrada mesmo assim */ }
  mudar("login", { usuario: null, aviso: "Você saiu do CAPTA." });
}
