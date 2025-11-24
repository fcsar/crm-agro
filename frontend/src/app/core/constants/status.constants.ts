export const LEAD_STATUS = {
  NOVO: 'novo',
  CONTATADO: 'contatado',
  QUALIFICADO: 'qualificado',
  PROPOSTA: 'proposta',
  NEGOCIACAO: 'negociacao',
  GANHO: 'ganho',
  PERDIDO: 'perdido',
} as const;

export type LeadStatus = typeof LEAD_STATUS[keyof typeof LEAD_STATUS];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  [LEAD_STATUS.NOVO]: 'Novo',
  [LEAD_STATUS.CONTATADO]: 'Contatado',
  [LEAD_STATUS.QUALIFICADO]: 'Qualificado',
  [LEAD_STATUS.PROPOSTA]: 'Proposta',
  [LEAD_STATUS.NEGOCIACAO]: 'Negociação',
  [LEAD_STATUS.GANHO]: 'Ganho',
  [LEAD_STATUS.PERDIDO]: 'Perdido',
};

export const STATUS_SEVERITIES: Record<LeadStatus, string> = {
  [LEAD_STATUS.NOVO]: 'info',
  [LEAD_STATUS.CONTATADO]: 'secondary',
  [LEAD_STATUS.QUALIFICADO]: 'warning',
  [LEAD_STATUS.PROPOSTA]: 'info',
  [LEAD_STATUS.NEGOCIACAO]: 'warning',
  [LEAD_STATUS.GANHO]: 'success',
  [LEAD_STATUS.PERDIDO]: 'danger',
};

export const STATUS_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: STATUS_LABELS[LEAD_STATUS.NOVO], value: LEAD_STATUS.NOVO },
  { label: STATUS_LABELS[LEAD_STATUS.CONTATADO], value: LEAD_STATUS.CONTATADO },
  { label: STATUS_LABELS[LEAD_STATUS.QUALIFICADO], value: LEAD_STATUS.QUALIFICADO },
  { label: STATUS_LABELS[LEAD_STATUS.PROPOSTA], value: LEAD_STATUS.PROPOSTA },
  { label: STATUS_LABELS[LEAD_STATUS.NEGOCIACAO], value: LEAD_STATUS.NEGOCIACAO },
  { label: STATUS_LABELS[LEAD_STATUS.GANHO], value: LEAD_STATUS.GANHO },
  { label: STATUS_LABELS[LEAD_STATUS.PERDIDO], value: LEAD_STATUS.PERDIDO },
];
