import React from "react";

/**
* SmallButton
* Props: label, icon, active, onClick
*/
export default function StocklySmallButton({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer
${active ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-900 hover:bg-gray-300"}`}
    >
      <span className="inline-flex items-center justify-center h-5 w-5">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}