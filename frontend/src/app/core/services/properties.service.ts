import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Property {
  id: string;
  leadId: string;
  crop: 'soja' | 'milho' | 'algodao';
  areaHectares: number;
  agronomicScore: number;
  city: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyDto {
  leadId: string;
  crop: 'soja' | 'milho' | 'algodao';
  areaHectares: number;
  city: string;
  state: string;
}

export interface UpdatePropertyDto {
  crop?: 'soja' | 'milho' | 'algodao';
  areaHectares?: number;
  city?: string;
  state?: string;
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

export interface PropertyFilters {
  page?: number;
  limit?: number;
  leadId?: string;
  crop?: 'soja' | 'milho' | 'algodao';
  city?: string;
  state?: string;
}

export interface LeadInsights {
  leadId: string;
  totalProperties: number;
  totalArea: number;
  totalAgronomicScore: number;
  isPriority: boolean;
  cropMix: Array<{
    crop: string;
    totalArea: number;
    totalProperties: number;
    percentage: number;
  }>;
  mainCrop: string;
  dataQualityAlerts: string[];
  actionSuggestions: string[];
  cropSeasonInsight: string;
  expansionPotential: boolean;
  cities: string[];
}

export interface GeographicHotspot {
  city: string;
  state: string;
  count: number;
  totalArea: number;
}

@Injectable({
  providedIn: 'root'
})
export class PropertiesService {
  private apiUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  create(createPropertyDto: CreatePropertyDto): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, createPropertyDto);
  }

  findAll(filters?: PropertyFilters): Observable<PaginatedResponse<Property>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof PropertyFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this.http.get<PaginatedResponse<Property>>(this.apiUrl, { params });
  }

  findOne(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  update(id: string, updatePropertyDto: UpdatePropertyDto): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/${id}`, updatePropertyDto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getLeadInsights(leadId: string): Observable<LeadInsights> {
    return this.http.get<LeadInsights>(`${this.apiUrl}/lead/${leadId}/insights`);
  }

  getHotspots(): Observable<GeographicHotspot[]> {
    return this.http.get<GeographicHotspot[]>(`${this.apiUrl}/analytics/hotspots`);
  }
}
