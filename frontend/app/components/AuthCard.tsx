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
    <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Dashboard Access</h1>
        <p className="text-lg text-slate-500">
          Login or sign up to manage your property dashboard.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-xl px-4 py-3 text-xl font-semibold transition ${
            mode === 'login'
              ? 'bg-white text-slate-900 ring-2 ring-blue-500'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`rounded-xl px-4 py-3 text-xl font-semibold transition ${
            mode === 'signup'
              ? 'bg-white text-slate-900 ring-2 ring-blue-500'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Signup
        </button>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-2xl font-semibold text-slate-700">Username</span>
            <input
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-3xl text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-2xl font-semibold text-slate-700">Password</span>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-3xl text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {mutation.isError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-2xl font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignupSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-2xl font-semibold text-slate-700">Username</span>
            <input
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-3xl text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-2xl font-semibold text-slate-700">Password</span>
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-3xl text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {mutation.isError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-2xl font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
      )}
    </section>
  );
}
