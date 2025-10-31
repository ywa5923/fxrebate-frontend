import { getCountryList } from '@/lib/country-requests';
import { CountriesTable } from './CountriesTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CountriesPageProps {
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

export default async function CountriesPage({ searchParams }: CountriesPageProps) {
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

  const countryData = await getCountryList(page, perPage, orderBy, orderDirection, filters);

  return (
    <div className="flex-1 space-y-4">
      <CountriesTable 
        data={countryData?.data || []} 
        meta={countryData?.pagination}
      />
    </div>
  );
}

