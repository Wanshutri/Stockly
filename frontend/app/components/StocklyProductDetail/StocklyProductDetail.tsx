import { Edit, Trash2 } from "lucide-react";

export default function StocklyProductDetail({
  fields,
  onEdit,
  onDelete,
}: {
  fields: { label: string; value: React.ReactNode }[];
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="w-full rounded-xl border border-gray-300 bg-white p-4 flex items-start justify-between gap-4">
      <div className="text-sm leading-6 text-gray-900">
        {fields.map((f) => (
          <div key={f.label} className="flex flex-wrap gap-x-2">
            <span className="font-semibold">{f.label}:</span>
            <span className="text-gray-700">{f.value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-800 text-white px-3 py-2 text-sm hover:bg-gray-700"
        >
          <Edit className="h-4 w-4" /> Modificar
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 text-white px-3 py-2 text-sm hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4" /> Eliminar
        </button>
      </div>
    </div>
  );
}