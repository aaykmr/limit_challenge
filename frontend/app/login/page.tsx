'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import AuthCard from '@/app/components/AuthCard';
import { useSession } from '@/lib/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const sessionQuery = useSession();

  useEffect(() => {
    if (sessionQuery.isSuccess && sessionQuery.data.isAuthenticated) {
      router.replace('/submissions');
    }
  }, [router, sessionQuery.isSuccess, sessionQuery.data]);

  if (sessionQuery.isLoading || (sessionQuery.isSuccess && sessionQuery.data.isAuthenticated)) {
    return (
      <main className="mx-auto flex w-full max-w-5xl justify-center px-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl justify-center px-4 py-10">
      <AuthCard />
    </main>
  );
}
