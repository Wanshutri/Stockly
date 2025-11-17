"use client";

import SecurityIcon from '@mui/icons-material/Security';

interface Props {
  count?: number;
}

export default function RolesCard({ count = 3 }: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-purple-100 flex items-center gap-5 shadow-none
            transition-all duration-200 transform border-purple-300">
      <div className="bg-purple-100 p-3 rounded-full">
        <SecurityIcon className="w-7 h-7 text-purple-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Roles Definidos</p>
        <p className="text-3xl font-bold text-gray-900">{count}</p>
      </div>
    </div>
  );
}
