import { getBrokerList } from '@/lib/broker-management';
import { BrokersTable } from '../../super-manager/brokers/BrokersTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BrokersPageProps {
  searchParams: Promise<{
    page?: string;
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    broker_type?: string;
    country?: string;
    zone?: string;
    trading_name?: string;
  }>;
}

export default async function BrokersPage({ searchParams }: BrokersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = parseInt(params.per_page || '25');
  const orderBy = params.order_by;
  const orderDirection = params.order_direction;
  
  const filters = {
    broker_type: params.broker_type,
    country: params.country,
    zone: params.zone,
    trading_name: params.trading_name,
  } as { broker_type?: string; country?: string; zone?: string; trading_name?: string };

  const brokerData = await getBrokerList(page, perPage, orderBy, orderDirection, filters);

  return (
    <div className="flex-1 space-y-4">
      <BrokersTable 
        data={brokerData?.data || []} 
        meta={brokerData?.pagination}
      />
    </div>
  );
}



