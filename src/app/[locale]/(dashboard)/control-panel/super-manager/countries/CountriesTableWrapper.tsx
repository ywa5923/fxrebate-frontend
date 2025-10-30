import { getCountryList } from '@/lib/country-requests';
import { CountriesTable } from './CountriesTable';
import logger from '@/lib/logger';

interface CountriesTableWrapperProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    name?: string;
    country_code?: string;
    zone_code?: string;
  }>;
}

export async function CountriesTableWrapper({ searchParams }: CountriesTableWrapperProps) {
  const pageLogger = logger.child('control-panel/super-manager/countries/CountriesTableWrapper.tsx');
  
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = parseInt(params.per_page || '25');
  const orderBy = params.order_by;
  const orderDirection = params.order_direction;
  
  const filters = {
    name: params.name,
    country_code: params.country_code,
    zone_code: params.zone_code,
  };

  pageLogger.debug('Loading countries', { page, perPage, orderBy, orderDirection, filters });

  const countryData = await getCountryList(page, perPage, orderBy, orderDirection, filters);

  pageLogger.debug('Country data received', { 
    hasData: !!countryData?.data,
    dataLength: countryData?.data?.length,
    hasPagination: !!countryData?.pagination 
  });

  return (
    <CountriesTable 
      data={countryData?.data || []} 
      meta={countryData?.pagination}
    />
  );
}

