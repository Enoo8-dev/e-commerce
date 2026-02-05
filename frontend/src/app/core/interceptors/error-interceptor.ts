import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

declare var Toastify: any;

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

      if (error.status === 403) {
        const msg = error.error?.message || 'Operazione non consentita in modalità DEMO.';
        
        Toastify({
          text: msg,
          duration: 4000,
          gravity: "top", // "top" or "bottom"
          position: "center", // "left", "center" or "right"
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: "#ff0000",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "12px 20px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          }
        }).showToast();
      }
      // Rilancia l'errore per farlo gestire dal componente che ha fatto la chiamata
      return throwError(() => error);
    })
  );
};
