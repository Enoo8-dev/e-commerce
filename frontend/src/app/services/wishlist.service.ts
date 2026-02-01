import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { TranslateService } from '@ngx-translate/core';
import { CartItem } from '../models/cart-item.model'; // Corretto il nome del file
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WishlistService implements OnDestroy {
  private apiUrl = environment.apiUrl + '/wishlist';
  private wishlistSubject = new BehaviorSubject<CartItem[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();
  
  private authSub!: Subscription;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.fetchWishlist().subscribe();
      } else {
        this.wishlistSubject.next([]);
      }
    });
  }

  fetchWishlist(): Observable<any[]> {
    const lang = this.translate.currentLang || this.translate.defaultLang;
    const params = new HttpParams().set('lang', lang);
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      tap(items => {
        this.wishlistSubject.next(items);
      })
    );
  }

  addToWishlist(variantId: number): Observable<any> {
    return this.http.post(this.apiUrl, { variantId }).pipe(
      tap(() => {
        this.fetchWishlist().subscribe();
      })
    );
  }

  removeFromWishlist(variantId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${variantId}`).pipe(
      tap(() => {
        const currentItems = this.wishlistSubject.getValue();
        const updatedItems = currentItems.filter(item => item.variantId !== variantId);
        this.wishlistSubject.next(updatedItems);
      })
    );
  }

  isInWishlist(variantId: number): boolean {
    return this.wishlistSubject.getValue().some(item => item.variantId === variantId);
  }
  
  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}