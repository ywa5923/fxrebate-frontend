import { getPlatformUserList } from '@/lib/platform-user-requests';
import { PlatformUsersTable } from './PlatformUsersTable';

export async function PlatformUsersTableWrapper({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  const pageParam = Number((searchParams?.page as string) || 1);
  const perPageParam = Number((searchParams?.per_page as string) || 15);
  const name = (searchParams?.name as string) || undefined;
  const email = (searchParams?.email as string) || undefined;
  const role = (searchParams?.role as string) || undefined;
  const order_by = (searchParams?.order_by as string) || undefined;
  const order_direction = ((searchParams?.order_direction as string) as 'asc' | 'desc') || undefined;

  const data = await getPlatformUserList(pageParam, perPageParam, {
    name,
    email,
    role,
    order_by,
    order_direction,
  });
  return <PlatformUsersTable data={data.data || []} meta={data.pagination} />;
}


