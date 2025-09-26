import express from 'express';
import clienteRoutes from './routes/clienteRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

// Routes
app.use('/api/clientes', clienteRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;