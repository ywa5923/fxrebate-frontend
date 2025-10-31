import { getUserPermissionById } from '@/lib/user-permission-requests';
import { getPlatformUserList } from '@/lib/platform-user-requests';
import { getZoneList } from '@/lib/zone-requests';
import { EditZonePermissionForm } from './EditZonePermissionForm';
import { notFound } from 'next/navigation';

export default async function EditZonePermissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const permId = Number(id);
  const permRes = await getUserPermissionById(permId);
  if (!permRes.success || !permRes.data) return notFound();
  const permission = permRes.data;
  if (permission.permission_type !== 'zone') return notFound();

  const platformUsersRes = await getPlatformUserList(1, 1000);
  const zonesRes = await getZoneList(1, 1000);

  const zones = (zonesRes?.data || []).map((z: any) => ({ id: z.id, name: z.name }));

  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-2 sm:p-4">
        <EditZonePermissionForm
          permission={permission}
          platformUsers={platformUsersRes?.data || []}
          zones={zones}
        />
      </div>
    </div>
  );
}


