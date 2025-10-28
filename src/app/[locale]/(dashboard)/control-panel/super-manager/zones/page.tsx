import { getZoneList } from '@/lib/zone-requests';
import { ZonesTable } from './ZonesTable';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ZonesPageProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    name?: string;
    zone_code?: string;
  }>;
}

export default async function ZonesPage({ searchParams }: ZonesPageProps) {
  const pageLogger = logger.child('control-panel/super-manager/zones/page.tsx');
  
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = parseInt(params.per_page || '25');
  const orderBy = params.order_by;
  const orderDirection = params.order_direction;
  
  const filters = {
    name: params.name,
    zone_code: params.zone_code,
  };

  pageLogger.debug('Loading zones page', { page, perPage, orderBy, orderDirection, filters });

 const zoneData = await getZoneList(page, perPage, orderBy, orderDirection, filters);

  pageLogger.debug('Zone data received', { 
    hasData: !!zoneData?.data,
    dataLength: zoneData?.data?.length,
    hasPagination: !!zoneData?.pagination 
  });

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Zones</h2>
      </div>
      <ZonesTable 
        data={zoneData?.data || []} 
        meta={zoneData?.pagination}
      />
    </div>
  );
}

