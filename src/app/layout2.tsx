import type { Metadata } from 'next';
import { Providers } from '@/providers/Theme';
import { cn } from '@/lib/utils';
import { satoshi } from '@/lib/fonts';
import '@/app/globals.css';

export const metadata: Metadata = {
    title: 'FxRebate',
    description: 'FxRebate',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
      <>
       {children}
      </>
                   
               
    );
} 