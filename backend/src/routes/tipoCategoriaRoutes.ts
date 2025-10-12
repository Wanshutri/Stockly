import { Router } from 'express';
import { create_tipo_categoria, get_tipo_categorias, get_tipo_categoria_by_id, update_tipo_categoria, delete_tipo_categoria } from '../controllers/TipoCategoriaController';
const router = Router();
router.get('/', get_tipo_categorias);
router.get('/:id', get_tipo_categoria_by_id);
router.post('/', create_tipo_categoria);
router.put('/:id', update_tipo_categoria);
router.delete('/:id', delete_tipo_categoria);
export default router;
