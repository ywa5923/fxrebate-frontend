import { getBrokerList } from '@/lib/broker-management';
import { BrokersTable } from './BrokersTable';
import logger from '@/lib/logger';

interface BrokersTableWrapperProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    broker_type?: string;
    country?: string;
    zone?: string;
    trading_name?: string;
    is_active?: string;
  }>;
}

export async function BrokersTableWrapper({ searchParams }: BrokersTableWrapperProps) {
  const pageLogger = logger.child('control-panel/super-manager/brokers/BrokersTableWrapper.tsx');
  
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
    is_active: params.is_active,
  };

  pageLogger.debug('Loading brokers', { page, perPage, orderBy, orderDirection, filters });

  const brokerData = await getBrokerList(page, perPage, orderBy, orderDirection, filters);

  pageLogger.debug('Broker data received', { 
    hasData: !!brokerData?.data,
    dataLength: brokerData?.data?.length,
    hasPagination: !!brokerData?.pagination 
  });

  return (
    <BrokersTable 
      data={brokerData.data} 
      meta={brokerData.pagination}
    />
  );
}

