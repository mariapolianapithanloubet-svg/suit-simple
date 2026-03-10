export type Competencia = 'Estadual' | 'Federal' | 'Trabalhista' | 'Administrativo';
export type Categoria = 'Relevante' | 'Mero Acompanhamento';
export type FaseAtual = 'PRIMEIRA_INSTANCIA' | 'SEGUNDA_INSTANCIA' | 'TRIBUNAL_SUPERIOR';

export interface Grupo {
  id: string;
  nome: string;
}

export interface Documento {
  id: string;
  nome: string;
  tipo: 'Petição' | 'Decisão' | 'Sentença' | 'Acórdão' | 'Cálculo' | 'Documento Estratégico' | 'Outro';
  pasta: string;
  observacao?: string;
  dataUpload: string;
  arquivoUrl?: string;
  arquivoPath?: string;
  arquivo?: File;
}

export interface Processo {
  id: string;
  numero: string;
  tipoAcao: string;
  estado: string;
  competencia: Competencia;
  categoria: Categoria;
  autor: string;
  reu?: string;
  clienteEscritorio: 'Autor' | 'Réu';
  varaCamaraTurma: string;
  sistemaAcesso: string;
  telefoneSecretaria: string;
  telefoneAssessoria: string;
  senhaAcesso: string;
  status: string;
  ultimaMovimentacao: string;
  grupoId?: string;
  grupoNome?: string;
  documentos: Documento[];
  criadoEm: string;
  atualizadoEm: string;
  // Multi-instance fields
  tribunalPrimeiraInstancia: string | null;
  primeiraInstanciaNumero: string | null;
  primeiraInstanciaVara: string | null;
  primeiraInstanciaComarca: string | null;
  segundaInstanciaTipoRecurso: string | null;
  segundaInstanciaNumero: string | null;
  segundaInstanciaTurmaCamara: string | null;
  segundaInstanciaTribunal: string | null;
  tribunalSuperiorNome: string | null;
  tribunalSuperiorNumero: string | null;
  tribunalSuperiorTurma: string | null;
  faseAtual: FaseAtual;
  relevancia: string;
}

export const COMPETENCIAS: Competencia[] = ['Estadual', 'Federal', 'Trabalhista', 'Administrativo'];
// CATEGORIAS now loaded from DB via useAdminTables

export const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const SISTEMAS_ACESSO = ['PJe', 'e-SAJ', 'Projudi', 'SEI', 'e-Proc', 'Outro'];

export const TIPOS_DOCUMENTO: Documento['tipo'][] = [
  'Petição', 'Decisão', 'Sentença', 'Acórdão', 'Cálculo', 'Documento Estratégico', 'Outro'
];

export const PASTAS_DOCUMENTO = [
  'Petição Inicial', 'Contestação', 'Réplica', 'Decisões', 'Sentenças', 'Acórdãos', 'Cálculos', 'Outros'
];

export const TIPOS_RECURSO = [
  'Apelação',
  'Agravo de Instrumento',
  'Embargos de Declaração',
  'Incidente de Arguição de Inconstitucionalidade Cível',
  'Precatório',
  'RPV',
];

export const TRIBUNAIS_SUPERIORES = ['STJ', 'STF'];

// TIPOS_VINCULO now loaded from DB via useAdminTables

export function getClienteName(p: Processo): string {
  return p.clienteEscritorio === 'Autor' ? p.autor : (p.reu || '');
}
