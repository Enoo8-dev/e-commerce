import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

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

    constructor(private http: HttpClient, private router: Router) {
        this.loadUserFromToken();
    }

    private loadUserFromToken(): void {
        const token = this.getToken();
        if (token) {
            this.fetchUserProfile().subscribe();
        }
    }

    login(credentials: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
            tap(response => {
                if (response && response.token) {
                    localStorage.setItem('authToken', response.token);
                }
            }),
            switchMap(() => this.fetchUserProfile())
        );
    }

    fetchUserProfile(): Observable<User | null> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
        return this.http.get<User>(`${this.apiUrl}/users/me`, { headers }).pipe(
            tap(user => {
                this.currentUserSubject.next(user);
                this.isLoggedInSubject.next(true);
            }),
            catchError(error => {
                this.logout();
                return throwError(() => error);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('authToken');
        this.currentUserSubject.next(null);
        this.isLoggedInSubject.next(false);
        this.router.navigate(['/']);
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }
}