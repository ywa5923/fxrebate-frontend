

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
  return <div>BrokersPage</div>;
}



