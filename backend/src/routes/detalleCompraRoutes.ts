import { Router } from 'express';
import { create_detalle_compra, get_detalle_compra, delete_detalle_compra } from '../controllers/DetalleCompraController';
const router = Router();
router.get('/', get_detalle_compra);
router.post('/', create_detalle_compra);
router.delete('/:sku/:idCompra', delete_detalle_compra);
export default router;
