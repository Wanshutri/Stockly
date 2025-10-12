import { Router } from 'express';
import { create_tipo_documento, get_tipo_documentos, get_tipo_documento_by_id, update_tipo_documento, delete_tipo_documento } from '../controllers/TipoDocumentoTributarioController';
const router = Router();
router.get('/', get_tipo_documentos);
router.get('/:id', get_tipo_documento_by_id);
router.post('/', create_tipo_documento);
router.put('/:id', update_tipo_documento);
router.delete('/:id', delete_tipo_documento);
export default router;
