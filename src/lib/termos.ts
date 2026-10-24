// As questões do MIT estão em inglês: a busca em português também procura os termos equivalentes.
// Chave e valores já normalizados (minúsculo, sem acento); os valores são radicais em inglês.
const TERMOS: Record<string, string[]> = {
  elasticidade: ['elastic'], elastica: ['elastic'], inelastica: ['inelastic'],
  demanda: ['demand'], oferta: ['supply'], preco: ['price'], precos: ['price'], quantidade: ['quantit'],
  equilibrio: ['equilibri'], mercado: ['market'], mercados: ['market'],
  custo: ['cost'], custos: ['cost'], marginal: ['marginal'], medio: ['average'], fixo: ['fixed'], variavel: ['variab'],
  receita: ['revenue'], lucro: ['profit'], lucros: ['profit'], prejuizo: ['loss'],
  utilidade: ['utilit'], preferencia: ['preferen'], preferencias: ['preferen'], indiferenca: ['indifferen'],
  orcamento: ['budget'], orcamentaria: ['budget'], renda: ['income'], salario: ['wage'], salarios: ['wage'],
  consumidor: ['consumer'], consumidores: ['consumer'], produtor: ['producer'], firma: ['firm'], firmas: ['firm'], empresa: ['firm', 'compan'],
  excedente: ['surplus'], bemestar: ['welfare'], peso: ['deadweight'], imposto: ['tax'], impostos: ['tax'], subsidio: ['subsid'],
  tarifa: ['tariff'], cota: ['quota'], monopolio: ['monopol'], oligopolio: ['oligopol'], concorrencia: ['competit'],
  competitivo: ['competit'], competicao: ['competit'], cartel: ['cartel'], conluio: ['collu'], discriminacao: ['discriminat'],
  jogo: ['game'], jogos: ['game'], estrategia: ['strateg'], dominante: ['dominant'], nash: ['nash'],
  producao: ['produc'], funcao: ['function'], fator: ['factor'], fatores: ['factor'], trabalho: ['labor', 'labour', 'work'],
  capital: ['capital'], tecnologia: ['technolog'], retornos: ['return'], escala: ['scale'], isoquanta: ['isoquant'],
  externalidade: ['externalit'], externalidades: ['externalit'], publico: ['public'], poluicao: ['pollut'],
  incerteza: ['uncertain'], risco: ['risk'], seguro: ['insur'], esperada: ['expected'], esperado: ['expected'], loteria: ['lotter'],
  informacao: ['informat'], assimetrica: ['asymmetric'], selecao: ['selection'], adversa: ['adverse'], moral: ['moral'], leilao: ['auction'], leiloes: ['auction'],
  juros: ['interest'], taxa: ['rate'], poupanca: ['saving'], investimento: ['invest'], consumo: ['consum'], intertemporal: ['intertemporal'],
  desconto: ['discount'], valor: ['value'], presente: ['present'], inflacao: ['inflat'], moeda: ['money', 'currenc'], dinheiro: ['money'],
  desemprego: ['unemploy'], emprego: ['employ'], crescimento: ['growth'], pib: ['gdp'], produtividade: ['productivit'],
  comercio: ['trade'], exportacao: ['export'], importacao: ['import'], cambio: ['exchange'], vantagem: ['advantage'], comparativa: ['comparative'],
  regressao: ['regress'], estimador: ['estimat'], estimativa: ['estimat'], variancia: ['varian'], media: ['mean', 'average'],
  probabilidade: ['probab'], distribuicao: ['distribut'], normal: ['normal'], amostra: ['sample'], hipotese: ['hypothes'], teste: ['test'],
  intervalo: ['interval'], confianca: ['confiden'], correlacao: ['correlat'], covariancia: ['covarian'], aleatoria: ['random'], aleatorio: ['random'],
  independente: ['independen'], condicional: ['conditional'], vies: ['bias'], consistente: ['consisten'], causal: ['causal'],
  derivada: ['derivative'], derivadas: ['derivative'], integral: ['integral'], limite: ['limit'], maximo: ['maxim'], minimo: ['minim'],
  otimizacao: ['optimi'], restricao: ['constrain'], lagrange: ['lagrang'], multiplicador: ['multiplier'], gradiente: ['gradient'],
  matriz: ['matri'], matrizes: ['matri'], vetor: ['vector'], vetores: ['vector'], determinante: ['determinant'], autovalor: ['eigenvalue'],
  serie: ['series'], series: ['series'], taylor: ['taylor'], convexa: ['convex'], concava: ['concav'], parcial: ['partial'],
  verdadeiro: ['true'], falso: ['false'], grafico: ['graph', 'diagram'], curva: ['curve'], inclinacao: ['slope'],
};

// Variantes aceitas para cada palavra da busca (a própria palavra e os termos em inglês)
export function variantes(palavra: string): string[] {
  return [palavra, ...(TERMOS[palavra] || [])];
}
