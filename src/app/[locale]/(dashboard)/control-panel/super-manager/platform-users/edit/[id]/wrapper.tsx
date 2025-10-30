import { getPlatformUserById } from '@/lib/platform-user-requests';
import { EditPlatformUserForm } from './EditPlatformUserForm';

export async function EditPlatformUserFormWrapper({ id }: { id: number }) {
  const resp = await getPlatformUserById(id);
  return <EditPlatformUserForm user={resp.data} />;
}


