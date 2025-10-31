import express from 'express';
import cors from 'cors';

import clienteRoutes from './routes/clienteRoutes';
import productoRoutes from './routes/productoRoutes';
import marcaRoutes from './routes/marcaRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import tipoCategoriaRoutes from './routes/tipoCategoriaRoutes';
import tipoUsuarioRoutes from './routes/tipoUsuarioRoutes';
import tipoDocumentoRoutes from './routes/tipoDocumentoRoutes';
import { error_handler } from './middlewares/errorHandler';
import config from './config/config';

const app = express();

// --- CORS solo en desarrollo ---
if (config.nodeEnv === 'development') {
  app.use(
    cors({
      origin: ['http://localhost:3000'], // frontend local
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );
  console.log('CORS habilitado para desarrollo');
}

app.use(express.json());

// Default route (health check)
app.get('/api', (_req, res) => {
  res.status(200).send('API is running...');
});

// Routes
app.use('/api/clientes', clienteRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/categorias', tipoCategoriaRoutes);
app.use('/api/tipos-usuario', tipoUsuarioRoutes);
app.use('/api/tipos-documento', tipoDocumentoRoutes);

// Global error handler
app.use(error_handler);

export default app;
