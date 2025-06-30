import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private apiUrl = 'http://localhost:3000/api/admin/brands';

  constructor(private http: HttpClient) {}

  getBrands(options: { [key: string]: any }): Observable<any[]> {
    let params = new HttpParams();
    for (const key in options) {
      if (options[key] !== undefined && options[key] !== null) {
        params = params.set(key, options[key]);
      }
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }
  
  getBrandById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  
  addBrand(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  updateBrand(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  deleteBrand(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}