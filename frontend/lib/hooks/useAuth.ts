'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { AuthSession, LoginPayload, SignupPayload } from '@/lib/types';

const SESSION_QUERY_KEY = ['auth', 'session'] as const;

async function fetchSession() {
  const response = await apiClient.get<AuthSession>('/auth/session/');
  return response.data;
}

async function login(payload: LoginPayload) {
  const response = await apiClient.post<AuthSession>('/auth/login/', payload);
  return response.data;
}

async function signup(payload: SignupPayload) {
  const response = await apiClient.post<AuthSession>('/auth/signup/', payload);
  return response.data;
}

async function logout() {
  await apiClient.post('/auth/logout/');
}

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSession,
    staleTime: 30_000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signup,
    onSuccess: (session) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, {
        id: null,
        username: null,
        isAuthenticated: false,
      } satisfies AuthSession);
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
}
