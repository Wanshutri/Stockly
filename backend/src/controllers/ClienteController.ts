import { Request, Response, NextFunction } from 'express';
import { clientes, Cliente } from '../models/Cliente';

// Create a new cliente
export const createCliente = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nombre, email, telefono } = req.body;

        if (!nombre || !email || telefono === undefined) {
            res.status(400).json({ message: 'nombre, email y telefono son obligatorios' });
            return;
        }

        const telefonoNum = Number(telefono);
        if (Number.isNaN(telefonoNum)) {
            res.status(400).json({ message: 'telefono debe ser un número' });
            return;
        }

        const newCliente: Cliente = {
            id: Date.now(),
            nombre,
            email,
            telefono: telefonoNum,
        };

        clientes.push(newCliente);
        res.status(201).json(newCliente);
    } catch (error) {
        next(error);
    }
};

// Get all clientes
export const getClientes = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(clientes);
    } catch (error) {
        next(error);
    }
};

// Get cliente by id
export const getClienteById = (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            res.status(400).json({ message: 'id inválido' });
            return;
        }

        const cliente = clientes.find((c) => c.id === id);
        if (!cliente) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }
        res.json(cliente);
    } catch (error) {
        next(error);
    }
};

// Update cliente
export const updateCliente = (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            res.status(400).json({ message: 'id inválido' });
            return;
        }

        const { nombre, email, telefono } = req.body;
        const clienteIndex = clientes.findIndex((c) => c.id === id);
        if (clienteIndex === -1) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }

        // Update only provided fields
        if (nombre !== undefined) clientes[clienteIndex].nombre = nombre;
        if (email !== undefined) clientes[clienteIndex].email = email;
        if (telefono !== undefined) {
            const telefonoNum = Number(telefono);
            if (Number.isNaN(telefonoNum)) {
                res.status(400).json({ message: 'telefono debe ser un número' });
                return;
            }
            clientes[clienteIndex].telefono = telefonoNum;
        }

        res.json(clientes[clienteIndex]);
    } catch (error) {
        next(error);
    }
};

// Delete cliente
export const deleteCliente = (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            res.status(400).json({ message: 'id inválido' });
            return;
        }

        const index = clientes.findIndex((c) => c.id === id);
        if (index === -1) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }

        const deleted = clientes.splice(index, 1)[0];
        res.json(deleted);
    } catch (error) {
        next(error);
    }
};