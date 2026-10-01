import { Providers } from '@/providers/Theme';
import Footer from '@/components/sections/Footer';
import Header from '@/components/sections/Header';
import { TranslationProvider } from '@/providers/translations';
import { getZoneFromCookie } from '@/lib/getZoneFromCookie';
import { getTranslations } from '@/lib/getTranslations';
import { prepareTranslations } from '@/lib/translations';
import { headers } from 'next/headers';
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

  const context = { page: (await headers()).get('x-pathname') ?? `/${locale}`, locale, zone, resource: 'layout' };
  const layoutTranslations = await getTranslations(locale, zone, 'layout', 'navbar,route-maps', context);
  const translations = {
    ...layoutTranslations,
    navbar: prepareTranslations(layoutTranslations.navbar, { ...context, section: 'navbar' }),
  };

  return (
    <Providers>
      <TranslationProvider translations={translations} context={context}>
        <Header />
        {children}
        <Footer />
      </TranslationProvider>
    </Providers>
  );
}
