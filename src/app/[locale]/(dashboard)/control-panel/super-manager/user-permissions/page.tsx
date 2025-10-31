import { getUserPermissionList } from '@/lib/user-permission-requests';
import { PermissionsTable } from './PermissionsTable';

export default async function UserPermissionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const sp = await searchParams;
  const page = Number((sp?.page as string) || 1);
  const per_page = Number((sp?.per_page as string) || 15);
  const data = await getUserPermissionList(page, per_page, {
    subject_type: sp?.subject_type as string | undefined,
    subject_id: sp?.subject_id as string | undefined,
    permission_type: sp?.permission_type as string | undefined,
    resource_id: sp?.resource_id as string | undefined,
    resource_value: sp?.resource_value as string | undefined,
    action: sp?.action as string | undefined,
    subject: sp?.subject as string | undefined,
    is_active: sp?.is_active as string | undefined,
    order_by: sp?.order_by as string | undefined,
    order_direction: sp?.order_direction as 'asc' | 'desc' | undefined,
  });
  return <PermissionsTable data={data.data || []} meta={data.pagination} />;
}


