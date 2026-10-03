import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Parolni tiklash',
    robots: { index: false },
};

export default function ForgotPasswordLayout({
    children,
}: {
    children: ReactNode;
}) {
    return children;
}
