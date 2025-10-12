import { Router } from 'express';
import { create_compra, get_compras, get_compra_by_id, delete_compra } from '../controllers/CompraController';
const router = Router();
router.get('/', get_compras);
router.get('/:id', get_compra_by_id);
router.post('/', create_compra);
router.delete('/:id', delete_compra);
export default router;
