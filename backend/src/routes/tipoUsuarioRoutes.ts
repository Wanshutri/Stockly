import { Router } from 'express';
import { createTipoUsuario, getTipoUsuarios, getTipoUsuarioById, updateTipoUsuario, deleteTipoUsuario } from '../controllers/TipoUsuarioController';
const router = Router();
router.get('/', getTipoUsuarios);
router.get('/:id', getTipoUsuarioById);
router.post('/', createTipoUsuario);
router.put('/:id', updateTipoUsuario);
router.delete('/:id', deleteTipoUsuario);
export default router;
