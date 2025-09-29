import { Router } from 'express';
import { createCliente, deleteCliente, getClienteByEmail, getClienteById, getClientes, updateCliente } from '../controllers/ClienteController';

const router = Router();

router.get('/', getClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);
router.post('/email', getClienteByEmail);

export default router;