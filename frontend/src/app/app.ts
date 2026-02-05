import { Component, OnInit, OnDestroy } from '@angular/core'; // Aggiungi OnDestroy
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model'; 
import { Subscription } from 'rxjs'; // Importa Subscription
import { CommonModule } from '@angular/common';
import { CartService } from './services/cart.service';
import { WishlistService } from './services/wishlist.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslateModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  isUserLoggedIn: boolean = false;
  user: User | null = null;
  isMobileMenuOpen: boolean = false;
  isLangMenuOpen: boolean = false;
  isCatalogMenuOpen: boolean = false;
  cartItemCount: number = 0; 
  wishlistItemCount: number = 0; 

  isDemoMode: boolean = environment.demo || false;
  isLoadingDemo: boolean = false;

  private authSubscription!: Subscription;

  constructor(
    public translate: TranslateService, 
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
  ) {
    translate.setDefaultLang('en-US');
    translate.use('en-US');
  }

  ngOnInit(): void {
    const sub1 = this.authService.isLoggedIn$.subscribe(status => this.isUserLoggedIn = status);
    const sub2 = this.authService.currentUser$.subscribe(user => this.user = user);
    
    
    const wishlistSub = this.wishlistService.wishlist$.subscribe(items => {
      this.wishlistItemCount = items.length;
    });
    
    this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = items.reduce((count, item) => count + item.quantity, 0);
    });

    this.authSubscription = sub1;
    this.authSubscription.add(sub2);
    this.authSubscription.add(wishlistSub);
  }

  onDemoLogin(role: 'customer' | 'admin'): void {
    if (this.isLoadingDemo) return;
    
    this.isLoadingDemo = true;
    // Chiudi menu mobile se aperto
    this.closeAllMenus();

    this.authService.demoLogin(role).subscribe({
      next: () => {
        this.isLoadingDemo = false;
        const target = role === 'admin' ? '/admin/dashboard' : '/';
        this.router.navigate([target]);
      },
      error: (err) => {
        console.error('Demo login error:', err);
        this.isLoadingDemo = false;
        alert('Errore login demo');
      }
    });
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  get userInitials(): string {
    if (!this.user) return '';
    const first = this.user.first_name ? this.user.first_name.charAt(0) : '';
    const last = this.user.last_name ? this.user.last_name.charAt(0) : '';
    return `${first}${last}`.toUpperCase();
  }

  get userFullName(): string {
    if (!this.user) return '';
    const first = this.user.first_name
      ? this.user.first_name.charAt(0).toUpperCase() + this.user.first_name.slice(1)
      : '';
    const last = this.user.last_name
      ? this.user.last_name.charAt(0).toUpperCase() + this.user.last_name.slice(1)
      : '';
    return `${first} ${last}`.trim();
  }
  
  logout(): void {
    this.closeAllMenus();
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  switchLanguage(language: string): void {
    this.translate.use(language);
    this.isLangMenuOpen = false;
  }

  switchAndCloseMenu(language: string): void {
    this.translate.use(language);
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleCatalogMenu(): void {
    this.isCatalogMenuOpen = !this.isCatalogMenuOpen;
  }

  closeAllMenus(): void {
    this.isMobileMenuOpen = false;
    this.isCatalogMenuOpen = false;
  }
}