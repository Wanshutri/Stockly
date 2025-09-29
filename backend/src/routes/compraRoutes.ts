import { Router } from 'express';
import { createCompra, getCompras, getCompraById, deleteCompra } from '../controllers/CompraController';
const router = Router();
router.get('/', getCompras);
router.get('/:id', getCompraById);
router.post('/', createCompra);
router.delete('/:id', deleteCompra);
export default router;
