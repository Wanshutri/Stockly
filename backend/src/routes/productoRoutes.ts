import { Router } from 'express';
import { createProducto, getProductos, getProductoBySku, updateProducto, deleteProducto } from '../controllers/ProductoController';

const router = Router();

router.get('/', getProductos);
router.get('/:sku', getProductoBySku);
router.post('/', createProducto);
router.put('/:sku', updateProducto);
router.delete('/:sku', deleteProducto);

export default router;
