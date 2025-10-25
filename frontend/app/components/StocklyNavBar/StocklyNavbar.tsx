'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState, memo } from 'react';
import { usePathname } from 'next/navigation';

// -----------------------------
// Tipos
// -----------------------------
interface NavLink { name: string; href: string; active?: boolean; }
interface NavbarProps { userName?: string; userRole?: string; navLinks?: NavLink[]; onLogout?: () => void; }

// -----------------------------
// Hooks Personalizados (Compactados)
// -----------------------------

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener('pointerdown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('pointerdown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

const useEscapeKey = (handler: () => void) => {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => { if (e.key === 'Escape') handler(); };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [handler]);
};

const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('overflow-hidden', isLocked);
    return () => document.body.classList.remove('overflow-hidden');
  }, [isLocked]);
};

const useMediaQueryChange = (query: string, callback: () => void) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => { if (e.matches) callback(); };

    if (typeof m.addEventListener === 'function') m.addEventListener('change', handler as any);
    else m.addListener(handler as any);

    return () => {
      if (typeof m.removeEventListener === 'function') m.removeEventListener('change', handler as any);
      else m.removeListener(handler as any);
    };
  }, [query, callback]);
};

// -----------------------------
// Utilidades
// -----------------------------
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

// -----------------------------
// Iconos (Compactados)
// -----------------------------

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// -----------------------------
// Componentes reutilizables
// -----------------------------

const NavItems = memo(function NavItems({ navLinks, onClick, vertical = false }: { navLinks: NavLink[]; onClick?: () => void; vertical?: boolean; }) {
  const listClass = vertical ? 'flex flex-col gap-2' : 'flex items-center gap-4';

  return (
    <ul role="menubar" aria-orientation={vertical ? 'vertical' : 'horizontal'} className={listClass}>
      {navLinks.map((l) => (
        <li key={l.href} role="none">
          <Link href={l.href} onClick={onClick} aria-current={l.active ? 'page' : undefined}
            className={cx('text-sm font-medium transition-colors duration-150',
              vertical ? 'rounded-md px-3 py-2 w-full hover:bg-gray-50 text-gray-700' : 'px-1 py-2 border-b-2 text-gray-600 hover:text-[var(--brand)] hover:border-[color:var(--brand)]',
              l.active
                ? vertical ? 'bg-gray-100 font-semibold text-gray-900' : 'border-[color:var(--brand)] text-[color:var(--brand)] font-semibold'
                : vertical ? '' : 'border-transparent'
            )}
            role="menuitem">
            {l.name}
          </Link>
        </li>
      ))}
    </ul>
  );
});
NavItems.displayName = 'NavItems';

function UserInfo({ userName, userRole }: { userName?: string; userRole?: string; }) {
  return (
    <div className="text-right">
      <div className="text-sm font-medium text-gray-700">{userName}</div>
      <div className="text-xs text-gray-500">{userRole}</div>
    </div>
  );
}

// Desktop user dropdown menu (md+)
function UserMenu({ userName, userRole, onLogout }: { userName?: string; userRole?: string; onLogout?: () => void; }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null); // Uso de 'null' corregido

  useClickOutside(ref, () => setOpen(false));
  useEscapeKey(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((s) => !s)} type="button"
        className="flex items-center gap-3 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--brand-600)]">
        <UserInfo userName={userName} userRole={userRole} />
        <span className="p-2 rounded-full bg-gray-100 hover:bg-gray-200" aria-hidden><UserIcon /></span>
      </button>

      <div role="menu" aria-hidden={!open}
        className={cx('origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 bg-white transition-opacity duration-150',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <div className="py-1">
          <Link href="/profile" role="menuitem" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Ver Perfil</Link>
          <button type="button" role="menuitem" onClick={() => onLogout?.()}
            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Navbar principal
// -----------------------------
export default function Navbar({
  userName = 'Ignacio Cordero', userRole = 'Jefe de Proyecto',
  navLinks = [
    { name: 'Bodega', href: '/bodega' },
    { name: 'Ventas', href: '/ventas' },
    { name: 'Administracion del sistema', href: '/admin' },
  ],
  onLogout,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Lógica de UI extraída a hooks
  useBodyScrollLock(isOpen);
  useEscapeKey(() => setIsOpen(false));
  useMediaQueryChange('(min-width: 640px)', () => setIsOpen(false));

  useEffect(() => { if (isOpen && panelRef.current) panelRef.current.focus(); }, [isOpen]);

  const enhancedLinks = navLinks.map((l) => ({
    ...l,
    active: pathname === l.href || pathname?.startsWith(l.href + '/'),
  }));

  return (
    <div>
      <nav className="bg-[var(--color-claro)] border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* LEFT: logo + desktop nav */}
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-extrabold leading-none text-[var(--color-primario)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--brand-600)] rounded">
                Stockly
              </Link>
              {/* Desktop nav: ahora usa enhancedLinks */}
              <div className="hidden sm:flex sm:items-center sm:gap-4 lg:gap-8">
                <NavItems navLinks={enhancedLinks} />
              </div>
            </div>

            {/* RIGHT: user + hamburger */}
            <div className="flex items-center gap-3">
              {/* Desktop: show user menu */}
              <div className="hidden md:flex md:items-center md:gap-3">
                <UserMenu userName={userName} userRole={userRole} onLogout={onLogout} />
              </div>

              {/* Hamburger - visible on mobile */}
              <div className="sm:hidden">
                <button onClick={() => setIsOpen((s) => !s)} aria-expanded={isOpen} aria-controls="mobile-menu" aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'} type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--brand-600)]">
                  {isOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE PANEL */}
      <div id="mobile-menu" aria-hidden={!isOpen} className={cx('fixed inset-0 z-40 pointer-events-none', isOpen ? 'pointer-events-auto' : '')}>
        {/* Backdrop */}
        <div onClick={() => setIsOpen(false)} className={cx('absolute inset-0 bg-black/40 transition-opacity duration-200', isOpen ? 'opacity-100' : 'opacity-0')} />

        {/* Sliding panel from top */}
        <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true"
          className={cx('absolute left-0 right-0 top-0 bg-white shadow-lg transform transition-transform duration-300 ease-in-out', isOpen ? 'translate-y-0' : '-translate-y-full')}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/redirect" className="text-xl font-bold text-[var(--brand)]">Stockly</Link>
              <button onClick={() => setIsOpen(false)} aria-label="Cerrar menú" type="button"
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--brand-600)]">
                <CloseIcon />
              </button>
            </div>

            {/* Mobile nav: ahora usa enhancedLinks */}
            <div className="mt-4">
              <NavItems navLinks={enhancedLinks} onClick={() => setIsOpen(false)} vertical />
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">{userName}</div>
                  <div className="text-xs text-gray-500">{userRole}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/profile" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition">Ver Perfil</Link>
                  <button type="button" onClick={() => onLogout?.()} className="text-sm font-medium px-3 py-2 rounded-md hover:bg-red-50 transition text-gray-700">Cerrar Sesión</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}