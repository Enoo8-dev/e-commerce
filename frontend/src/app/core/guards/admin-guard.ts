import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1), // Prende solo il valore corrente e si disiscrive
    map(user => {
      if (user && user.role === 'admin') {
        return true; // Accesso consentito
      } else {
        // Se non è un admin, reindirizza alla home page
        router.navigate(['/']);
        return false; // Accesso negato
      }
    })
  );
};