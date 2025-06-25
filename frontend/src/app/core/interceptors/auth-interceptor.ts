import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getToken();

  // Se l'utente è loggato (cioè se esiste un token)...
  if (authToken) {
    // ...clona la richiesta in uscita e aggiungi l'header 'Authorization'.
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    // Invia la richiesta modificata.
    return next(authReq);
  }

  // Se non c'è un token, invia la richiesta così com'è.
  return next(req);
};
