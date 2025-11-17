"use client";

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface Props {
  count: number;
  loading?: boolean;
}

export default function ActiveUsersCard({ count, loading }: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-5 border-green-500">
      <div className="bg-green-50 p-3 rounded-full">
        <CheckCircleOutlineIcon className="w-7 h-7 text-green-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Usuarios Activos</p>
        {loading ? (
          <div className="h-8 bg-gray-200 rounded-md w-16 animate-pulse mt-1"></div>
        ) : (
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        )}
      </div>
    </div>
  );
}
