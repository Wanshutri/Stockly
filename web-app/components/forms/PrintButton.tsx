"use client";

export default function PrintButton() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <button
            onClick={handlePrint}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 hover:border-sky-600 active:bg-sky-200 transition-colors shadow-sm"
        >
            <span className="text-base">📄</span>
            <span>Exportar a PDF</span>
        </button>
    );
}
