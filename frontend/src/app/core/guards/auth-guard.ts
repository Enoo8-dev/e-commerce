import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1), // Prende solo il valore corrente e si disiscrive
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true; // Accesso consentito, l'utente può procedere
      } else {
        // Se l'utente non è loggato, reindirizza alla pagina di login
        router.navigate(['/login']);
        return false; // Accesso negato
      }
    })
  );
};