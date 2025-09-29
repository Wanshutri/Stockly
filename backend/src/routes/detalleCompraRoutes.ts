import { Router } from 'express';
import { createDetalleCompra, getDetalleCompra, deleteDetalleCompra } from '../controllers/DetalleCompraController';
const router = Router();
router.get('/', getDetalleCompra);
router.post('/', createDetalleCompra);
router.delete('/:sku/:idCompra', deleteDetalleCompra);
export default router;
