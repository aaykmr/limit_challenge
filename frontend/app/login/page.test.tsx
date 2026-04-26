import { render, screen, waitFor } from '@testing-library/react';

import LoginPage from '@/app/login/page';
import { useSession } from '@/lib/hooks/useAuth';

const replaceMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/app/components/AuthCard', () => {
  return function MockAuthCard() {
    return <div>AuthCardMock</div>;
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when session query is loading', () => {
    (useSession as jest.Mock).mockReturnValue({
      isLoading: true,
      isSuccess: false,
      data: undefined,
    });

    const { container } = render(<LoginPage />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects authenticated users to submissions', async () => {
    (useSession as jest.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: true,
      data: { isAuthenticated: true },
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/submissions');
    });
  });

  it('renders auth card for unauthenticated users', () => {
    (useSession as jest.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: true,
      data: { isAuthenticated: false },
    });

    render(<LoginPage />);
    expect(screen.getByText('AuthCardMock')).toBeInTheDocument();
  });
});
