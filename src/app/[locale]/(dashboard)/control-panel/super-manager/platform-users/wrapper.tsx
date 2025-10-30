import { getPlatformUserList } from '@/lib/platform-user-requests';
import { PlatformUsersTable } from './PlatformUsersTable';

export async function PlatformUsersTableWrapper({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const sp = await searchParams;

  const pageParam = Number((sp?.page as string) || 1);
  const perPageParam = Number((sp?.per_page as string) || 15);
  const name = (sp?.name as string) || undefined;
  const email = (sp?.email as string) || undefined;
  const role = (sp?.role as string) || undefined;
  const order_by = (sp?.order_by as string) || undefined;
  const order_direction = ((sp?.order_direction as string) as 'asc' | 'desc') || undefined;
  const is_active = (sp?.is_active as string) || undefined;

  const data = await getPlatformUserList(pageParam, perPageParam, {
    name,
    email,
    role,
    order_by,
    order_direction,
    is_active,
  });
  return <PlatformUsersTable data={data.data || []} meta={data.pagination} />;
}


