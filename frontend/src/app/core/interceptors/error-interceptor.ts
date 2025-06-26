import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se riceviamo un errore 401 (Unauthorized)...
      if (error.status === 401) {
        // ...eseguiamo il logout per pulire lo stato e reindirizzare al login.
        console.error('Unauthorized request, logging out.', error);
        authService.logout();
      }
      // Rilancia l'errore per farlo gestire dal componente che ha fatto la chiamata
      return throwError(() => error);
    })
  );
};
