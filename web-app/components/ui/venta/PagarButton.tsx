"use client";
import { useMemo } from "react";

interface PagarButtonProps {
    total?: number;
    montoEfectivo?: number;
    montoTarjeta?: number;
    currency?: string;
    disabled?: boolean;
    onPay?: () => void;
}

export default function PagarButton({
    total = 0,
    montoEfectivo = 0,
    montoTarjeta = 0,
    currency = "CLP",
    disabled = false,
    onPay,
}: PagarButtonProps) {
    // redondeos y seguridad
    const efe: number = Number.isFinite(Number(montoEfectivo)) ? Math.round(Number(montoEfectivo)) : 0;
    const tar: number = Number.isFinite(Number(montoTarjeta)) ? Math.round(Number(montoTarjeta)) : 0;
    const ttl: number = Number.isFinite(Number(total)) ? Math.round(Number(total)) : 0;

    const suma = useMemo<number>(() => efe + tar, [efe, tar]);
    const isExact: boolean = ttl > 0 && suma === ttl;
    const isOver: boolean = suma > ttl;
    const faltante = useMemo<number>(() => Math.max(0, ttl - suma), [ttl, suma]);

    const handleClick = (): void => {
        if (disabled) return;
        if (!isExact) return;
        if (typeof onPay === "function") onPay();
    };

    const fmt = (n: number): string => new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(n);

    return (
        <div className="w-full">
            {/* Información pequeña encima del botón (opcional) */}
            <div className="mb-3 text-sm text-neutral-700">
                <div className="mt-1">
                    Ingresado: <strong>{fmt(suma)} {currency}</strong>
                    {isExact && <span className="ml-2 text-green-600 font-medium">✔ coincide</span>}
                    {isOver && <span className="ml-2 text-red-600 font-medium">✖ excede ({fmt(suma - ttl)})</span>}
                    {faltante > 0 && (
                       <span className="ml-2 text-yellow-700 font-medium">• Falta: {fmt(faltante)} {currency}</span>
                   )}
                </div>
            </div>

            {/* Botón grande */}
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled || !isExact}
                className={`w-full py-8 rounded-2xl shadow-md text-white text-3xl font-bold transition-all
          ${disabled || !isExact ? "bg-green-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 active:scale-[0.995]"}`}
            >
                PAGAR
            </button>
        </div>
    );
}