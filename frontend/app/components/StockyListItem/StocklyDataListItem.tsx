import Link from "next/link";

export default function StocklyDataListItem({
    cells,
    selected = false,
}: {
    cells: React.ReactNode[];
    selected?: boolean;
}) {
    return (
        <div
            role="button"
            className={`relative grid items-center cursor-pointer transition-colors ${selected ? "bg-gray-50 ring-1 ring-gray-200" : "bg-white hover:bg-gray-50"
                }`}
            style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
        >
            <span
                aria-hidden
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full transition-colors ${selected ? "bg-gray-900" : "bg-transparent group-hover:bg-gray-300"
                    }`}
            />
            {cells.map((cell, i) => (
                <Link href={`/bodega/${cells[0]}`} key={i}>
                    <div key={i} className="px-4 py-3 text-sm text-gray-800">
                        {cell}
                    </div>
                </Link>
            ))}
        </div>
    );
}