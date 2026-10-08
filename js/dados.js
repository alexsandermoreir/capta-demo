// Dados FICTÍCIOS da demonstração. Empresas, pessoas, CNPJs e processos são inventados (CNPJ e número CNJ com dígito
// verificador válido só para o formato ficar realista). Nada aqui vem de base real.
import { diasAtras, diasAFrente, hojeIso } from "./util.js";

function dvCnpj(base) {
  const calc = (b) => { const p = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2].slice(-b.length); const s = [...b].reduce((a, c, i) => a + Number(c) * p[i], 0) % 11; return s < 2 ? "0" : String(11 - s); };
  const d1 = calc(base);
  return base + d1 + calc(base + d1);
}
function cnj(seq, ano, j, tr, origem) {
  const base = `${String(seq).padStart(7, "0")}${ano}${j}${tr}${origem}`;
  const dv = String(98 - Number(BigInt(base + "00") % 97n)).padStart(2, "0");
  return `${base.slice(0, 7)}-${dv}.${ano}.${j}.${tr}.${origem}`;
}

const E = (raiz, ordem, dados) => ({ cnpj: dvCnpj(raiz + ordem), ...dados });

export const EMPRESAS = [
  E("48213907", "0001", { fantasia: "Padaria Pão de Serra", razao: "PANIFICADORA PAO DE SERRA LTDA", cnae: "1091-1/02", cnaeDesc: "Fabricação de produtos de padaria e confeitaria", natureza: "Sociedade Empresária Limitada", porte: "Empresa de pequeno porte (EPP)", capital: 120000, abertura: "2011-03-14", situacao: "Ativa", regime: "Simples Nacional", municipio: "Belo Horizonte", bairro: "Savassi", endereco: "Rua das Acácias, 410", cep: "30140-090", telefones: [["(31) 98877-4410", true], ["(31) 3221-4410", false]], email: "contato@paodeserra.exemplo", socios: [["Helena Duarte Campos", "Sócia-Administradora", 2011], ["Rafael Campos Lima", "Sócio", 2015]], dividas: { federal: [86450.32, 6, 2], estadual: [21880.15, 1], municipal: [0, 0] }, crm: { tipo: "cliente", numero: "EMP-000012", lista: 1, etapa: "proposta", resp: "Ana Beatriz" } }),
  E("27650441", "0001", { fantasia: "Transportes Vale Verde", razao: "VALE VERDE TRANSPORTES E LOGISTICA LTDA", cnae: "4930-2/02", cnaeDesc: "Transporte rodoviário de carga intermunicipal", natureza: "Sociedade Empresária Limitada", porte: "Demais", capital: 1500000, abertura: "2004-08-02", situacao: "Ativa", regime: "Lucro Presumido · ECF 2024", municipio: "Contagem", bairro: "Cidade Industrial", endereco: "Av. das Indústrias, 2200", cep: "32210-000", telefones: [["(31) 3355-9020", false], ["(31) 99120-7788", true]], email: "financeiro@valeverde.exemplo", socios: [["Marcos Antônio Reis", "Sócio-Administrador", 2004]], dividas: { federal: [412300.9, 14, 5], estadual: [188420.0, 2], municipal: [0, 0] }, crm: { tipo: "cliente", numero: "EMP-000007", lista: 1, etapa: "negociacao", resp: "Carlos Menezes" } }),
  E("33918204", "0001", { fantasia: "Clínica Bem Viver", razao: "BEM VIVER SERVICOS MEDICOS LTDA", cnae: "8630-5/03", cnaeDesc: "Atividade médica ambulatorial restrita a consultas", natureza: "Sociedade Empresária Limitada", porte: "Microempresa (ME)", capital: 60000, abertura: "2016-05-20", situacao: "Ativa", regime: "Simples Nacional", municipio: "Belo Horizonte", bairro: "Funcionários", endereco: "Rua Paraíba, 1120, sala 804", cep: "30130-141", telefones: [["(31) 99701-2211", true]], email: "adm@bemviver.exemplo", socios: [["Juliana Teles Moura", "Sócia-Administradora", 2016]], dividas: { federal: [0, 0, 0], estadual: [0, 0], municipal: [3820.4, 2] }, crm: { tipo: "lead", lista: 1, etapa: "contato", resp: "Ana Beatriz" } }),
  E("51007832", "0001", { fantasia: "Mercado Bom Preço", razao: "COMERCIAL BOM PRECO DE ALIMENTOS LTDA", cnae: "4711-3/02", cnaeDesc: "Comércio varejista de mercadorias em geral (supermercados)", natureza: "Sociedade Empresária Limitada", porte: "Empresa de pequeno porte (EPP)", capital: 300000, abertura: "2009-11-09", situacao: "Ativa", regime: "Simples Nacional · desenquadrado em 2025", municipio: "Betim", bairro: "Centro", endereco: "Rua Inconfidentes, 85", cep: "32600-010", telefones: [["(31) 98450-3030", true]], email: "", socios: [["Paulo Henrique Silva", "Sócio-Administrador", 2009], ["Renata Silva", "Sócia", 2009]], dividas: { federal: [154900.0, 9, 3], estadual: [96310.55, 1], municipal: [0, 0] }, crm: { tipo: "lead", lista: 1, etapa: "novo", resp: "" } }),
  E("19442610", "0001", { fantasia: "Ótica Visão Clara", razao: "VISAO CLARA OTICA E RELOJOARIA LTDA", cnae: "4774-1/00", cnaeDesc: "Comércio varejista de artigos de óptica", natureza: "Sociedade Empresária Limitada", porte: "Microempresa (ME)", capital: 40000, abertura: "2013-02-01", situacao: "Ativa", regime: "Simples Nacional", municipio: "Divinópolis", bairro: "Centro", endereco: "Av. Primeiro de Junho, 512", cep: "35500-002", telefones: [["(37) 99812-6060", true]], email: "visaoclara@exemplo.com.br", socios: [["Fernanda Lopes", "Sócia-Administradora", 2013]], dividas: { federal: [0, 0, 0], estadual: [0, 0], municipal: [0, 0] }, crm: { tipo: "lead", lista: 1, etapa: "whatsapp", resp: "Carlos Menezes" } }),
  E("60288175", "0001", { fantasia: "Construtora Horizonte Azul", razao: "HORIZONTE AZUL CONSTRUCOES E INCORPORACOES S/A", cnae: "4120-4/00", cnaeDesc: "Construção de edifícios", natureza: "Sociedade Anônima Fechada", porte: "Demais", capital: 8000000, abertura: "1998-07-15", situacao: "Ativa", regime: "Lucro Real · ECF 2024", municipio: "Nova Lima", bairro: "Vila da Serra", endereco: "Alameda Oscar Niemeyer, 1300", cep: "34006-056", telefones: [["(31) 3289-5500", false]], email: "juridico@horizonteazul.exemplo", socios: [["Ricardo Almeida Prado", "Diretor", 1998], ["Sílvia Prado", "Diretora", 2006], ["Gustavo Nery", "Conselheiro", 2019]], dividas: { federal: [1284500.0, 22, 8], estadual: [0, 0], municipal: [41280.0, 3] }, crm: { tipo: "cliente", numero: "EMP-000003", lista: 1, etapa: "fechado", resp: "Ana Beatriz" } }),
  E("44781256", "0001", { fantasia: "Restaurante Sabor Mineiro", razao: "SABOR MINEIRO RESTAURANTE E EVENTOS LTDA", cnae: "5611-2/01", cnaeDesc: "Restaurantes e similares", natureza: "Sociedade Empresária Limitada", porte: "Microempresa (ME)", capital: 50000, abertura: "2018-09-10", situacao: "Ativa", regime: "Simples Nacional", municipio: "Belo Horizonte", bairro: "Lourdes", endereco: "Rua Curitiba, 2050", cep: "30170-122", telefones: [["(31) 99644-1212", true]], email: "eventos@sabormineiro.exemplo", socios: [["Lúcia Martins", "Sócia-Administradora", 2018]], dividas: { federal: [23500.0, 3, 0], estadual: [12100.0, 1], municipal: [0, 0] }, crm: { tipo: "lead", lista: 1, etapa: "email", resp: "Ana Beatriz" } }),
  E("38104472", "0001", { fantasia: "Auto Peças Rodovia", razao: "RODOVIA AUTO PECAS E SERVICOS LTDA", cnae: "4530-7/03", cnaeDesc: "Comércio a varejo de peças e acessórios para veículos", natureza: "Sociedade Empresária Limitada", porte: "Empresa de pequeno porte (EPP)", capital: 180000, abertura: "2007-04-23", situacao: "Ativa", regime: "Simples Nacional", municipio: "Juiz de Fora", bairro: "Benfica", endereco: "Rodovia BR-040, km 768", cep: "36090-000", telefones: [["(32) 98811-4400", true]], email: "", socios: [["Wagner Teixeira", "Sócio-Administrador", 2007]], dividas: { federal: [67800.0, 5, 1], estadual: [0, 0], municipal: [0, 0] }, crm: { tipo: "lead", lista: 1, etapa: "ligacao", resp: "Carlos Menezes" } }),
  E("72519033", "0001", { fantasia: "Laticínios Serra da Canastra", razao: "LATICINIOS SERRA DA CANASTRA LTDA", cnae: "1052-0/00", cnaeDesc: "Fabricação de laticínios", natureza: "Sociedade Empresária Limitada", porte: "Demais", capital: 950000, abertura: "2002-01-30", situacao: "Ativa", regime: "Lucro Presumido · ECF 2024", municipio: "São Roque de Minas", bairro: "Zona Rural", endereco: "Estrada Municipal, km 4", cep: "37928-000", telefones: [["(37) 3433-1199", false]], email: "comercial@serracanastra.exemplo", socios: [["Antônio Carlos Freitas", "Sócio-Administrador", 2002]], dividas: { federal: [233000.0, 7, 2], estadual: [57340.0, 1], municipal: [0, 0] }, crm: { tipo: "lead", lista: 1, etapa: "retorno", resp: "Ana Beatriz" } }),
  E("15830967", "0001", { fantasia: "Studio Corpo em Forma", razao: "CORPO EM FORMA ACADEMIA LTDA", cnae: "9313-1/00", cnaeDesc: "Atividades de condicionamento físico", natureza: "Sociedade Empresária Limitada", porte: "Microempresa (ME)", capital: 30000, abertura: "2020-02-17", situacao: "Ativa", regime: "Simples Nacional", municipio: "Uberlândia", bairro: "Santa Mônica", endereco: "Av. Segismundo Pereira, 900", cep: "38408-170", telefones: [["(34) 99231-8080", true]], email: "studio@corpoemforma.exemplo", socios: [["Diego Andrade", "Sócio-Administrador", 2020]], dividas: { federal: [0, 0, 0], estadual: [0, 0], municipal: [0, 0] }, crm: null }),
  E("29365518", "0001", { fantasia: "Gráfica Página Certa", razao: "PAGINA CERTA GRAFICA E EDITORA LTDA", cnae: "1813-0/01", cnaeDesc: "Impressão de material para uso publicitário", natureza: "Sociedade Empresária Limitada", porte: "Microempresa (ME)", capital: 80000, abertura: "2012-06-04", situacao: "Baixada", regime: "Regime não informado", municipio: "Montes Claros", bairro: "Centro", endereco: "Rua Dr. Santos, 77", cep: "39400-001", telefones: [["(38) 3221-4545", false]], email: "", socios: [["Otávio Mendes", "Sócio-Administrador", 2012]], dividas: { federal: [18900.0, 2, 0], estadual: [0, 0], municipal: [0, 0] }, crm: null }),
  E("48213907", "0002", { fantasia: "Padaria Pão de Serra · Filial Pampulha", razao: "PANIFICADORA PAO DE SERRA LTDA", cnae: "1091-1/02", cnaeDesc: "Fabricação de produtos de padaria e confeitaria", natureza: "Sociedade Empresária Limitada", porte: "Empresa de pequeno porte (EPP)", capital: 120000, abertura: "2019-10-01", situacao: "Ativa", regime: "Simples Nacional", municipio: "Belo Horizonte", bairro: "Pampulha", endereco: "Av. Otacílio Negrão de Lima, 3300", cep: "31365-450", telefones: [["(31) 3441-9090", false]], email: "", socios: [["Helena Duarte Campos", "Sócia-Administradora", 2011]], dividas: { federal: [0, 0, 0], estadual: [0, 0], municipal: [0, 0] }, filial: true, crm: null }),
  E("57092341", "0001", { fantasia: "Farmácia Saúde Já", razao: "SAUDE JA DROGARIA LTDA", cnae: "4771-7/01", cnaeDesc: "Comércio varejista de produtos farmacêuticos", natureza: "Sociedade Empresária Limitada", porte: "Empresa de pequeno porte (EPP)", capital: 220000, abertura: "2014-12-01", situacao: "Ativa", regime: "Simples Nacional", municipio: "Ipatinga", bairro: "Centro", endereco: "Av. 28 de Abril, 640", cep: "35160-004", telefones: [["(31) 99877-6655", true]], email: "compras@saudeja.exemplo", socios: [["Cláudia Rezende", "Sócia-Administradora", 2014]], dividas: { federal: [44210.0, 4, 1], estadual: [8890.0, 1], municipal: [0, 0] }, crm: { tipo: "lead", lista: 2, etapa: "novo", resp: "" } }),
  E("63417728", "0001", { fantasia: "Metalúrgica Ferro Forte", razao: "FERRO FORTE METALURGICA INDUSTRIAL LTDA", cnae: "2511-0/00", cnaeDesc: "Fabricação de estruturas metálicas", natureza: "Sociedade Empresária Limitada", porte: "Demais", capital: 2400000, abertura: "1995-03-03", situacao: "Ativa", regime: "Lucro Real · ECF 2024", municipio: "Sete Lagoas", bairro: "Distrito Industrial", endereco: "Rua Um, 1500", cep: "35702-153", telefones: [["(31) 3779-2000", false]], email: "rh@ferroforte.exemplo", socios: [["Roberto Siqueira", "Sócio-Administrador", 1995], ["Beatriz Siqueira", "Sócia", 2010]], dividas: { federal: [698000.0, 11, 4], estadual: [302500.0, 3], municipal: [0, 0] }, crm: { tipo: "lead", lista: 2, etapa: "contato", resp: "Carlos Menezes" } }),
];
export const empresa = (cnpj) => EMPRESAS.find((e) => e.cnpj === String(cnpj).replace(/\D/g, ""));
export const nomeEmpresa = (e) => e?.fantasia || e?.razao || "";

// ------------------------------------------------------------------ processos
const ANDAMENTOS = {
  trab: ["Audiência de conciliação designada", "Juntada de petição de manifestação", "Conclusos para despacho", "Expedida notificação", "Recebida contestação", "Perícia contábil designada"],
  fed: ["Juntada de impugnação aos embargos", "Remetidos os autos à Fazenda Nacional", "Penhora on-line (SISBAJUD) cumprida parcialmente", "Despacho: manifeste-se o executado", "Citação por carta com AR positiva"],
  est: ["Publicado despacho", "Juntada de documento", "Decorrido prazo", "Concluso para decisão", "Remessa ao contador judicial"],
};
let seq = 1000;
function P(cnpjBase, trib, dados) {
  const e = EMPRESAS.find((x) => x.cnpj.startsWith(cnpjBase));
  const [j, tr, origem, tipoAnd] = trib === "TRT3" ? ["5", "03", dados.origem || "0011", "trab"] : trib === "TRF6" ? ["4", dados.tr || "06", dados.origem || "3800", "fed"] : ["8", "13", dados.origem || "0024", "est"];
  seq += 37;
  const andas = (dados.andamentos ?? 3);
  return {
    id: `p${seq}`, cnpj: e.cnpj, numero: cnj(seq * 13, dados.ano || "2024", j, tr, origem), tribunal: trib, fonte: "DJEN (CNJ)",
    origem: dados.manual ? "manual" : "automatica", vinculo: dados.manual ? null : (trib === "TRF6" ? "nome" : "cnpj"),
    area: trib === "TRT3" ? "Trabalhista" : dados.area || null, classe: dados.classe, assunto: dados.assunto || null,
    orgao: dados.orgao, polo: dados.polo || "passivo", partes: dados.partes, valor: dados.valor ?? null,
    distribuido: dados.distribuido || null, situacao: dados.situacao || null, grau: dados.grau || null,
    ultimaPublicacao: diasAtras(dados.diasPub ?? 12), andamentos: Array.from({ length: andas }, (_, i) => ({ data: diasAtras((dados.diasPub ?? 12) + i * 17), texto: ANDAMENTOS[tipoAnd][(seq + i) % ANDAMENTOS[tipoAnd].length] })),
    etiquetas: dados.etiquetas || [], favorito: !!dados.favorito,
  };
}
export const PROCESSOS = [
  P("48213907", "TRT3", { classe: "Ação Trabalhista - Rito Ordinário", orgao: "12ª Vara do Trabalho de Belo Horizonte", partes: [["Sérgio Luiz Araújo", "ativo"], ["PANIFICADORA PAO DE SERRA LTDA", "passivo", true]], distribuido: "2024-04-11", grau: "G1", valor: 48200, assunto: "Horas extras; Adicional noturno", diasPub: 6, etiquetas: ["Importante"] }),
  P("48213907", "TRT3", { classe: "Ação Trabalhista - Rito Sumaríssimo", orgao: "3ª Vara do Trabalho de Belo Horizonte", partes: [["Patrícia Gomes Neves", "ativo"], ["PANIFICADORA PAO DE SERRA LTDA", "passivo", true]], distribuido: "2025-02-03", grau: "G1", valor: 19800, ano: "2025", diasPub: 28 }),
  P("48213907", "TRF6", { classe: "Execução Fiscal", orgao: "16ª Vara Federal de Execução Fiscal de Belo Horizonte", partes: [["UNIÃO - FAZENDA NACIONAL", "ativo"], ["PANIFICADORA PAO DE SERRA LTDA", "passivo", true]], area: "Tributário", valor: 86450.32, distribuido: "2023-09-18", grau: "G1", ano: "2023", diasPub: 9, etiquetas: ["Honorários"] }),
  P("48213907", "TJMG", { classe: "Procedimento Comum Cível", orgao: "2ª Vara Cível da Comarca de Belo Horizonte", partes: [["PANIFICADORA PAO DE SERRA LTDA", "ativo", true], ["Distribuidora Trigo Fino Ltda", "passivo"]], area: "Civil", valor: 32700, distribuido: "2024-07-22", grau: "G1", diasPub: 40 }),
  P("48213907", "TJMG", { manual: true, classe: "Execução Fiscal", orgao: "Vara de Execuções Fiscais Estaduais de Belo Horizonte", partes: [["ESTADO DE MINAS GERAIS", "ativo"], ["PANIFICADORA PAO DE SERRA LTDA", "passivo", true]], area: "Tributário", valor: 21880.15, assunto: "ICMS — PTA 01.000234567-89", distribuido: "2025-05-06", situacao: "1ª instância", ano: "2025", diasPub: 55, etiquetas: ["Urgente"] }),
  P("27650441", "TRT3", { classe: "Ação Trabalhista - Rito Ordinário", orgao: "1ª Vara do Trabalho de Contagem", origem: "0029", partes: [["Edson Rocha Pereira", "ativo"], ["VALE VERDE TRANSPORTES E LOGISTICA LTDA", "passivo", true]], distribuido: "2024-01-30", grau: "G1", valor: 112000, diasPub: 3 }),
  P("27650441", "TRT3", { classe: "Recurso Ordinário Trabalhista", orgao: "5ª Turma do TRT da 3ª Região", origem: "0029", partes: [["Rogério Fonseca", "ativo"], ["VALE VERDE TRANSPORTES E LOGISTICA LTDA", "passivo", true]], distribuido: "2023-06-12", grau: "G2", valor: 76000, ano: "2023", diasPub: 14 }),
  P("27650441", "TRF6", { classe: "Execução Fiscal", orgao: "1ª Vara Federal de Contagem", origem: "3806", partes: [["UNIÃO - FAZENDA NACIONAL", "ativo"], ["VALE VERDE TRANSPORTES E LOGISTICA LTDA", "passivo", true]], area: "Tributário", valor: 412300.9, distribuido: "2022-11-08", grau: "G1", ano: "2022", diasPub: 21 }),
  P("60288175", "TJMG", { classe: "Ação de Cobrança", orgao: "1ª Vara Cível da Comarca de Nova Lima", origem: "0188", partes: [["Condomínio Residencial Mirante", "ativo"], ["HORIZONTE AZUL CONSTRUCOES E INCORPORACOES S/A", "passivo", true]], area: "Civil", valor: 245000, distribuido: "2024-03-19", grau: "G1", diasPub: 7 }),
  P("60288175", "TRF6", { classe: "Mandado de Segurança Cível", orgao: "6ª Vara Federal Cível de Belo Horizonte", partes: [["HORIZONTE AZUL CONSTRUCOES E INCORPORACOES S/A", "ativo", true], ["Delegado da Receita Federal em Belo Horizonte", "passivo"]], area: "Tributário", assunto: "Exclusão do ICMS da base do PIS/COFINS", distribuido: "2024-08-05", grau: "G1", diasPub: 33, favorito: true }),
  P("63417728", "TRT3", { classe: "Ação Trabalhista - Rito Ordinário", orgao: "2ª Vara do Trabalho de Sete Lagoas", origem: "0040", partes: [["Valdir Moreira Santos", "ativo"], ["FERRO FORTE METALURGICA INDUSTRIAL LTDA", "passivo", true]], distribuido: "2025-03-25", grau: "G1", valor: 89000, ano: "2025", diasPub: 2 }),
  P("51007832", "TJMG", { classe: "Execução Fiscal", orgao: "Vara de Fazenda Pública de Betim", origem: "0027", partes: [["ESTADO DE MINAS GERAIS", "ativo"], ["COMERCIAL BOM PRECO DE ALIMENTOS LTDA", "passivo", true]], area: "Tributário", valor: 96310.55, distribuido: "2025-01-15", grau: "G1", ano: "2025", diasPub: 19 }),
];

// Resultado simulado da "consulta automática" por empresa: o que cada fonte responde (TRF6 indisponível em uma delas).
export const CONSULTA_FONTES = { "27650441": { TRF6: "falha" } };

// ------------------------------------------------------------------ captação
export const ETAPAS = [
  ["novo", "Não contatado", "#9A958D"], ["contato", "Primeiro contato realizado", "#2E86C1"], ["whatsapp", "WhatsApp enviado", "#2E9E62"],
  ["email", "E-mail enviado", "#17A2A2"], ["ligacao", "Ligação realizada", "#5B6BD6"], ["retorno", "Aguardando retorno", "#E28A1E"],
  ["proposta", "Proposta enviada", "#1C3253"], ["negociacao", "Em negociação", "#8A5A7A"], ["fechado", "Cliente", "#2E7552"],
];
export const LISTAS = [
  { id: 1, nome: "Desenquadrados do SN com dívida de ICMS", descricao: "Empresas de MG excluídas do Simples Nacional com débito estadual", criada: diasAtras(64), cor: "#1C3253" },
  { id: 2, nome: "Indústrias com execução fiscal federal", descricao: "Indústrias de MG com inscrição em dívida ativa da União ajuizada", criada: diasAtras(21), cor: "#8A5A7A" },
];

export const PROPOSTAS = [
  { id: 41, numero: "PROP-2026-0041", cnpj: EMPRESAS[0].cnpj, titulo: "Defesa em execução fiscal e parcelamento estadual", etapa: "envio", versao: 2, fixo: 4800, mensal: 890, resp: "Ana Beatriz", enviada: diasAtras(9), validade: diasAFrente(6) },
  { id: 40, numero: "PROP-2026-0040", cnpj: EMPRESAS[1].cnpj, titulo: "Recuperação de créditos de PIS/COFINS", etapa: "previa", versao: 1, fixo: 12000, mensal: 0, resp: "Carlos Menezes", validade: diasAFrente(12) },
  { id: 39, numero: "PROP-2026-0039", cnpj: EMPRESAS[5].cnpj, titulo: "Consultoria tributária mensal", etapa: "aceite", versao: 3, fixo: 6500, mensal: 3200, resp: "Ana Beatriz", enviada: diasAtras(30), aceita: diasAtras(22) },
  { id: 38, numero: "PROP-2026-0038", cnpj: EMPRESAS[6].cnpj, titulo: "Revisão de enquadramento e defesa administrativa", etapa: "rascunho", versao: 1, fixo: 2400, mensal: 0, resp: "Ana Beatriz", validade: diasAFrente(15) },
  { id: 37, numero: "PROP-2026-0037", cnpj: EMPRESAS[8].cnpj, titulo: "Transação tributária na PGFN", etapa: "aceite", versao: 1, fixo: 9800, mensal: 0, resp: "Carlos Menezes", enviada: diasAtras(48), aceita: diasAtras(40) },
  { id: 36, numero: "PROP-2026-0036", cnpj: EMPRESAS[3].cnpj, titulo: "Defesa em execução fiscal estadual", etapa: "recusada", versao: 1, fixo: 5200, mensal: 0, resp: "Ana Beatriz", enviada: diasAtras(52) },
];
export const ETAPA_PROPOSTA = { rascunho: ["Rascunho", "cinza"], revisao: ["Aguardando revisão", "ambar"], previa: ["Pronta para envio", "azul"], envio: ["Enviada", "azul"], aceite: ["Aceita", "verde"], recusada: ["Recusada", "vermelho"] };

// ------------------------------------------------------------------ comunicação
export const CONVERSAS = [
  { id: 1, cnpj: EMPRESAS[0].cnpj, contato: "Helena (sócia)", telefone: "(31) 98877-4410", status: "aberta", naoLidas: 2, optin: true, janela: true, papel: "Cliente",
    mensagens: [["entrada", "Bom dia! Recebi a intimação do processo trabalhista, vocês conseguem ver?", 95], ["saida", "Bom dia, Helena! Já localizamos no CAPTA: audiência marcada. Vou te mandar o resumo.", 80], ["nota", "Cliente prefere contato pela manhã.", 70], ["entrada", "Perfeito. E a proposta do parcelamento?", 20], ["entrada", "Consigo assinar ainda esta semana?", 18]] },
  { id: 2, cnpj: EMPRESAS[1].cnpj, contato: "Marcos (financeiro)", telefone: "(31) 99120-7788", status: "aberta", naoLidas: 0, optin: true, janela: false, papel: "Cliente",
    mensagens: [["saida", "Marcos, segue a proposta de recuperação de créditos para análise.", 2900], ["entrada", "Recebido, vou levar para a diretoria.", 2800]] },
  { id: 3, cnpj: EMPRESAS[4].cnpj, contato: "Fernanda", telefone: "(37) 99812-6060", status: "aberta", naoLidas: 1, optin: false, janela: true, papel: "Lead",
    mensagens: [["saida", "Olá, Fernanda! Somos do escritório e identificamos uma oportunidade de revisão tributária para a ótica.", 400], ["entrada", "Oi! Pode me explicar melhor?", 60]] },
  { id: 4, cnpj: EMPRESAS[8].cnpj, contato: "Antônio Carlos", telefone: "(37) 98100-2244", status: "encerrada", naoLidas: 0, optin: true, janela: false, papel: "Lead",
    mensagens: [["saida", "Antônio, a transação na PGFN foi deferida. Parabéns!", 9000], ["entrada", "Excelente notícia, obrigado!", 8900]] },
];
export const AGENDA = [
  { dia: 0, hora: "09:30", titulo: "Reunião — parcelamento Pão de Serra", tipo: "reuniao", cnpj: EMPRESAS[0].cnpj },
  { dia: 0, hora: "15:00", titulo: "Ligar para Clínica Bem Viver", tipo: "tarefa", cnpj: EMPRESAS[2].cnpj },
  { dia: 1, hora: "10:00", titulo: "Audiência — Vale Verde (TRT3)", tipo: "reuniao", cnpj: EMPRESAS[1].cnpj },
  { dia: 3, hora: "14:00", titulo: "Apresentação Ferro Forte", tipo: "reuniao", cnpj: EMPRESAS[13].cnpj },
  { dia: 6, hora: "11:00", titulo: "Retorno Laticínios Serra da Canastra", tipo: "tarefa", cnpj: EMPRESAS[8].cnpj },
  { dia: -2, hora: "16:00", titulo: "Revisão da proposta Horizonte Azul", tipo: "tarefa", cnpj: EMPRESAS[5].cnpj },
];
export const ALTERACOES = [
  { cnpj: EMPRESAS[3].cnpj, tipo: "divida", titulo: "Nova inscrição estadual (ICMS)", detalhe: "R$ 96.310,55 · lista SEF/MG 09/2026", data: diasAtras(4) },
  { cnpj: EMPRESAS[1].cnpj, tipo: "processo", titulo: "Andamento novo no processo trabalhista", detalhe: "Audiência de conciliação designada · TRT3", data: diasAtras(3) },
  { cnpj: EMPRESAS[0].cnpj, tipo: "regime", titulo: "Saída do Simples Nacional comunicada", detalhe: "Fonte: Receita Federal", data: diasAtras(11) },
  { cnpj: EMPRESAS[13].cnpj, tipo: "divida", titulo: "Inscrição federal ajuizada", detalhe: "PGFN · competência 06/2026", data: diasAtras(15) },
];
export const PUBLICACOES = [
  { id: 1, veiculo: "DJEN · TJMG", data: diasAtras(2), tipo: "Intimação", cnpj: EMPRESAS[0].cnpj, termo: "PANIFICADORA PAO DE SERRA", trecho: "…fica intimada a executada PANIFICADORA PAO DE SERRA LTDA, CNPJ 48.213.907/0001-…, para no prazo de 5 dias…" },
  { id: 2, veiculo: "DOU · Seção 3", data: diasAtras(5), tipo: "Edital", cnpj: EMPRESAS[13].cnpj, termo: "FERRO FORTE", trecho: "…pregão eletrônico — vencedora FERRO FORTE METALURGICA INDUSTRIAL LTDA…" },
];

export const ORGANIZACAO = { escritorio: "Escritório Demonstração Advocacia", responsavel: "Ana Beatriz", papel: "Sócia · Tributário" };
export const RESPONSAVEIS = ["Ana Beatriz", "Carlos Menezes"];
export const HOJE = hojeIso();
