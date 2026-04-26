'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { useLogin, useSignup } from '@/lib/hooks/useAuth';

type AuthMode = 'login' | 'signup';

interface AuthCardProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export default function AuthCard({ initialMode = 'login', onSuccess }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const router = useRouter();

  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const mutation = mode === 'login' ? loginMutation : signupMutation;

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await loginMutation.mutateAsync({ username: loginUsername, password: loginPassword });
      onSuccess?.();
      router.replace('/submissions');
    } catch {
      // Error is surfaced below.
    }
  };

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await signupMutation.mutateAsync({ username: signupUsername, password: signupPassword });
      onSuccess?.();
      router.replace('/submissions');
    } catch {
      // Error is surfaced below.
    }
  };

  const errorMessage =
    (mutation.error as { response?: { data?: { detail?: string } } } | null)?.response?.data
      ?.detail ||
    (
      mutation.error as {
        response?: { data?: { password?: string[]; username?: string[] } };
      } | null
    )?.response?.data?.password?.[0] ||
    (
      mutation.error as {
        response?: { data?: { password?: string[]; username?: string[] } };
      } | null
    )?.response?.data?.username?.[0] ||
    'Authentication failed. Please try again.';

  const isSubmitting = mutation.isPending;

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
      <header>
        <h1 className="text-lg font-semibold text-slate-900">Welcome Back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in or create an account to continue.</p>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Signup
        </button>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          {mutation.isError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignupSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          {mutation.isError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
      )}
    </section>
  );
}
