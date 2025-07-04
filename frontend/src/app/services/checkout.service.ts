import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private apiUrl = 'http://localhost:3000/api/addresses';

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  addAddress(address: any): Observable<any> {
    return this.http.post(this.apiUrl, address);
  }
  updateAddress(id: number, address: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, address);
  }
  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  setDefaultAddress(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/default`, {});
  }
}