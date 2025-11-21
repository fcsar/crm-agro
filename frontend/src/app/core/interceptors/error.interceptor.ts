import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro inesperado';
      let errorDetails: string[] = [];

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Dados inválidos';
            if (error.error?.errors && Array.isArray(error.error.errors)) {
              errorDetails = error.error.errors.flatMap((e: any) => e.errors || []);
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
            break;
          case 404:
            errorMessage = 'Recurso não encontrado';
            if (error.error?.message) {
              errorMessage = error.error.message;
            }
            break;
          case 409:
            errorMessage = 'Conflito - O registro já existe';
            if (error.error?.message) {
              errorMessage = error.error.message;
            }
            break;
          case 500:
            errorMessage = 'Erro interno do servidor';
            if (error.error?.message) {
              errorMessage = error.error.message;
            }
            break;
          case 0:
            errorMessage = 'Sem conexão com o servidor';
            break;
          default:
            errorMessage = error.error?.message || `Erro ${error.status}: ${error.statusText}`;
        }
      }

      messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: errorMessage,
        life: 5000
      });

      if (errorDetails.length > 0) {
        errorDetails.forEach((detail, index) => {
          setTimeout(() => {
            messageService.add({
              severity: 'warn',
              summary: 'Validação',
              detail: detail,
              life: 4000
            });
          }, (index + 1) * 200);
        });
      }

      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};
