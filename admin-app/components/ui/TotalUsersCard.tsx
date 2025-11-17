"use client";

import GroupIcon from '@mui/icons-material/Group';

interface Props {
  count: number;
  loading?: boolean;
}

export default function TotalUsersCard({ count, loading }: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-blue-100 flex items-center gap-5 border-blue-300">
      <div className="bg-blue-50 p-3 rounded-full">
        <GroupIcon className="w-7 h-7 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Usuarios Totales</p>
        {loading ? (
          <div className="h-8 bg-gray-200 rounded-md w-16 animate-pulse mt-1"></div>
        ) : (
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        )}
      </div>
    </div>
  );
}
