import { Providers } from '@/providers/Theme';
import Footer from '@/components/sections/Footer';
import Header from '@/components/sections/Header';
import { TranslationProvider } from '@/providers/translations';
import { getZoneFromCookie } from '@/lib/getZoneFromCookie';
import { getTranslations } from '@/lib/getTranslations';
import 'flag-icons/css/flag-icons.min.css';

export default async function SiteLayoutShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Record<string, string>>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  const zone = await getZoneFromCookie();

  const _t = await getTranslations(locale, zone, 'layout', 'navbar,route-maps');

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
