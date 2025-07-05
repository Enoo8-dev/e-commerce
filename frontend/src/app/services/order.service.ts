import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/orders';
  constructor(private http: HttpClient) {}
  createOrder(orderData: any): Observable<any> {
    return this.http.post(this.apiUrl, orderData);
  }
}