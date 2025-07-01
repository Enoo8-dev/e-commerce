import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = 'http://localhost:3000/api/admin/categories';

  constructor(private http: HttpClient) {}

  getCategories(options: { [key: string]: any }): Observable<any[]> {
    let params = new HttpParams();
    for (const key in options) {
      if (options[key]) {
        params = params.set(key, options[key]);
      }
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }
  getCategoryById(id: number, lang: string): Observable<any> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<any>(`${this.apiUrl}/${id}`, { params });
  }
  addCategory(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}