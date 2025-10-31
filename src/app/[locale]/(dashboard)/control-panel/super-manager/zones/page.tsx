import { getZoneList } from '@/lib/zone-requests';
import { ZonesTable } from './ZonesTable';

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
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = parseInt(params.per_page || '25');
  const orderBy = params.order_by;
  const orderDirection = params.order_direction;
  
  const filters = {
    name: params.name,
    zone_code: params.zone_code,
  };

  const zoneData = await getZoneList(page, perPage, orderBy, orderDirection, filters);

  return (
    <div className="flex-1 space-y-4">
      <ZonesTable 
        data={zoneData?.data || []} 
        meta={zoneData?.pagination}
      />
    </div>
  );
}

