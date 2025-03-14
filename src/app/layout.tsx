import type { Metadata } from 'next';
import { Providers } from '../providers/Theme';

import { cn } from '@/lib/utils';
import { satoshi } from '@/lib/fonts';

import Footer from '@/components/sections/Footer';
import Header from '@/components/sections/Header';

import './globals.css';

export const metadata: Metadata = {
    title: 'FxRebate',
    description: 'FxRebate',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={cn(satoshi.variable, 'bg-[#FFF] dark:bg-black')}>
            <body>
                <Providers>
                    <Header />
                    {children}
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}