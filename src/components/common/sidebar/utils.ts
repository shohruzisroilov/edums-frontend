/** Joriy yo'l menyu havolasiga mos keladimi (ichki sahifalar ham hisobga olinadi). */
export function isPathActive(href: string, pathname: string): boolean {
    if (!href) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
}
