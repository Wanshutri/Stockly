import { Router } from 'express';
import { createPago, getPagos, getPagoById, deletePago } from '../controllers/PagoController';
const router = Router();
router.get('/', getPagos);
router.get('/:id', getPagoById);
router.post('/', createPago);
router.delete('/:id', deletePago);
export default router;
