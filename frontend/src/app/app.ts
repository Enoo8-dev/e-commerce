import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
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

export class App {
  isUserLoggedIn: boolean = false;
  isMobileMenuOpen: boolean = false;
  isLangMenuOpen: boolean = false;

  // update soon to be replaced with a real user service
  user = {
    firstName: 'Mario',
    lastName: 'Rossi'
  };

  get userInitials(): string {
    const first = this.user.firstName ? this.user.firstName.charAt(0) : '';
    const last = this.user.lastName ? this.user.lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase();
  }

  get userFullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`.trim();
  }

  constructor(public translate: TranslateService) {
    // default language
    translate.setDefaultLang('en-US');
    // set the current language to English
    translate.use('en-US');
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  // Method to switch the language dynamically
  switchLanguage(language: string): void {
    this.translate.use(language);
    this.isLangMenuOpen = false; // close the language menu after selection
  }

  switchAndCloseMenu(language: string): void {
    this.translate.use(language);
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    // Logic to handle user logout
    this.isUserLoggedIn = false;
    console.log('User logged out');
  }
}
