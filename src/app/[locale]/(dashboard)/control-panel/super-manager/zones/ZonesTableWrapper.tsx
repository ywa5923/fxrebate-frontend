import { getZoneList } from '@/lib/zone-requests';
import { ZonesTable } from './ZonesTable';
import logger from '@/lib/logger';

interface ZonesTableWrapperProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    name?: string;
    zone_code?: string;
  }>;
}

export async function ZonesTableWrapper({ searchParams }: ZonesTableWrapperProps) {
  const pageLogger = logger.child('control-panel/super-manager/zones/ZonesTableWrapper.tsx');
  
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = parseInt(params.per_page || '25');
  const orderBy = params.order_by;
  const orderDirection = params.order_direction;
  
  const filters = {
    name: params.name,
    zone_code: params.zone_code,
  };

  pageLogger.debug('Loading zones', { page, perPage, orderBy, orderDirection, filters });

  const zoneData = await getZoneList(page, perPage, orderBy, orderDirection, filters);

  pageLogger.debug('Zone data received', { 
    hasData: !!zoneData?.data,
    dataLength: zoneData?.data?.length,
    hasPagination: !!zoneData?.pagination 
  });

  return (
    <ZonesTable 
      data={zoneData?.data || []} 
      meta={zoneData?.pagination}
    />
  );
}

