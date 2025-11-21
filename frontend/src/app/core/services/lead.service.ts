import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  UpdateLeadStatusDto,
  FilterLeadsDto,
  PaginatedResponse,
  LeadSummary,
  LeadComment,
  CreateLeadCommentDto,
} from '../models/lead.model';

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private readonly apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  getLeads(filters?: FilterLeadsDto): Observable<PaginatedResponse<Lead>> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Lead>>(this.apiUrl, { params });
  }

  getLeadById(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/${id}`);
  }

  getLeadSummary(id: string): Observable<LeadSummary> {
    return this.http.get<LeadSummary>(`${this.apiUrl}/${id}/summary`);
  }

  getPrioritarios(
    page = 1,
    limit = 10,
  ): Observable<PaginatedResponse<Lead>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<Lead>>(
      `${this.apiUrl}/prioritarios`,
      { params },
    );
  }

  createLead(dto: CreateLeadDto): Observable<Lead> {
    return this.http.post<Lead>(this.apiUrl, dto);
  }

  updateLead(id: string, dto: UpdateLeadDto): Observable<Lead> {
    return this.http.patch<Lead>(`${this.apiUrl}/${id}`, dto);
  }

  updateLeadStatus(
    id: string,
    dto: UpdateLeadStatusDto,
  ): Observable<Lead> {
    return this.http.patch<Lead>(`${this.apiUrl}/${id}/status`, dto);
  }

  deleteLead(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getComments(
    leadId: string,
    page = 1,
    limit = 10,
  ): Observable<PaginatedResponse<LeadComment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<LeadComment>>(
      `${this.apiUrl}/${leadId}/comments`,
      { params },
    );
  }

  addComment(
    leadId: string,
    dto: CreateLeadCommentDto,
  ): Observable<LeadComment> {
    return this.http.post<LeadComment>(
      `${this.apiUrl}/${leadId}/comments`,
      dto,
    );
  }
}
