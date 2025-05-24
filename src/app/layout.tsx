import type { Metadata } from 'next';


import '@/app/globals.css';

import { cn } from '@/lib/utils';
import { satoshi } from '@/lib/fonts';


export const metadata: Metadata = {
    title: 'FxRebate',
    description: 'FxRebate',
};

export default async function  RootLayout({
    children,
    params
  
  }: Readonly<{
    children: React.ReactNode;
    params: Promise<Record<string,string>>
   
  }>) {

    const resolvedParams = await params;
    const locale = resolvedParams.locale;
  

    return (
     
       <html lang={locale} suppressHydrationWarning className={cn(satoshi.variable, 'bg-[#FFF] dark:bg-black')}>
       <body>
       {children}
       </body>
       </html>
      
                   
               
    );
} 