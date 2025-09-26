import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/Client';

// Create
export const createCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, email, telefono } = req.body;
    if (!nombre || !email || telefono === undefined) {
      return res.status(400).json({ message: 'nombre, email y telefono son obligatorios' });
    }
    const telefonoNum = Number(telefono);
    if (Number.isNaN(telefonoNum)) return res.status(400).json({ message: 'telefono debe ser un número' });

    const cliente = await prisma.cliente.create({
      data: { nombre, email, telefono: telefonoNum }
    });
    return res.status(201).json(cliente);
  } catch (err: any) {
    if (err.code === 'P2002') { // unique constraint failed
      return res.status(409).json({ message: 'email ya registrado' });
    }
    next(err);
  }
};

// Get all
export const getClientes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clientes = await prisma.cliente.findMany();
    res.json(clientes);
  } catch (err) {
    next(err);
  }
};

// Get by id
export const getClienteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
};

// Update
export const updateCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const { nombre, email, telefono } = req.body;
    const data: any = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (email !== undefined) data.email = email;
    if (telefono !== undefined) {
      const telefonoNum = Number(telefono);
      if (Number.isNaN(telefonoNum)) return res.status(400).json({ message: 'telefono debe ser un número' });
      data.telefono = telefonoNum;
    }

    const updated = await prisma.cliente.update({
      where: { id },
      data
    });
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Cliente no encontrado' });
    if (err.code === 'P2002') return res.status(409).json({ message: 'email ya registrado' });
    next(err);
  }
};

// Delete
export const deleteCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const deleted = await prisma.cliente.delete({ where: { id } });
    res.json(deleted);
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Cliente no encontrado' });
    next(err);
  }
};