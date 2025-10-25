export default function StocklyDataList({
  columns,
  children,
}: React.PropsWithChildren<{ columns: string[] }>) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((c) => (
            <div
              key={c}
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              {c}
            </div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}