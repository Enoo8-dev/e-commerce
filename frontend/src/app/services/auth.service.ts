import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, of, throwError } from 'rxjs';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CartService } from './cart.service';
import { User } from '../models/user.model'; 
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  public isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(
    map(user => !!user)
  );

  public isAdmin$: Observable<boolean> = this.currentUser$.pipe(
    map(user => !!user && user.role === 'admin')
  );

  // Per rompere la dipendenza circolare, dichiariamo le variabili qui
  private http!: HttpClient;
  private router!: Router;
  private cartService!: CartService;

  private authCheckCompleted = new BehaviorSubject<boolean>(false);
  public authCheckCompleted$ = this.authCheckCompleted.asObservable();

  private redirectUrl: string | null = null;

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
    if (!token) {
      // Se non c'è token, il controllo è immediatamente completato.
      this.authCheckCompleted.next(true);
      return;
    }

    // Se c'è un token, proviamo a validarlo.
    this.fetchUserProfile().pipe(
      // finalize() viene eseguito sia in caso di successo che di errore.
      finalize(() => this.authCheckCompleted.next(true))
    ).subscribe({
      error: (err) => {
        console.error("Token validation failed on startup. Cleaning up.", err);
        this.logoutCleanup();
      }
    });
  }

  login(credentials: any): Observable<User> {
    this.getCartService().clearCart();
    return this.getHttpClient().post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }),
      switchMap(() => this.fetchUserProfile()),
      tap(() => {
        // La logica di redirect ora usa la variabile interna
        const url = this.redirectUrl || '/';
        this.redirectUrl = null; // Pulisci l'URL dopo averlo usato
        this.getRouter().navigateByUrl(url);
      }),
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

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }
}