import { getPlatformUserById } from '@/lib/platform-user-requests';
import { EditPlatformUserForm } from './EditPlatformUserForm';

export default async function EditPlatformUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resp = await getPlatformUserById(Number(id));
  return <EditPlatformUserForm user={resp.data} />;
}


