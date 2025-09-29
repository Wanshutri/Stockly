import express from 'express';
import clienteRoutes from './routes/clienteRoutes';
import productoRoutes from './routes/productoRoutes';
import marcaRoutes from './routes/marcaRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import tipoCategoriaRoutes from './routes/tipoCategoriaRoutes';
import tipoUsuarioRoutes from './routes/tipoUsuarioRoutes';
import tipoDocumentoRoutes from './routes/tipoDocumentoRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

// default route for health check
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

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;