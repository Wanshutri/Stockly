import { Router } from 'express';
import { createMarca, getMarcas, getMarcaById, updateMarca, deleteMarca } from '../controllers/MarcaController';
const router = Router();
router.get('/', getMarcas);
router.get('/:id', getMarcaById);
router.post('/', createMarca);
router.put('/:id', updateMarca);
router.delete('/:id', deleteMarca);
export default router;
