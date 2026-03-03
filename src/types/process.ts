export type Competencia = 'Estadual' | 'Federal' | 'Trabalhista' | 'Administrativo';
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
}

export const COMPETENCIAS: Competencia[] = ['Estadual', 'Federal', 'Trabalhista', 'Administrativo'];
export const CATEGORIAS: Categoria[] = ['Relevante', 'Mero Acompanhamento'];

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

export function getClienteName(p: Processo): string {
  return p.clienteEscritorio === 'Autor' ? p.autor : (p.reu || '');
}
