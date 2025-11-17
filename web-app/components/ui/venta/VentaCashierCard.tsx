import cn from "../../hooks/cn";
/*************************
 * 3) CashierCard (Cajero actual)
 *************************/
export type CashierCardProps = {
  cashierName: string;
  onClearCart?: () => void;
  className?: string;
};

export const CashierCard: React.FC<CashierCardProps> = ({
  cashierName,
  onClearCart,
  className,
}) => {
  return (
    <aside
      className={cn(
        "rounded-2xl bg-neutral-100 p-5 text-neutral-900 shadow-sm",
        "grid gap-3",
        className
      )}
    >
      <div className="text-xl font-extrabold">Cajero:</div>
      <div className="text-lg font-semibold">{cashierName}</div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onClearCart}
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white",
            "hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          )}
        >
          <span className="inline-grid h-5 w-5 place-content-center rounded-full bg-red-700 text-[10px] font-bold">
            ×
          </span>
          Eliminar carrito
        </button>
      </div>
    </aside>
  );
};
