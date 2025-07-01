import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AttributeService {
  private apiUrl = 'http://localhost:3000/api/admin/attributes';

  constructor(private http: HttpClient) {}

  getAttributes(options: { [key: string]: any }): Observable<any[]> {
    let params = new HttpParams();
    for (const key in options) {
      if (options[key]) {
        params = params.set(key, options[key]);
      }
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getAttributeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getAttributeValueById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/values/${id}`);
  }

  addAttribute(name: string): Observable<any> {
    return this.http.post(this.apiUrl, { name });
  }

  addAttributeValue(attributeId: number, valueData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${attributeId}/values`, valueData);
  }

  updateAttribute(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  updateAttributeValue(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/values/${id}`, data);
  }

  deleteAttribute(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteAttributeValue(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/values/${id}`);
  }
}