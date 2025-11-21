import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  status: 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'ganho' | 'perdido';
  origin: 'indicacao' | 'feira' | 'site' | 'telefone' | 'whatsapp' | 'rede_social' | 'visita_campo' | 'outros';
  segment: 'pequeno' | 'medio' | 'grande';
  city: string;
  state: string;
  totalAreaHectares: number;
  mainCrops: string[];
  isPrioritario: boolean;
  priorityScore: number;
  assignedTo?: string;
  lastContactAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  status?: 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'ganho' | 'perdido';
  origin?: 'indicacao' | 'feira' | 'site' | 'telefone' | 'whatsapp' | 'rede_social' | 'visita_campo' | 'outros';
  segment?: 'pequeno' | 'medio' | 'grande';
  city?: string;
  state?: string;
  assignedTo?: string;
}

export interface UpdateLeadDto {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  origin?: 'indicacao' | 'feira' | 'site' | 'telefone' | 'whatsapp' | 'rede_social' | 'visita_campo' | 'outros';
  segment?: 'pequeno' | 'medio' | 'grande';
  city?: string;
  state?: string;
  assignedTo?: string;
}

export interface UpdateLeadStatusDto {
  status: 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'ganho' | 'perdido';
}

export interface LeadComment {
  id: string;
  leadId: string;
  comment: string;
  author?: string;
  leadStatusAtTime: string;
  createdAt: Date;
}

export interface CreateLeadCommentDto {
  comment: string;
  author?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: string;
  city?: string;
  state?: string;
  origin?: string;
  segment?: string;
  isPrioritario?: boolean;
  assignedTo?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  private apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  create(createLeadDto: CreateLeadDto): Observable<Lead> {
    return this.http.post<Lead>(this.apiUrl, createLeadDto);
  }

  findAll(filters?: LeadFilters): Observable<PaginatedResponse<Lead>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof LeadFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this.http.get<PaginatedResponse<Lead>>(this.apiUrl, { params });
  }

  findOne(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/${id}`);
  }

  update(id: string, updateLeadDto: UpdateLeadDto): Observable<Lead> {
    return this.http.patch<Lead>(`${this.apiUrl}/${id}`, updateLeadDto);
  }

  updateStatus(id: string, updateStatusDto: UpdateLeadStatusDto): Observable<Lead> {
    return this.http.patch<Lead>(`${this.apiUrl}/${id}/status`, updateStatusDto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addComment(id: string, commentDto: CreateLeadCommentDto): Observable<LeadComment> {
    return this.http.post<LeadComment>(`${this.apiUrl}/${id}/comments`, commentDto);
  }

  getComments(id: string, page = 1, limit = 10): Observable<PaginatedResponse<LeadComment>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    
    return this.http.get<PaginatedResponse<LeadComment>>(`${this.apiUrl}/${id}/comments`, { params });
  }

  findPrioritarios(page = 1, limit = 10): Observable<PaginatedResponse<Lead>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    
    return this.http.get<PaginatedResponse<Lead>>(`${this.apiUrl}/prioritarios`, { params });
  }
}
