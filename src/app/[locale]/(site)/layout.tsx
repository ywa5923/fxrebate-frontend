import { Providers } from '@/providers/Theme';

import Footer from '@/components/sections/Footer';
import Header from '@/components/sections/Header';
import { TranslationProvider } from '@/providers/translations';
import { getZoneFromCookie } from '@/lib/getZoneFromCookie';
import { getTranslations } from '@/lib/getTranslations';

import { getLocaleFlags } from '@/lib/getLocales';

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
  
    const _localeFlags = await getLocaleFlags();
    _t.locales = _localeFlags;
 

  return (
   
        <Providers>
          <TranslationProvider translations={_t}>
            <Header />
            {children}
            <Footer />
          </TranslationProvider>
        </Providers>
     
  );
}