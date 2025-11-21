import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
  FilterPropertiesDto,
  PropertyInsights,
  GeographicHotspot,
} from '../models/property.model';
import { PaginatedResponse } from '../models/lead.model';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private readonly apiUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  getProperties(
    filters?: FilterPropertiesDto,
  ): Observable<PaginatedResponse<Property>> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Property>>(this.apiUrl, {
      params,
    });
  }

  getPropertyById(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  getLeadInsights(leadId: string): Observable<PropertyInsights> {
    return this.http.get<PropertyInsights>(
      `${this.apiUrl}/lead/${leadId}/insights`,
    );
  }

  getHotspots(
    minProperties = 1,
  ): Observable<GeographicHotspot[]> {
    const params = new HttpParams().set(
      'minProperties',
      minProperties.toString(),
    );

    return this.http.get<GeographicHotspot[]>(
      `${this.apiUrl}/analytics/hotspots`,
      { params },
    );
  }

  createProperty(dto: CreatePropertyDto): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, dto);
  }

  updateProperty(
    id: string,
    dto: UpdatePropertyDto,
  ): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/${id}`, dto);
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
