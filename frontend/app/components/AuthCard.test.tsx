import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AuthCard from '@/app/components/AuthCard';
import { useLogin, useSignup } from '@/lib/hooks/useAuth';

const replaceMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useLogin: jest.fn(),
  useSignup: jest.fn(),
}));

type MutationMock = {
  mutateAsync: jest.Mock;
  isPending: boolean;
  isError: boolean;
  error: unknown;
};

function createMutationMock(): MutationMock {
  return {
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
    isError: false,
    error: null,
  };
}

describe('AuthCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLogin as jest.Mock).mockReturnValue(createMutationMock());
    (useSignup as jest.Mock).mockReturnValue(createMutationMock());
  });

  it('submits login credentials and redirects to submissions', async () => {
    const user = userEvent.setup();
    const loginMutation = createMutationMock();
    (useLogin as jest.Mock).mockReturnValue(loginMutation);

    render(<AuthCard />);

    await user.type(screen.getByLabelText('Username'), 'demo-user');
    await user.type(screen.getByLabelText('Password'), 'StrongPass123!');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(loginMutation.mutateAsync).toHaveBeenCalledWith({
      username: 'demo-user',
      password: 'StrongPass123!',
    });
    expect(replaceMock).toHaveBeenCalledWith('/submissions');
  });

  it('allows switching to signup and submits signup credentials', async () => {
    const user = userEvent.setup();
    const signupMutation = createMutationMock();
    (useSignup as jest.Mock).mockReturnValue(signupMutation);

    render(<AuthCard />);

    await user.click(screen.getByRole('button', { name: 'Signup' }));
    await user.type(screen.getByLabelText('Username'), 'new-user');
    await user.type(screen.getByLabelText('Password'), 'StrongPass123!');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(signupMutation.mutateAsync).toHaveBeenCalledWith({
      username: 'new-user',
      password: 'StrongPass123!',
    });
    expect(replaceMock).toHaveBeenCalledWith('/submissions');
  });

  it('enforces username and password input constraints', async () => {
    const user = userEvent.setup();
    render(<AuthCard />);

    const loginUsernameInput = screen.getByLabelText('Username');
    const loginPasswordInput = screen.getByLabelText('Password');
    expect(loginUsernameInput).toHaveAttribute('minLength', '3');
    expect(loginUsernameInput).toHaveAttribute('maxLength', '150');
    expect(loginPasswordInput).toHaveAttribute('minLength', '8');

    await user.click(screen.getByRole('button', { name: 'Signup' }));

    const signupUsernameInput = screen.getByLabelText('Username');
    const signupPasswordInput = screen.getByLabelText('Password');
    expect(signupUsernameInput).toHaveAttribute('minLength', '3');
    expect(signupUsernameInput).toHaveAttribute('maxLength', '150');
    expect(signupPasswordInput).toHaveAttribute('minLength', '8');
  });
});
