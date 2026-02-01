import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.apiUrl + '/users';

  constructor(private http: HttpClient) {}

  getUsers(options: { [key: string]: any }): Observable<any[]> {
    let params = new HttpParams();
    for (const key in options) {
      if (options[key]) {
        params = params.set(key, options[key]);
      }
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }
  createAdmin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin`, data);
  }
  updateUserStatus(id: number, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { isActive });
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  changePassword(passwords: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, passwords);
  }
}
