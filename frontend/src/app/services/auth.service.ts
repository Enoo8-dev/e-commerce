import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CartService } from './cart.service';
import { User } from '../models/user.model'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  public isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(
    map(user => !!user)
  );

  // Per rompere la dipendenza circolare, dichiariamo le variabili qui
  private http!: HttpClient;
  private router!: Router;
  private cartService!: CartService;

  constructor(private injector: Injector) {
    setTimeout(() => this.loadUserFromToken(), 0);
  }

  // Funzione helper per ottenere HttpClient "pigramente"
  private getHttpClient(): HttpClient {
    if (!this.http) {
      this.http = this.injector.get(HttpClient);
    }
    return this.http;
  }

  // Funzione helper per ottenere il Router "pigramente"
  private getRouter(): Router {
    if (!this.router) {
      this.router = this.injector.get(Router);
    }
    return this.router;
  }

  private getCartService(): CartService { 
    if (!this.cartService) 
      this.cartService = this.injector.get(CartService); 
    
    return this.cartService; 
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      this.fetchUserProfile().subscribe({
        error: (err) => {
          console.error("Token validation failed on startup. Cleaning up.", err);
          this.logoutCleanup();
        }
      });
    }
  }

  login(credentials: any): Observable<User> {
    this.getCartService().clearCart();
    return this.getHttpClient().post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => localStorage.setItem('authToken', response.token)),
      switchMap(() => this.fetchUserProfile()),
      tap(() => this.getRouter().navigateByUrl('/')),
      catchError(error => {
        this.logoutCleanup();
        return throwError(() => error);
      })
    );
  }

  fetchUserProfile(): Observable<User> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.getHttpClient().get<User>(`${this.apiUrl}/users/me`, { headers }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  private logoutCleanup(): void {
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.getCartService().clearCart(); // Clear cart on logout
  }

  logout(): void {
    this.logoutCleanup();
    this.getRouter().navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  register(userData: any): Observable<any> {
    return this.getHttpClient().post(`${this.apiUrl}/auth/register`, userData);
  }
}