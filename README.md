# CAPTA — demonstração web

Versão de demonstração do **CAPTA**, feita em HTML, CSS e JavaScript puros, para publicar no **GitHub Pages**.

- **O que mostra:** a mesma identidade visual, menus, telas e fluxos do CAPTA, com **dados fictícios**.
- **Independente do sistema:** não depende de servidor nem de banco de dados. Não se conecta ao sistema CAPTA, que
  continua separado e intacto.

## O que dá para fazer na demonstração

- **Visão geral (meu dia):**
  - compromissos, próximas ações, alterações detectadas e pipeline por etapa.
- **Empresas:**
  - **Buscar empresas:** busca com filtros (atividade, município, regime, dívida, situação), indicadores, favoritos,
    exportação CSV e "salvar como cliente";
  - **Clientes e empresas** e **Favoritos**.
- **Ficha da empresa:**
  - **Resumo:** débitos por esfera, localização, dados da empresa e contatos;
  - **Cadastro e regime;**
  - **Jurídico › Processos:** simula a **consulta automática por CNPJ** em TRT3, TRF6 e TJMG, em paralelo e com
    estado por tribunal. Tem detalhes de cada processo e cadastro manual sem duplicar;
  - **Débitos, mudanças, comunicação, propostas, grupo, arquivos e notas.**
- **Captação:**
  - **Leads:** listas salvas e pipeline em Kanban (arrastar e soltar) ou em lista;
  - **Propostas:** com a verificação antes do envio;
  - **Modo atendimento.**
- **Comunicação:**
  - **WhatsApp:** com consentimento, janela de 24 h e notas internas;
  - **E-mails, chamadas e agenda.**
- **Inteligência:**
  - busca de processos, diários oficiais e monitoramento.
- **Gestão:**
  - visão executiva e vendas.
- **Configurações:**
  - organização, integrações (estado honesto) e restaurar os dados da demonstração.

O que você muda (favoritos, etapas, notas, processos cadastrados, mensagens) fica salvo só no seu navegador
(`localStorage`). Para voltar ao início, use **Configurações › Dados da demonstração › Restaurar**.

**Nada sai do navegador:** nenhuma mensagem, e-mail, ligação ou consulta real é feita. Todas as empresas, pessoas,
CNPJs e processos são inventados. Os números de CNPJ e CNJ têm dígito verificador válido só para o formato ficar
realista.

## Login (Firebase Authentication · Google)

O acesso à demonstração exige login com Google, pelo projeto Firebase **CAPTA** (`capta-3e40e`).

- **Sem login:** qualquer endereço (`#/inicio`, `#/empresa/...`) mostra a tela "Bem-vindo ao CAPTA". A rota pedida
  abre logo depois do login.
- **"Continuar com Google":**
  - abre a janela oficial do Google (`signInWithPopup` com `GoogleAuthProvider`);
  - se o navegador bloquear a janela, segue por redirecionamento.
- **Sessão:** fica guardada pelo Firebase no navegador (`browserLocalPersistence`). Atualizar a página não pede login
  de novo.
- **Sair:** o botão "Sair", na barra superior, encerra a sessão (`signOut`) e volta para o login.
- **Estados da tela:**
  - verificando;
  - carregando ("Conectando com o Google…");
  - concluído;
  - erros explicados em linguagem simples: sem internet, janela fechada, endereço não autorizado etc.
- **Usuário:** identificado pelo **UID do Firebase**. `perfil()` em `js/auth.js` já devolve o formato da evolução
  multiempresa:
  - UID → usuário → tenant → plano → permissões → integrações.
  - O estado da demonstração (favoritos, Kanban, notas) fica separado por UID neste navegador.

**Arquivos:**

| Arquivo | Função |
|---|---|
| `js/auth.js` | serviço de autenticação |
| `js/telas/login.js` | tela de login |
| `js/firebase-config.js` | configuração Web pública |
| `assets/vendor/firebase/` | SDK modular oficial 12.19.0, cópia local |

Não há Admin SDK, service account nem chave privada, e não deve haver.

**Limite importante:** esta é uma página estática. O login controla quem **vê** a demonstração, e os dados são todos
fictícios e públicos no repositório. Quando o CAPTA real usar o mesmo login, a conferência será feita também no
servidor.

### Configurar (uma vez)

1. **Configuração Web:** em `js/firebase-config.js`, preencha `apiKey` e `appId`. Eles ficam em **Firebase Console ›
   ⚙ Configurações do projeto › Geral › Seus apps › (app Web) › Config**. São valores públicos.
2. **Domínios autorizados:** em **Firebase Console › Authentication › Settings (Configurações) › Authorized domains
   (Domínios autorizados)**, inclua:
   - `capta.app.br`
   - `alexsandermoreir.github.io`
   - `127.0.0.1`, para testar no computador (`localhost` já vem incluído)
   - mais adiante, `app.capta.app.br`

## Estrutura

```
index.html            página única (rotas por hash: #/inicio, #/busca, #/empresa/<cnpj>/juridico/processos...)
css/capta.css         identidade visual do CAPTA (cores, tipografia, componentes, responsivo)
js/app.js             moldura (menu lateral, barra superior, discador) e roteador
js/dados.js           dados fictícios
js/crm.js             estado da demonstração (favoritos, etapas, processos, consultas, notas) no localStorage
js/util.js            utilitários (escape de HTML, formatação, ícones, diálogo, avisos)
js/telas/*.js         uma tela por arquivo
assets/               ícone e fonte Schibsted Grotesk (licença OFL, em assets/fonts/OFL.txt)
.nojekyll             publica os arquivos como estão no GitHub Pages
```

- Sem build, sem framework e sem dependências externas.
- Os caminhos são relativos, então funciona em `usuario.github.io/capta-demo/`.
- As rotas por hash funcionam sem configuração extra.

## Rodar no computador

Os módulos JavaScript precisam de um servidor local; não funcionam abrindo o `index.html` com duplo clique. Na pasta
do projeto:

```bash
python -m http.server 8080
```

Abra <http://localhost:8080>.

## Publicar no GitHub Pages

1. **Criar o repositório** com o **GitHub Desktop**:
   - **File › Add local repository** e escolha a pasta `capta-demo`;
   - clique em **create a repository** e **mantenha o nome `capta-demo`**;
   - em Git ignore e License, escolha **None**;
   - clique em **Create repository**.
2. **Publicar o código:**
   - clique em **Publish repository**;
   - para o GitHub Pages gratuito, **desmarque** "Keep this code private". No plano gratuito, Pages só funciona com
     repositório público. Nos planos pagos do GitHub, pode ser privado.
3. **Ligar o Pages** no site do GitHub:
   - abra o repositório › **Settings › Pages**;
   - em **Source**, escolha **Deploy from a branch**;
   - em **Branch**, escolha `main`, pasta **`/ (root)`**, e clique em **Save**.
4. **Acessar:** em 1 ou 2 minutos, o endereço aparece no topo da página de Pages, por exemplo
   `https://SEU_USUARIO.github.io/capta-demo/`.

Para atualizar: faça **Commit** e **Push** no GitHub Desktop. O Pages publica sozinho em seguida.

### Usar um domínio próprio (opcional)

Para abrir a demonstração em, por exemplo, `demo.capta.app.br`:

1. Em **Settings › Pages › Custom domain**, informe `demo.capta.app.br`.
2. No DNS do domínio (HostGator), crie um registro **CNAME**:
   - **Nome:** `demo`
   - **Aponta para:** `SEU_USUARIO.github.io`
3. Marque **Enforce HTTPS** quando o GitHub liberar.

O `app.` e o `webhook.` continuam reservados para o sistema CAPTA na VPS.
