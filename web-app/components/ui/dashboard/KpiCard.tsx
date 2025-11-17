interface KpiCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: any;
    color: "blue" | "green" | "purple" | "amber";
}

export default function KpiCard({ title, value, subtitle, icon, color}: KpiCardProps) {
    const colorMap = {
        blue: {
            iconBg: "bg-sky-100",
            iconColor: "text-sky-700",
            ring: "ring-sky-200",
        },
        green: {
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-700",
            ring: "ring-emerald-200",
        },
        purple: {
            iconBg: "bg-fuchsia-100",
            iconColor: "text-fuchsia-700",
            ring: "ring-fuchsia-200",
        },
        amber: {
            iconBg: "bg-amber-100",
            iconColor: "text-amber-700",
            ring: "ring-amber-200",
        },
    };

    const { iconBg, iconColor, ring } = colorMap[color];

    return (
        <div
            className={`shadow-md p-5 rounded-2xl bg-white border border-gray-100 h-full flex flex-col justify-between ring-1 ${ring} transition-transform hover:-translate-y-0.5 hover:shadow-lg`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className={`p-3 rounded-2xl ${iconBg} ${iconColor}`}>{icon}</div>
                <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] text-right">
                    {title}
                </h3>
            </div>
            <div className="mt-4">
                <p className="text-3xl font-extrabold text-gray-900 mb-1 truncate">
                    {value}
                </p>
                <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
        </div>
    );
}