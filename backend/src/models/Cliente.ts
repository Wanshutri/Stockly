export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: number;
}

export let clientes: Cliente[] = [];