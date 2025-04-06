import Home from '@/app/_pages/home/Home';
import { getZoneFromCookie } from '@/lib/getZoneFromCookie';
import { notFound } from 'next/navigation';

export default async function RootPage({params}:{params:Promise<Record<string,string>>}) {
    const resolvedParams = await params;
    const locale = resolvedParams.locale as string;
    
    const zone = await getZoneFromCookie();
    if(!zone) {
        notFound();
    }

    return <Home locale={locale} zone={zone} />;
} 