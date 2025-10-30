import { Suspense } from 'react';
import { EditPlatformUserFormWrapper } from './wrapper';

export default function EditPlatformUserPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={null}>
      <EditPlatformUserFormWrapper id={Number(params.id)} />
    </Suspense>
  );
}


