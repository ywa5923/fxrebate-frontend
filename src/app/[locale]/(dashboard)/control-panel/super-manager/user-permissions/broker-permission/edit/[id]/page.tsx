import { getUserPermissionById } from '@/lib/user-permission-requests';
import { getPlatformUserList } from '@/lib/platform-user-requests';
import { getBrokerList } from '@/lib/broker-management';
import { EditBrokerPermissionForm } from './EditBrokerPermissionForm';
import { notFound } from 'next/navigation';

export default async function EditBrokerPermissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const permId = Number(id);
  const permRes = await getUserPermissionById(permId);
  if (!permRes.success || !permRes.data) return notFound();
  const permission = permRes.data;
  if (permission.permission_type !== 'broker') return notFound();

  const platformUsersRes = await getPlatformUserList(1, 100000);
  const brokersRes = await getBrokerList(1, 100);

  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-2 sm:p-4">
        <EditBrokerPermissionForm
          permission={permission}
          platformUsers={platformUsersRes?.data || []}
          brokers={brokersRes?.data || []}
        />
      </div>
    </div>
  );
}


