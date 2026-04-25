'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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
    (mutation.error as { response?: { data?: { detail?: string } } } | null)?.response?.data?.detail ||
    (mutation.error as { response?: { data?: { password?: string[]; username?: string[] } } } | null)?.response?.data?.password?.[0] ||
    (mutation.error as { response?: { data?: { password?: string[]; username?: string[] } } } | null)?.response?.data?.username?.[0] ||
    'Authentication failed. Please try again.';

  return (
    <Box sx={{ width: '100%', maxWidth: 420, perspective: '1200px' }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: 400,
          transformStyle: 'preserve-3d',
          transition: 'transform 450ms ease',
          transform: mode === 'signup' ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <Card
          variant="outlined"
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 3,
            backfaceVisibility: 'hidden',
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Box textAlign="center">
                <Typography variant="h5">Welcome back</Typography>
                <Typography variant="body2" color="text.secondary">
                  Log in to continue to the submission tracker.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleLoginSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    fullWidth
                  />
                  <Button type="submit" variant="contained" disabled={loginMutation.isPending}>
                    Log in
                  </Button>
                </Stack>
              </Box>

              <Button type="button" onClick={() => setMode('signup')}>
                Don&apos;t have an account? Sign up
              </Button>

              {mode === 'login' && mutation.isError && <Alert severity="error">{errorMessage}</Alert>}
            </Stack>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 3,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Box textAlign="center">
                <Typography variant="h5">Create account</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign up with username and password.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSignupSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    fullWidth
                  />
                  <Button type="submit" variant="contained" disabled={signupMutation.isPending}>
                    Sign up
                  </Button>
                </Stack>
              </Box>

              <Button type="button" onClick={() => setMode('login')}>
                Already have an account? Log in
              </Button>

              {mode === 'signup' && mutation.isError && <Alert severity="error">{errorMessage}</Alert>}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
