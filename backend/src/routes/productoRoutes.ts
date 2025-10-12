import { Router } from 'express';
import { create_producto, get_productos, get_producto_by_sku, update_producto, delete_producto } from '../controllers/ProductoController';

const router = Router();

router.get('/', get_productos);
router.get('/:sku', get_producto_by_sku);
router.post('/', create_producto);
router.put('/:sku', update_producto);
router.delete('/:sku', delete_producto);

export default router;
