import LoginForm from './LoginForm';

export default async function LoginPage({params}:{params:Promise<{locale:string}>}) {
  const { locale } = await params;
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}