import { Providers } from '@/providers/Theme';
import { cn } from '@/lib/utils';
import { satoshi } from '@/lib/fonts';
import Footer from '@/components/sections/Footer';
import Header from '@/components/sections/Header';
import { getZoneFromCookie } from '@/lib/getZoneFromCookie';
import { getTranslations } from '@/lib/getTranslations';
import { TranslationProvider } from '@/providers/translations';
import { getLocaleFlags } from '@/lib/getLocales';
import '@/app/globals.css';

export default async function LocaleLayout({
  children,
  params,
  searchParams
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Record<string,string>>
  searchParams: Promise<Record<string,string>>
}>) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const zone = await getZoneFromCookie();
  if (zone === null) {
    throw new Error("Zone not found");
  }
  const _t = await getTranslations(locale, zone, "layout", "navbar,route-maps");

  console.log("vedvever",_t['navbar']);
  
  //to do add flags to the translations
  const _localeFlags = await getLocaleFlags();
  _t.locales = _localeFlags;

 

  return (
    <html lang={locale} suppressHydrationWarning className={cn(satoshi.variable, 'bg-[#FFF] dark:bg-black')}>
      <body>
        <Providers>
          <TranslationProvider translations={_t}>
            <Header />
            {children}
            <Footer />
          </TranslationProvider>
        </Providers>
      </body>
    </html>
  );
}