import { getUserPermissionById } from '@/lib/user-permission-requests';
import { getPlatformUserList } from '@/lib/platform-user-requests';
import { getCountryList } from '@/lib/country-requests';
import { EditTranslatorPermissionForm } from './EditTranslatorPermissionForm';
import { notFound } from 'next/navigation';

export default async function EditTranslatorPermissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const permId = Number(id);
  const permRes = await getUserPermissionById(permId);
  if (!permRes.success || !permRes.data) return notFound();
  const permission = permRes.data;
  if (permission.permission_type !== 'translator') return notFound();

  const platformUsersRes = await getPlatformUserList(1, 1000);
  const countriesRes = await getCountryList(1, 1000);

  const countries = (countriesRes?.data || []).map((c: any) => ({ id: c.id, name: c.name, country_code: c.country_code }));

  return (
    <div className="min-h-[60vh] flex items-start sm:items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-2 sm:p-4">
        <EditTranslatorPermissionForm
          permission={permission}
          platformUsers={platformUsersRes?.data || []}
          countries={countries}
        />
      </div>
    </div>
  );
}



