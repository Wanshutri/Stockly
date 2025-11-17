"use client";
import { useState } from "react";

interface VentasPagosCardProps {
  onEfectivoChange?: (monto: number) => void;
  onTarjetaChange?: (monto: number) => void;
}


export default function PagosCard({ onEfectivoChange, onTarjetaChange }: VentasPagosCardProps) {
  const [efectivo, setEfectivo] = useState("");
  const [tarjeta, setTarjeta] = useState("");

  const handleEfectivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEfectivo(value);
    onEfectivoChange?.(Number(value) || 0);
  };

  const handleTarjetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTarjeta(value);
    onTarjetaChange?.(Number(value) || 0);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ----- EFECTIVO ----- */}
      <div className="bg-blue-500 text-white p-4 rounded-2xl shadow-md flex justify-start items-center">
        <div className="flex flex-col">
          <span className="text-sm">$ PAGAR EFECTIVO</span>

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">$</span>

            <input
              type="number"
              min="0"
              className="text-3xl bg-transparent font-bold flex-1 outline-none text-white"
              placeholder="0"
              value={efectivo}
              onChange={handleEfectivoChange}
            />

            <span className="text-xl ml-auto">CLP</span>
          </div>
        </div>

        <div className="text-xl font-bold ml-auto">$</div>
      </div>

      {/* ----- TARJETA ----- */}
      <div className="bg-orange-500 text-white p-4 rounded-2xl shadow-md flex justify-start items-center">
        <div className="flex flex-col ">
          <span className="text-sm">$ PAGAR TARJETA</span>

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">$</span>

            <input
              type="number"
              min="0"
              className="text-3xl bg-transparent font-bold flex-1 outline-none text-white"
              placeholder="0"
              value={tarjeta}
              onChange={handleTarjetaChange}
            />

            <span className="text-xl ml-auto">CLP</span>
          </div>
        </div>

        <div className="text-xl font-bold ml-auto">$</div>
      </div>
    </div>
  );
}