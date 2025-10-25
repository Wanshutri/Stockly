import Image from "next/image";

export default function StocklyPhotoDetail({ src, alt = "Foto del producto" }: { src?: string; alt?: string }) {
  const placeholder =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>` +
      `<rect width='200' height='200' fill='lightgray'/>` +
      `<g fill='gray'>` +
      `<circle cx='65' cy='70' r='12'/>` +
      `<path d='M30 150 L90 100 L125 130 L155 110 L180 150 Z'/>` +
      `</g>` +
      `</svg>`
    );


  const finalSrc = src && src.trim().length > 0 ? src : placeholder;


  return (
    <div className="rounded-xl bg-white border border-gray-300 p-3 flex items-center justify-center">
      <Image src={finalSrc} alt={alt} width={320} height={240} className="rounded-lg object-contain w-full h-auto max-h-72" />
    </div>
  );
}