import { Router } from 'express';
import { create_tipo_usuario, delete_tipo_usuario, get_tipo_usuario_by_id, get_tipo_usuarios, update_tipo_usuario } from '../controllers/TipoUsuarioController';
const router = Router();
router.get('/', get_tipo_usuarios);
router.get('/:id', get_tipo_usuario_by_id);
router.post('/', create_tipo_usuario);
router.put('/:id', update_tipo_usuario);
router.delete('/:id', delete_tipo_usuario);
export default router;
