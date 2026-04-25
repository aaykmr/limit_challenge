'use client';

import FilterList from '@mui/icons-material/FilterList';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  CircularProgress,
  Container,
  Divider,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  IconButton,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSession } from '@/lib/hooks/useAuth';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SubmissionStatus, SubmissionPriority } from '@/lib/types';
import PriorityCaretIcon from '@/app/components/PriorityCaretIcon';
import styles from './page.module.scss';

const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

const PRIORITY_OPTIONS: { label: string; value: SubmissionPriority | '' }[] = [
  { label: 'All priorities', value: '' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];
const CARD_RADIUS = 3;
const INPUT_RADIUS = '100px';

function SubmissionsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialStatus = (searchParams.get('status') as SubmissionStatus | '') || '';
  const initialPriority = (searchParams.get('priority') as SubmissionPriority | '') || '';
  const initialBrokerId = searchParams.get('brokerId') || '';
  const initialCompanyQuery = searchParams.get('companySearch') || '';
  const initialPage = Number(searchParams.get('page') || '1');

  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | ''>(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState<SubmissionPriority | ''>(initialPriority);
  const [brokerIdFilter, setBrokerIdFilter] = useState(initialBrokerId);
  const [companySearchFilter, setCompanySearchFilter] = useState(initialCompanyQuery);
  const [companyInput, setCompanyInput] = useState(initialCompanyQuery);
  const [pageFilter, setPageFilter] = useState(initialPage);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isClientHydrated, setIsClientHydrated] = useState(false);
  const sessionQuery = useSession();

  const filters = useMemo(
    () => ({
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      brokerId: brokerIdFilter || undefined,
      companySearch: companySearchFilter || undefined,
      page: pageFilter,
    }),
    [statusFilter, priorityFilter, brokerIdFilter, companySearchFilter, pageFilter],
  );

  const submissionsQuery = useSubmissionsList(filters);
  const brokerQuery = useBrokerOptions();
  const totalCount = submissionsQuery.data?.count ?? 0;
  const results = submissionsQuery.data?.results ?? [];
  const pageCount = Math.ceil(totalCount / 10);
  const isDebouncingCompanySearch = companyInput !== companySearchFilter;
  const showFiltersLoader =
    submissionsQuery.isLoading ||
    submissionsQuery.isFetching ||
    brokerQuery.isLoading ||
    brokerQuery.isFetching ||
    isDebouncingCompanySearch;

  const getStatusColor = (value: SubmissionStatus) => {
    if (value === 'new') return 'info';
    if (value === 'in_review') return 'warning';
    if (value === 'closed') return 'success';
    return 'default';
  };

  const getPriorityColor = (theme: Theme, value: SubmissionPriority) => {
    if (value === 'high') return theme.palette.error.main;
    if (value === 'medium') return theme.palette.warning.main;
    return theme.palette.info.main;
  };

  const getPriorityChevronCount = (value: SubmissionPriority) => {
    if (value === 'high') return 3;
    if (value === 'medium') return 2;
    return 1;
  };

  const renderPriorityIndicator = (priority: SubmissionPriority, priorityDisplay: string) => (
    <Tooltip title={`Priority: ${priorityDisplay}`} arrow>
      <Box
        sx={(theme) => ({
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.15,
          color: getPriorityColor(theme, priority),
        })}
      >
        <PriorityCaretIcon level={getPriorityChevronCount(priority) as 1 | 2 | 3} />
      </Box>
    </Tooltip>
  );

  const onPageChange = (_event: React.ChangeEvent<unknown>, nextPage: number) => {
    setPageFilter(nextPage);
  };

  const clearAllFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setBrokerIdFilter('');
    setCompanySearchFilter('');
    setCompanyInput('');
    setPageFilter(1);
  };

  useEffect(() => {
    setIsClientHydrated(true);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (companyInput !== companySearchFilter) {
        setCompanySearchFilter(companyInput);
        setPageFilter(1);
      }
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [companyInput, companySearchFilter]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (priorityFilter) params.set('priority', priorityFilter);
    if (brokerIdFilter) params.set('brokerId', brokerIdFilter);
    if (companySearchFilter) params.set('companySearch', companySearchFilter);
    if (pageFilter > 1) params.set('page', String(pageFilter));

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(null, '', nextUrl);
  }, [statusFilter, priorityFilter, brokerIdFilter, companySearchFilter, pageFilter, pathname]);

  useEffect(() => {
    if (sessionQuery.isSuccess && !sessionQuery.data.isAuthenticated) {
      router.replace('/login');
    }
  }, [router, sessionQuery.isSuccess, sessionQuery.data]);

  if (!isClientHydrated || sessionQuery.isLoading) {
    return (
      <Container maxWidth={false} className={styles.pageContainer}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={64} thickness={4.5} />
        </Box>
      </Container>
    );
  }

  if (sessionQuery.isError) {
    return (
      <Container maxWidth={false} className={styles.pageContainer}>
        Unable to verify session right now. Please refresh.
      </Container>
    );
  }

  const renderFiltersPanel = () => (
    <Card variant="outlined" sx={{ borderRadius: CARD_RADIUS }}>
      <CardContent>
        <Box className={styles.filtersStack}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Filters</Typography>
            <Button
              size="small"
              onClick={() => setMobileFiltersOpen(false)}
              sx={{ borderRadius: INPUT_RADIUS, display: { xs: 'inline-flex', lg: 'none' } }}
            >
              Hide filters
            </Button>
          </Box>
          <Divider />
          <TextField
            select
            label="Status"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: INPUT_RADIUS } }}
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as SubmissionStatus | '');
              setPageFilter(1);
            }}
            fullWidth
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value || 'all'} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Priority"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: INPUT_RADIUS } }}
            value={priorityFilter}
            onChange={(event) => {
              setPriorityFilter(event.target.value as SubmissionPriority | '');
              setPageFilter(1);
            }}
            fullWidth
          >
            {PRIORITY_OPTIONS.map((option) => (
              <MenuItem key={option.value || 'all-priority'} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Broker"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: INPUT_RADIUS } }}
            value={brokerIdFilter}
            onChange={(event) => {
              setBrokerIdFilter(event.target.value);
              setPageFilter(1);
            }}
            fullWidth
          >
            <MenuItem value="">All brokers</MenuItem>
            {brokerQuery.data?.map((broker) => (
              <MenuItem key={broker.id} value={String(broker.id)}>
                {broker.name}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            color="secondary"
            onClick={clearAllFilters}
            sx={{ borderRadius: INPUT_RADIUS }}
          >
            Clear all filters
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth={false} className={styles.pageContainer}>
      <Box className={styles.pageStack}>
        <Box>
          <Typography variant="h4" component="h1">
            Submissions
          </Typography>
          <Typography color="text.secondary">
            Filter by status, priority, broker, and company name to inspect incoming submissions.
          </Typography>
        </Box>

        <Box className={styles.layoutGrid}>
          <Box>
            <Tooltip title="Show filters">
              <IconButton
                onClick={() => setMobileFiltersOpen((prev) => !prev)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 1.5,
                  display: { xs: 'inline-flex', lg: 'none' },
                }}
                aria-label="Show filters"
              >
                <FilterList />
              </IconButton>
            </Tooltip>

            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>{renderFiltersPanel()}</Box>
            <Collapse in={mobileFiltersOpen}>
              <Box sx={{ display: { xs: 'block', lg: 'none' } }}>{renderFiltersPanel()}</Box>
            </Collapse>
          </Box>

          <Card variant="outlined" sx={{ borderRadius: CARD_RADIUS }}>
            <CardContent>
              <Box className={styles.listStack}>
                <Box className={styles.listHeader}>
                  <Box className={styles.titleGroup}>
                    <Typography variant="h6">Submission list</Typography>
                    {showFiltersLoader && (
                      <CircularProgress size={20} thickness={5} sx={{ color: '#0f62fe' }} />
                    )}
                  </Box>
                  <Box className={styles.searchGroup}>
                    <TextField
                      label="Company search"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: INPUT_RADIUS } }}
                      value={companyInput}
                      onChange={(event) => setCompanyInput(event.target.value)}
                      size="small"
                    />
                  </Box>
                </Box>
                <Divider />
                {submissionsQuery.isLoading && <Typography>Loading submissions...</Typography>}
                {submissionsQuery.isError && (
                  <Alert severity="error">
                    Unable to load submissions. Please refresh and try again.
                  </Alert>
                )}
                {!submissionsQuery.isLoading &&
                  !submissionsQuery.isError &&
                  results.length === 0 && (
                    <Typography color="text.secondary">
                      No submissions match these filters.
                    </Typography>
                  )}
                {!submissionsQuery.isLoading && !submissionsQuery.isError && results.length > 0 && (
                  <Box sx={{ border: 'none', borderColor: 'divider', borderRadius: CARD_RADIUS, overflow: 'hidden' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Company</TableCell>
                          <TableCell>Broker</TableCell>
                          <TableCell>Owner</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Docs</TableCell>
                          <TableCell>Notes</TableCell>
                          <TableCell>Latest note</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.map((submission) => (
                          <TableRow
                            key={submission.id}
                            hover
                            className={styles.clickableRow}
                            onClick={() => router.push(`/submissions/${submission.id}`)}
                          >
                            <TableCell>{submission.company.legalName}</TableCell>
                            <TableCell>{submission.broker.name}</TableCell>
                            <TableCell>{submission.owner.fullName}</TableCell>
                            <TableCell>
                              <Chip
                                label={submission.statusDisplay}
                                size="small"
                                color={getStatusColor(submission.status)}
                              />
                            </TableCell>
                            <TableCell>
                              {renderPriorityIndicator(submission.priority, submission.priorityDisplay)}
                            </TableCell>
                            <TableCell>{submission.documentCount}</TableCell>
                            <TableCell>{submission.noteCount}</TableCell>
                            <TableCell>{submission.latestNote?.bodyPreview || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
                {pageCount > 1 && (
                  <Box className={styles.paginationRow}>
                    <Typography variant="body2" color="text.secondary">
                      Total count: {totalCount}
                    </Typography>
                    <Pagination page={pageFilter} count={pageCount} onChange={onPageChange} />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}

export default function SubmissionsPage() {
  return (
    <Suspense fallback={null}>
      <SubmissionsPageContent />
    </Suspense>
  );
}
