import { Providers } from '@/providers/Theme';
import Footer from '@/components/sections/Footer';
import Header from '@/components/sections/Header';
import { TranslationProvider } from '@/providers/translations';
import { getZoneFromCookie } from '@/lib/getZoneFromCookie';
import { fetchTranslations } from '@/lib/fetchTranslations';
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
  const layoutTranslations = await fetchTranslations({
    key: 'layout',
    locale,
    zone,
    sections: ['navbar', 'route-maps', 'footer'],
    page: context.page,
  });
  const translations = {
    navbar: prepareTranslations(layoutTranslations.navbar, { ...context, section: 'navbar' }),
    'route-maps': layoutTranslations['route-maps'] as Record<string, string>,
    footer: prepareTranslations(layoutTranslations.footer, { ...context, section: 'footer' }),
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
