import { Injectable, Injector } from '@angular/core'; // 1. Importa Injector
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router'; // Importiamo ancora il TIPO Router

// L'interfaccia User rimane la stessa
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  // 2. Invece del Router, ora iniettiamo l'Injector
  constructor(private http: HttpClient, private injector: Injector) {
    this.loadUserFromToken();
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      // Usiamo un try-catch per sicurezza nel caso fetchUserProfile fallisca
      this.fetchUserProfile().subscribe({
        error: () => this.logoutCleanup() // Se il token non è valido, pulisci
      });
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }),
      switchMap(() => this.fetchUserProfile()),
      catchError(error => {
        this.logoutCleanup();
        return throwError(() => error);
      })
    );
  }

  fetchUserProfile(): Observable<User> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<User>(`${this.apiUrl}/users/me`, { headers }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  // Funzione di pulizia interna che non reindirizza
  private logoutCleanup(): void {
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  logout(): void {
    // 3. Otteniamo il Router "pigramente" solo quando serve, rompendo il ciclo
    const router = this.injector.get(Router);
    this.logoutCleanup();
    router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}
