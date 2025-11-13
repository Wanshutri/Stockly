import cn from "../hooks/cn";
/*************************
 * Shared helpers
 *************************/
const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

/*************************
* 4) TableFooterSummary (Subtotal, Descuento, IVA, Total)
*************************/
export type TableFooterSummaryProps = {
  subtotal: number;
  discount: number; // absolute value (not percentage)
  tax: number; // IVA absolute value
  total: number;
  currency?: string; // default CLP
  className?: string;
};

export const TableFooterSummary: React.FC<TableFooterSummaryProps> = ({
  subtotal,
  discount,
  tax,
  total,
  currency = "CLP",
  className,
}) => {
  const fmt = currencyFormatter(currency);
  return (
    <div
      className={cn(
        "rounded-b-2xl border-t border-neutral-200 bg-white px-4 py-3",
        "grid grid-cols-12 items-center gap-2 text-sm text-neutral-900",
        className
      )}
    >
      <div className="col-span-6 grid grid-cols-3 gap-4">
        <div className="font-semibold">Sub total {fmt.format(subtotal)}</div>
        <div className="font-semibold">Descuento {fmt.format(discount)}</div>
        <div className="font-semibold">I.V.A. {fmt.format(tax)}</div>
      </div>
      <div className="col-span-6">
        <div className="flex items-center justify-end gap-4 rounded-xl bg-neutral-900 px-4 py-2 text-white">
          <span className="text-lg font-extrabold">Total</span>
          <span className="text-xl font-black tracking-wide">
            {fmt.format(total)}
            <span className="ml-1 text-sm font-bold">{currency}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
