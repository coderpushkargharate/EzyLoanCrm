import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import NavBar from '@/components/crm/NavBar';

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-[#f3f2f7]">
      <NavBar userName={user.name} userEmail={user.email} />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
