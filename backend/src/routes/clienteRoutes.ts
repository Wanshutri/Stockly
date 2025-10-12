import { Router } from 'express';
import { create_cliente, delete_cliente, get_cliente_by_email, get_cliente_by_id, get_clientes, update_cliente } from '../controllers/ClienteController';

const router = Router();

router.get('/', get_clientes);
router.get('/:id', get_cliente_by_id);
router.post('/', create_cliente);
router.put('/:id', update_cliente);
router.delete('/:id', delete_cliente);
router.post('/email', get_cliente_by_email);

export default router;