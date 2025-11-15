import cn from "../hooks/cn";

/*************************
 * Shared helpers
 *************************/
const currencyFormatter = (currency?: string) => {
  if (!currency) {
    return new Intl.NumberFormat("es-CL", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
};

/*************************
 * 1) BigActionCard (Azul grande $PAGAR)
 *************************/
export type BigActionCardProps = {
  label: string; // e.g., "$ PAGAR"
  amount?: number | string; // amount in currency unit
  currency?: string; // e.g., "CLP"
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  color: string; // e.g., an icon button bottom-right
};

export const BigActionCard: React.FC<BigActionCardProps> = ({
  label,
  amount,
  currency = "CLP",
  onClick,
  disabled,
  className,
  icon,
  color
}) => {
  const fmt = currencyFormatter(currency);
  const hasTextAmount = typeof amount === "string";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative grid h-64 w-full place-content-start rounded-2xl p-5 text-left",
        `bg-${color}-500 text-white shadow-lg transition-transform duration-150 ease-out hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-${color}-300"`,
        className
      )}
      aria-label={label}
    >
      <div className="text-sm font-semibold opacity-90 tracking-wide">{label}</div>
      {typeof amount === "number" && (
        <div className="mt-1 text-3xl font-extrabold leading-tight">
          {fmt.format(amount)}
          {currency && (
            <span className="ml-1 align-middle text-base font-bold">{currency}</span>
          )}
        </div>
      )}

      {typeof amount === "string" && (
        <div className="mt-1 text-3xl font-extrabold leading-tight">
          {amount}
        </div>
      )}

      {/* Corner icon slot */}
      <div className="pointer-events-none absolute bottom-4 right-4">

        <div className="pointer-events-none grid h-9 w-11 place-content-center rounded-lg">
          <div className="h-5 w-5 rounded-[4px]">{icon}</div>
        </div>

      </div>
    </button>
  );
};
