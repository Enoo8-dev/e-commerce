import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, filter, switchMap, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authCheckCompleted$.pipe(
    filter(completed => completed),
    switchMap(() => authService.isLoggedIn$),
    take(1),
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      } else {
        // Chiama la funzione del servizio per salvare l'URL
        authService.setRedirectUrl(state.url);
        router.navigate(['/login']);
        return false;
      }
    })
  );
};