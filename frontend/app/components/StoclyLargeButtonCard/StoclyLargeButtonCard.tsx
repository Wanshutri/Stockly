export default function StoclyLargeButtonCard({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl bg-gray-200 p-4 mb-4 hover:bg-gray-300 transition shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold leading-tight">{title}</div>
        </div>
        <div className="h-9 w-9 rounded-full bg-white/80 flex items-center justify-center shadow">
          {icon}
        </div>
      </div>
    </button>
  );
}
