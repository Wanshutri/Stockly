'use client';

import dynamic from 'next/dynamic';
import { FunctionComponent, useEffect, useState, useRef } from 'react';

// Importa el componente solo en el cliente
const Barcode = dynamic(() => import('react-barcode'), { ssr: false });

interface StocklyBarCodeProps {
  value: string;
  maxWidth?: number;  // ancho máximo opcional
  maxHeight?: number; // alto máximo opcional
}

export const StocklyBarCode: FunctionComponent<StocklyBarCodeProps> = ({
  value,
  maxWidth = 400,
  maxHeight = 120,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = Math.min(containerRef.current.offsetWidth, maxWidth);
      const containerHeight = Math.min(containerRef.current.offsetHeight || maxHeight, maxHeight);

      // Ajusta ancho de cada barra según el ancho del contenedor y la longitud del valor
      const newWidth = Math.max(containerWidth / (value.length * 20), 1);
      setWidth(newWidth);

      // Ajusta altura proporcional, respetando maxHeight
      setHeight(containerHeight);
    }
  }, [value, maxWidth, maxHeight]);

  return (
    <div ref={containerRef}>
      <Barcode
        value={value}
        width={width}      // ancho dinámico
        height={height}    // alto dinámico
        displayValue={true}
        fontSize={16}
      />
    </div>
  );
};
