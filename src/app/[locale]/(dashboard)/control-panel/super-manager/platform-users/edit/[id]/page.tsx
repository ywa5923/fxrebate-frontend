import { Suspense } from 'react';
import { EditPlatformUserFormWrapper } from './wrapper';

export default async function EditPlatformUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <EditPlatformUserFormWrapper id={Number(id)} />
    </Suspense>
  );
}


