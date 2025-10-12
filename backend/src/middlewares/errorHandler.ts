import { Request, Response, NextFunction } from 'express';

// Interfaz renombrada a snake_case
export interface AppError extends Error {
  status_code?: number; // Propiedad renombrada
}

/**
 * Middleware de manejo centralizado de errores.
 */
export const error_handler = ( // Función renombrada
  error: AppError, // Parámetro de error renombrado
  request: Request, // Parámetro renombrado
  response: Response, // Parámetro renombrado
  _next: NextFunction // Parámetro renombrado e ignorado
) => {
  // Manejo de variables renombradas
  console.error(error);

  // Se usa 'status_code' de la interfaz o 500 por defecto
  const status_code = error.status_code || 500;

  // Se usa 'error.message' o un mensaje genérico por defecto
  const message = error.message || 'Internal Server Error';

  response.status(status_code).json({
    message: message,
    // Opcionalmente, se podría incluir el código de estado para consistencia
    status_code: status_code
  });
};