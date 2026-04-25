'use client';

import { Box, CircularProgress, Container } from '@mui/material';
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
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={56} thickness={4.5} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <AuthCard />
      </Box>
    </Container>
  );
}
