import Link from "next/link";

export default function Navlink({ href, text }: { href: string; text: string }) {
    return (
        <Link href={href}
            className={`px-1.5 border-b-4 text-gray-600 hover:text-black transition-colors border-[var(--color-claro)] duration-250 hover:border-gray-800`} role="menuitem">
            {text}
        </Link>
    )
}