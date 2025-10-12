import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

export interface AuthRequest extends Request {
    user?: any; // Aunque esta propiedad es expuesta externamente, se mantiene aquí por convención de Express, pero se usará 'request.user' internamente
}

/**
 * Middleware para autenticar un token JWT en el encabezado 'Authorization'.
 */
export const authenticate = (request: AuthRequest, response: Response, next: NextFunction) => { // Función y parámetros renombrados
    // Encabezados renombrados
    const auth_header = request.headers['authorization'] || request.headers['Authorization']; // Variable renombrada
    
    if (!auth_header || typeof auth_header !== 'string') {
        return response.status(401).json({ message: 'No token provided' });
    }

    const parts = auth_header.split(' ');
    
    // Verificación de formato 'Bearer <token>'
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return response.status(401).json({ message: 'Invalid Authorization header' });
    }
    
    const token = parts[1];
    
    try {
        // La clave secreta de la configuración asumo que se llama 'jwt_secret'
        const payload = jwt.verify(token, config.jwt_secret); // Variable renombrada (asumiendo que 'config' fue refactorizado)
        
        // Se mantiene 'user' en la interfaz, pero el uso es consistente con la estructura
        request.user = payload; 
        
        next();
    } catch (error) { // Variable de error renombrada
        return response.status(401).json({ message: 'Invalid token' });
    }
};