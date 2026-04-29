// =====================================================================
// types/process.ts — versão Fase 1
// =====================================================================
// Mudanças:
// - 'categoria' deixou de ser exposta (mantida só para compat. de leitura)
// - Cada instância agora tem: numero, classe, tribunal, orgao_julgador,
//   telefone, sistema_acesso (apenas 1ª inst.)
// - 'observacoes' (texto livre) substituiu o uso confuso de 'status'
// =====================================================================

export type Competencia = 'Estadual' | 'Federal' | 'Trabalhista' | 'Administrativo';
export type Relevancia = 'relevante' | 'acompanhamento';
export type FaseAtual = 'PRIMEIRA_INSTANCIA' | 'SEGUNDA_INSTANCIA' | 'TRIBUNAL_SUPERIOR';
export type ClienteEscritorio = 'Autor' | 'Réu';

// Mantido por compatibilidade (componentes antigos ainda importam).
// Internamente o sistema usa 'relevancia' agora.
export type Categoria = 'Relevante' | 'Mero Acompanhamento';

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
  estado: string;
  competencia: Competencia;
  relevancia: Relevancia;
  autor: string;
  reu?: string;
  clienteEscritorio: ClienteEscritorio;
  grupoId?: string;
  grupoNome?: string;
  faseAtual: FaseAtual;

  primeiraInstanciaNumero: string;
  primeiraInstanciaClasse: string | null;
  primeiraInstanciaTribunal: string | null;
  primeiraInstanciaOrgaoJulgador: string | null;
  primeiraInstanciaComarca: string | null;
  primeiraInstanciaTelefone: string | null;
  sistemaAcesso: string | null;

  segundaInstanciaNumero: string | null;
  segundaInstanciaClasse: string | null;
  segundaInstanciaTribunal: string | null;
  segundaInstanciaOrgaoJulgador: string | null;
  segundaInstanciaTelefone: string | null;

  tribunalSuperiorNome: 'STJ' | 'STF' | null;
  tribunalSuperiorNumero: string | null;
  tribunalSuperiorClasse: string | null;
  tribunalSuperiorOrgaoJulgador: string | null;
  tribunalSuperiorTelefone: string | null;

  senhaAcesso: string;
  ultimaMovimentacao: string;
  observacoes: string;

  documentos: Documento[];
  criadoEm: string;
  atualizadoEm: string;

  numero: string;
  categoria?: string;
  tipoAcao?: string;
  varaCamaraTurma?: string;
  telefoneSecretaria?: string;
  telefoneAssessoria?: string;
  primeiraInstanciaVara?: string | null;
  segundaInstanciaTipoRecurso?: string | null;
  segundaInstanciaTurmaCamara?: string | null;
  tribunalSuperiorTurma?: string | null;
  status?: string;
  ultimaMovimentacaoLegacy?: string;
}

export const COMPETENCIAS: Competencia[] = ['Estadual', 'Federal', 'Trabalhista', 'Administrativo'];

export const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const SISTEMAS_ACESSO = ['PJe', 'e-SAJ', 'Projudi', 'SEI', 'e-Proc', 'Projudi-MS', 'SAJ', 'Outro'];

export const TRIBUNAIS_SUPERIORES = ['STJ', 'STF'] as const;

export const TIPOS_RECURSO = [
  'Apelação',
  'Agravo de Instrumento',
  'Embargos de Declaração',
  'Incidente de Arguição de Inconstitucionalidade Cível',
  'Precatório',
  'RPV',
];

export const TIPOS_DOCUMENTO: Documento['tipo'][] = [
  'Petição', 'Decisão', 'Sentença', 'Acórdão', 'Cálculo', 'Documento Estratégico', 'Outro',
];

export const PASTAS_DOCUMENTO = [
  'Petição Inicial', 'Contestação', 'Réplica', 'Decisões', 'Sentenças', 'Acórdãos', 'Cálculos', 'Outros',
];

export const FASE_LABELS: Record<FaseAtual, string> = {
  PRIMEIRA_INSTANCIA: '1ª Instância',
  SEGUNDA_INSTANCIA: '2ª Instância',
  TRIBUNAL_SUPERIOR: 'Tribunal Superior',
};

export function getClienteName(p: Processo): string {
  return p.clienteEscritorio === 'Autor' ? p.autor : (p.reu || '');
}

export function getParteContraria(p: Processo): string {
  return p.clienteEscritorio === 'Autor' ? (p.reu || '') : p.autor;
}

export function getNumeroFaseAtual(p: Processo): string {
  switch (p.faseAtual) {
    case 'TRIBUNAL_SUPERIOR':
      return p.tribunalSuperiorNumero || p.primeiraInstanciaNumero || p.numero || '';
    case 'SEGUNDA_INSTANCIA':
      return p.segundaInstanciaNumero || p.primeiraInstanciaNumero || p.numero || '';
    default:
      return p.primeiraInstanciaNumero || p.numero || '';
  }
}

export function getTodosNumeros(p: Processo): string[] {
  return [
    p.primeiraInstanciaNumero,
    p.segundaInstanciaNumero,
    p.tribunalSuperiorNumero,
    p.numero,
  ].filter((n): n is string => !!n && n.trim() !== '');
}
