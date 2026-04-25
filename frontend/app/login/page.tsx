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
      router.replace('/');
    }
  }, [router, sessionQuery.isSuccess, sessionQuery.data]);

  if (sessionQuery.isLoading || (sessionQuery.isSuccess && sessionQuery.data.isAuthenticated)) {
    return (
      <main className="mx-auto flex w-full max-w-6xl justify-center px-6 py-20">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl justify-center px-6 py-16">
      <AuthCard />
    </main>
  );
}
