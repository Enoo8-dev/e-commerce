import { Component, OnInit, OnDestroy } from '@angular/core'; // Aggiungi OnDestroy
import { RouterOutlet, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService, User } from './services/auth.service';
import { Subscription } from 'rxjs'; // Importa Subscription
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslateModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateY(0)', opacity: 1 })),
      transition(':enter', [
        style({ transform: 'translateY(-10%)', opacity: 0 }),
        animate('200ms ease-in')
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ transform: 'translateY(-10%)', opacity: 0 }))
      ])
    ])
  ]
})
export class App implements OnInit, OnDestroy {
  isUserLoggedIn: boolean = false;
  user: User | null = null;
  isMobileMenuOpen: boolean = false;
  isLangMenuOpen: boolean = false;
  isCatalogMenuOpen: boolean = false;

  private authSubscription!: Subscription;

  constructor(
    public translate: TranslateService, 
    private authService: AuthService
  ) {
    translate.setDefaultLang('en-US');
    translate.use('en-US');
  }

  ngOnInit(): void {
    const sub1 = this.authService.isLoggedIn$.subscribe(status => this.isUserLoggedIn = status);
    const sub2 = this.authService.currentUser$.subscribe(user => this.user = user);
    
    this.authSubscription = sub1;
    this.authSubscription.add(sub2);
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
    this.authService.logout();
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