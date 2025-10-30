import { Suspense } from 'react';
import { AddPlatformUserForm } from './AddPlatformUserForm';

export default function AddPlatformUserPage() {
  return (
    <Suspense fallback={null}>
      <AddPlatformUserForm />
    </Suspense>
  );
}


