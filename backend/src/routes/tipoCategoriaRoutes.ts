import { Router } from 'express';
import { createTipoCategoria, getTipoCategorias, getTipoCategoriaById, updateTipoCategoria, deleteTipoCategoria } from '../controllers/TipoCategoriaController';
const router = Router();
router.get('/', getTipoCategorias);
router.get('/:id', getTipoCategoriaById);
router.post('/', createTipoCategoria);
router.put('/:id', updateTipoCategoria);
router.delete('/:id', deleteTipoCategoria);
export default router;
