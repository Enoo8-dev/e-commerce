import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/admin/dashboard';

  constructor(private http: HttpClient) {}

  getStats(lang: string): Observable<any> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<any>(`${this.apiUrl}/stats`, { params });
  }
}