export type Esfera = 'Estadual' | 'Federal' | 'Trabalhista' | 'Administrativo';
export type Categoria = 'Relevante' | 'Mero Acompanhamento';
export type SemaphoreStatus = 'green' | 'yellow' | 'red';

export interface Documento {
  id: string;
  nome: string;
  tipo: 'Petição' | 'Decisão' | 'Sentença' | 'Acórdão' | 'Cálculo' | 'Documento Estratégico' | 'Outro';
  observacao?: string;
  dataUpload: string;
  arquivo?: File;
}

export interface Processo {
  id: string;
  // Identificação
  numero: string;
  tipoAcao: string;
  estado: string;
  esfera: Esfera;
  categoria: Categoria;
  // Partes
  autor: string;
  reu: string;
  clienteEscritorio: 'Autor' | 'Réu';
  // Tramitação
  varaCamaraTurma: string;
  sistemaAcesso: string;
  telefoneSecretaria: string;
  // Controle Interno
  senhaAcesso: string;
  status: string;
  ultimaMovimentacao: string;
  dataUltimoAcompanhamento: string;
  // Execução
  valorExecucao?: number;
  dataBaseCalculo?: string;
  // Documentos
  documentos: Documento[];
  // Meta
  criadoEm: string;
  atualizadoEm: string;
}

export const ESFERAS: Esfera[] = ['Estadual', 'Federal', 'Trabalhista', 'Administrativo'];
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

export function getSemaphoreStatus(dataUltimoAcompanhamento: string): SemaphoreStatus {
  if (!dataUltimoAcompanhamento) return 'red';
  const last = new Date(dataUltimoAcompanhamento);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 15) return 'green';
  if (diffDays <= 45) return 'yellow';
  return 'red';
}

export function getClienteName(p: Processo): string {
  return p.clienteEscritorio === 'Autor' ? p.autor : p.reu;
}
