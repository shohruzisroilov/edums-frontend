import Providers from '@/app/providers';
import { cn } from '@/utils/cn';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Golos_Text, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

/*
 * Subsetlar to'rt tilni ham qoplashi shart: `cyrillic-ext` bo'lmasa o'zbek
 * kirillidagi Ў, Қ, Ғ, Ҳ harflari tizim shriftiga tushib ketadi.
 * `next/font` ro'yxatni literal ko'rinishda talab qiladi (o'zgaruvchi yoki
 * spread ishlamaydi), shuning uchun ro'yxat takrorlanadi.
 */

/** Interfeys matni — zich jadvallarda o'qilishi sinovdan o'tgan. */
const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
    display: 'swap',
});

/*
 * Sarlavhalar uchun. Golos — Paratype'ning kirill uchun mo'ljallab chizilgan
 * oilasi; mahsulotning to'rt tilidan ikkitasi kirill bo'lgani uchun lotinga
 * moslab kirilli keyin qo'shilgan shriftdan ko'ra mantiqiyroq.
 */
const golos = Golos_Text({
    variable: '--font-golos',
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
    weight: ['500', '600', '700'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        template: '%s | EDU MS',
        default: "EDU MS — Ta'lim boshqaruv tizimi",
    },
    description:
        "O'quv markazlarini boshqarish tizimi: markazlar, tariflar, xodimlar va o'quvchilar.",
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
