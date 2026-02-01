import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = environment.apiUrl + '/admin/dashboard';

  constructor(private http: HttpClient) {}

  getStats(lang: string): Observable<any> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<any>(`${this.apiUrl}/stats`, { params });
  }
}