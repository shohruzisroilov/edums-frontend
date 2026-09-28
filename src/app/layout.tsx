import Providers from '@/app/providers';
import { cn } from '@/utils/cn';
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Golos_Text, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
    display: 'swap',
});

const golos = Golos_Text({
    variable: '--font-golos',
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
    weight: ['500', '600', '700'],
    display: 'swap',
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    ],
};

export const metadata: Metadata = {
    title: {
        template: '%s | EDU MS',
        default: "EDU MS — O'quv markaz boshqaruv tizimi",
    },
    description:
        "O'quv markazlarini boshqarish tizimi: markazlar, tariflar, xodimlar va o'quvchilar.",
    verification: {
        google: 'DuH0dlATA0mmNA0BNX6VqeSlLOUBZJQeKonxapL9rM8',
    },
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'EDU MS',
    },
    formatDetection: {
        telephone: false,
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            suppressHydrationWarning
            lang='uz'
            className={cn(
                'h-full overflow-hidden antialiased',
                inter.className,
                inter.variable,
                golos.variable,
            )}
        >
            <body className='bg-background-gray-secondary_alt_2 h-full overflow-hidden'>
                <ThemeProvider
                    attribute='data-theme'
                    defaultTheme='light'
                    enableSystem
                >
                    <Providers>{children}</Providers>
                </ThemeProvider>
                <Toaster position='top-right' richColors />
            </body>
        </html>
    );
}
