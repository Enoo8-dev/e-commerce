import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = environment.apiUrl + '/orders';

  constructor(private http: HttpClient) {}

  createOrder(orderData: any): Observable<any> {
    return this.http.post(this.apiUrl, orderData);
  }

  getOrder(id: string, lang: string): Observable<any> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<any>(`${this.apiUrl}/${id}`, { params });
  }

  getMyOrders(lang: string): Observable<any[]> {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<any[]>(`${this.apiUrl}/my-orders`, { params });
  }
}