import { Router } from 'express';
import { create_pago, get_pagos, get_pago_by_id, delete_pago } from '../controllers/PagoController';
const router = Router();
router.get('/', get_pagos);
router.get('/:id', get_pago_by_id);
router.post('/', create_pago);
router.delete('/:id', delete_pago);
export default router;
