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
