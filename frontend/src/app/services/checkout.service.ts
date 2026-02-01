import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private addressUrl = environment.apiUrl + '/addresses';
  private paymentApiUrl = environment.apiUrl + '/payment-methods';

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<any[]> {
    return this.http.get<any[]>(this.addressUrl);
  }
  addAddress(address: any): Observable<any> {
    return this.http.post(this.addressUrl, address);
  }
  updateAddress(id: number, address: any): Observable<any> {
    return this.http.put(`${this.addressUrl}/${id}`, address);
  }
  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.addressUrl}/${id}`);
  }
  setDefaultAddress(id: number): Observable<any> {
    return this.http.patch(`${this.addressUrl}/${id}/default`, {});
  }
  getPaymentMethods(): Observable<any[]> {
    return this.http.get<any[]>(this.paymentApiUrl);
  }
  addPaymentMethod(cardData: any): Observable<any> {
    return this.http.post(this.paymentApiUrl, cardData);
  }
  updatePaymentMethod(id: number, cardData: any): Observable<any> {
    return this.http.put(`${this.paymentApiUrl}/${id}`, cardData);
  }
  deletePaymentMethod(id: number): Observable<any> {
    return this.http.delete(`${this.paymentApiUrl}/${id}`);
  }
  setDefaultPaymentMethod(id: number): Observable<any> {
    return this.http.patch(`${this.paymentApiUrl}/${id}/default`, {});
  }
}