import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

import { apiClient } from '@/lib/api-client';
import { useLogin, useLogout, useSession } from '@/lib/hooks/useAuth';

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, queryClient };
}

describe('useAuth hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches session data through useSession', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: { id: 1, username: 'demo-user', isAuthenticated: true },
    });

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/session/');
    expect(result.current.data?.username).toBe('demo-user');
  });

  it('posts login credentials and stores session cache on success', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 2, username: 'login-user', isAuthenticated: true },
    });

    const { wrapper, queryClient } = createQueryWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ username: 'login-user', password: 'StrongPass123!' });
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login/', {
      username: 'login-user',
      password: 'StrongPass123!',
    });
    expect(queryClient.getQueryData(['auth', 'session'])).toEqual({
      id: 2,
      username: 'login-user',
      isAuthenticated: true,
    });
  });

  it('clears cached session state on logout', async () => {
    mockedApiClient.post.mockResolvedValueOnce({});

    const { wrapper, queryClient } = createQueryWrapper();
    queryClient.setQueryData(['auth', 'session'], {
      id: 5,
      username: 'still-logged-in',
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/logout/');
    expect(queryClient.getQueryData(['auth', 'session'])).toEqual({
      id: null,
      username: null,
      isAuthenticated: false,
    });
  });
});
