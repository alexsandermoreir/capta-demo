// Configuração Web PÚBLICA do Firebase (projeto CAPTA · capta-3e40e).
// Estes valores identificam o projeto para o navegador e não são segredos (o padrão do Firebase é publicá-los no site).
// O que protege o login é a configuração do projeto no Firebase Console (domínios autorizados e provedor Google).
// NUNCA coloque aqui service account, chave privada, token ou Admin SDK.
//
// Onde achar: Firebase Console › ⚙ Configurações do projeto › Geral › Seus apps › app Web › "SDK setup and configuration" › Config.
export const firebaseConfig = {
  apiKey: "AIzaSyCT_IGkneipxf1efLzIECuzpFrBZR5ljPo",
  authDomain: "capta-3e40e.firebaseapp.com",
  projectId: "capta-3e40e",
  storageBucket: "capta-3e40e.firebasestorage.app",
  messagingSenderId: "520520809286",
  appId: "1:520520809286:web:6bc809e33b74e31dd34347",
};

export const configCompleta = () => Boolean(firebaseConfig.apiKey && firebaseConfig.appId && firebaseConfig.projectId);
