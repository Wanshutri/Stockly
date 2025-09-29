import { Router } from 'express';
import { createTipoDocumento, getTipoDocumentos, getTipoDocumentoById, updateTipoDocumento, deleteTipoDocumento } from '../controllers/TipoDocumentoTributarioController';
const router = Router();
router.get('/', getTipoDocumentos);
router.get('/:id', getTipoDocumentoById);
router.post('/', createTipoDocumento);
router.put('/:id', updateTipoDocumento);
router.delete('/:id', deleteTipoDocumento);
export default router;
