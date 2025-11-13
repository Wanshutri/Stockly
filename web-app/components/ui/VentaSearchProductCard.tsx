import { useEffect, useRef } from "react";
import cn from "../hooks/cn";

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

/*************************
 * 2) SearchProductCard (Botón/Panel "Buscar producto")
 *************************/
export type SearchProductResult = {
  sku: string;
  name: string;
  price: number;
  stock: number;
};

export type SearchProductCardProps = {
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: () => void;
  onSelectResult?: (product: SearchProductResult) => void;
  results?: SearchProductResult[];
  loading?: boolean;
  error?: string | null;
  hasSearched?: boolean;
  className?: string;
};

export const SearchProductCard: React.FC<SearchProductCardProps> = ({
  placeholder = "Buscar producto",
  value,
  onChange,
  onSearch,
  onSelectResult,
  results = [],
  loading,
  error,
  hasSearched = false,
  className,
}) => {
  const hasQuery = Boolean(value?.trim());
  const showResultsPanel =
    hasQuery && (loading || error || results.length > 0 || hasSearched);

  const searchCallbackRef = useRef(onSearch);
  useEffect(() => {
    searchCallbackRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (!searchCallbackRef.current || !hasQuery) return;
    const timeoutId = setTimeout(() => searchCallbackRef.current?.(), 1000);
    return () => clearTimeout(timeoutId);
  }, [hasQuery, value]);

  return (
    <div
      className={cn(
        "rounded-2xl bg-neutral-100 p-5 shadow-sm",
        "grid gap-4",
        className
      )}
      role="search"
      aria-label="Buscar producto"
    >
      <label className="text-sm font-semibold text-neutral-700">
        Buscar producto
      </label>
      <div className="flex gap-2">
        <input
          className={cn(
            "flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          )}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSearch?.();
            }
          }}
        />
        <button
          type="button"
          onClick={onSearch}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
            "bg-neutral-900 text-white shadow hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          )}
        >
          {/* Simple magnifying glass */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Buscar
        </button>
      </div>

      {showResultsPanel && (
        <div className="rounded-xl border border-neutral-200 bg-white">
          {loading && (
            <p className="px-3 py-2 text-sm text-neutral-500">Buscando…</p>
          )}

          {!loading && error && (
            <p className="px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && hasSearched && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-neutral-500">
              No se encontraron productos.
            </p>
          )}

          {!loading && !error && results.length > 0 && (
            <ul className="max-h-64 divide-y divide-neutral-100 overflow-y-auto">
              {results.map((product) => (
                <li key={product.sku}>
                  <button
                    type="button"
                    onClick={() => onSelectResult?.(product)}
                    className={cn(
                      "w-full px-3 py-2 text-left",
                      "hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          SKU: {product.sku} · Stock: {product.stock}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-neutral-900">
                        {currencyFormatter.format(product.price)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
