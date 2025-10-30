import { getUserPermissionList } from '@/lib/user-permission-requests';
import { PermissionsTable } from './PermissionsTable';

export async function PermissionsTableWrapper({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  const page = Number((searchParams?.page as string) || 1);
  const per_page = Number((searchParams?.per_page as string) || 15);
  const data = await getUserPermissionList(page, per_page, {
    subject_type: searchParams?.subject_type as string | undefined,
    subject_id: searchParams?.subject_id as string | undefined,
    permission_type: searchParams?.permission_type as string | undefined,
    resource_id: searchParams?.resource_id as string | undefined,
    resource_value: searchParams?.resource_value as string | undefined,
    action: searchParams?.action as string | undefined,
    subject: searchParams?.subject as string | undefined,
    is_active: searchParams?.is_active as string | undefined,
    order_by: searchParams?.order_by as string | undefined,
    order_direction: searchParams?.order_direction as 'asc' | 'desc' | undefined,
  });
  return <PermissionsTable data={data.data || []} meta={data.pagination} />;
}


