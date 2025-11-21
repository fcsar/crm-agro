import { LeadStatus, LeadOrigin, LeadSegment } from './enums';

export interface Lead {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  city?: string;
  state: string;
  status: LeadStatus;
  origin?: LeadOrigin;
  segment?: LeadSegment;
  assignedTo?: string;
  priorityScore: number;
  isPrioritario: boolean;
  totalAreaHectares?: number;
  mainCrops?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;
}

export interface CreateLeadDto {
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  city?: string;
  state?: string;
  status?: LeadStatus;
  origin?: LeadOrigin;
  segment?: LeadSegment;
  assignedTo?: string;
  notes?: string;
}

export interface UpdateLeadDto {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  origin?: LeadOrigin;
  assignedTo?: string;
  notes?: string;
}

export interface UpdateLeadStatusDto {
  status: LeadStatus;
}

export interface FilterLeadsDto {
  status?: LeadStatus;
  city?: string;
  state?: string;
  origin?: LeadOrigin;
  segment?: LeadSegment;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadSummary extends Lead {
  totalProperties: number;
  averageAreaPerProperty: number;
  cropDistribution: Record<string, number>;
}

export interface LeadComment {
  id: string;
  leadId: string;
  message: string;
  author?: string;
  leadStatusAtTime?: LeadStatus;
  createdAt: Date;
}

export interface CreateLeadCommentDto {
  message: string;
  author?: string;
}
