import { Router } from 'express';
import { create_marca, get_marcas, get_marca_by_id, update_marca, delete_marca } from '../controllers/MarcaController';
const router = Router();
router.get('/', get_marcas);
router.get('/:id', get_marca_by_id);
router.post('/', create_marca);
router.put('/:id', update_marca);
router.delete('/:id', delete_marca);
export default router;
