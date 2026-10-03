import Providers from '@/app/providers';
import { cn } from '@/utils/cn';
import { SITE_URL } from '@/utils/site';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
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

const TITLE = "EDUMS — O'quv markaz boshqaruv tizimi";
const DESCRIPTION =
    "O'quv markazlarini boshqarish tizimi: markazlar, tariflar, xodimlar va o'quvchilar.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        template: '%s | EDUMS',
        default: TITLE,
    },
    description: DESCRIPTION,
    applicationName: 'EDUMS',
    openGraph: {
        type: 'website',
        siteName: 'EDUMS',
        title: TITLE,
        description: DESCRIPTION,
        url: '/',
        locale: 'uz_UZ',
        images: [{ url: '/landing/hero.png', width: 1024, height: 575 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: ['/landing/hero.png'],
    },
    verification: {
        google: 'DuH0dlATA0mmNA0BNX6VqeSlLOUBZJQeKonxapL9rM8',
    },
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'EDUMS',
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
                <Script
                    strategy='afterInteractive'
                    src='https://www.googletagmanager.com/gtag/js?id=G-QBLBTKVCN3'
                />
                <Script id='google-analytics' strategy='afterInteractive'>
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-QBLBTKVCN3');
                    `}
                </Script>
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
