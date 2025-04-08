import BrokerPage from '@/app/_pages/broker/BrokerPage';
import BrokersPage from '@/app/_pages/brokers/BrokersPage';
import { getOriginalPath } from '@/lib/getOriginalPath';
import { getTranslations } from '@/lib/getTranslations';
import { getZoneFromCookie } from '@/lib/getZoneFromCookie';
import { notFound } from 'next/navigation';

type PageComponent = React.ComponentType<{
  locale: string;
  zone: string;
  searchParams?: Record<string, string>;
  capturedSegments?: string[];
}>;

const staticRoutes: Record<string, PageComponent> = {
  "forex-broker/forex-brokers-reviews": BrokersPage
}
const dynamicRoutes: Record<string, PageComponent> = {
    "forex-broker/forex-brokers-rebates/([A-Za-z0-9-]{2,50})(?:/([A-Za-z0-9-]{2,50}))?": BrokerPage
}

//en/forex-broker/forex-brokers-reviews
//fr/courtier-forex/avis-courtiers-forex

export default async function DynamicPage({params,searchParams}:{params:Promise<Record<string,string | string[]>>,searchParams:Promise<Record<string,string>>}) {
   let resolvedParams=await params;
   const locale = resolvedParams.locale as string;
   let resolvedSearchParams=await searchParams;
   const slug = resolvedParams.slug as string[];
   const zone = await getZoneFromCookie();

   if(!zone){
    notFound();
   }

   const originalPath=await getOriginalPath(slug,locale,zone);
   console.log("originalPath",originalPath);

   const { component: Page, matchedText, capturedSegments } = getPageComponent(originalPath);

   return <Page locale={locale} zone={zone} searchParams={resolvedSearchParams} capturedSegments={capturedSegments}/>

   
}

function getPageComponent(originalPath: string): { 
  component: PageComponent; 
  matchedText: string | null; 
  capturedSegments?: string[];
} {
  let Page = staticRoutes[originalPath];
  if (Page) {
    return { component: Page, matchedText: null };
  }
 
  for (let [key, value] of Object.entries(dynamicRoutes)) {
    const match = originalPath.match(key);
    if (match) {
      // Get all captured groups (excluding the full match at index 0)
      const capturedSegments = match.slice(1).filter(Boolean);
      return { 
        component: value, 
        matchedText: match[0],
        capturedSegments
      };
    }
  }

  notFound();
}
