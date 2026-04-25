'use client';

import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useLogout, useSession } from '@/lib/hooks/useAuth';

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const sessionQuery = useSession();
  const logoutMutation = useLogout();

  const isLoginPage = pathname === '/login';
  const isAuthenticated = sessionQuery.data?.isAuthenticated;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.replace('/login');
  };

  if (isLoginPage || !isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" component={Link} href="/submissions" sx={{ textDecoration: 'none', color: 'inherit' }}>
          Submission Tracker
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {sessionQuery.data?.username}
          </Typography>
          <Button variant="outlined" size="small" onClick={handleLogout} disabled={logoutMutation.isPending}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
