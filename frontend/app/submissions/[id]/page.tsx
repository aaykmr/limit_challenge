'use client';

import ArrowBack from '@mui/icons-material/ArrowBack';
import Business from '@mui/icons-material/Business';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Description from '@mui/icons-material/Description';
import Domain from '@mui/icons-material/Domain';
import Email from '@mui/icons-material/Email';
import Note from '@mui/icons-material/Note';
import OpenInNew from '@mui/icons-material/OpenInNew';
import People from '@mui/icons-material/People';
import Person from '@mui/icons-material/Person';
import PersonOutline from '@mui/icons-material/PersonOutline';
import Phone from '@mui/icons-material/Phone';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Link as MuiLink,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { type Theme } from '@mui/material/styles';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useSession } from '@/lib/hooks/useAuth';
import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import type { SubmissionDetail, SubmissionStatus } from '@/lib/types';
import PriorityCaretIcon from '@/app/components/PriorityCaretIcon';

const CARD_RADIUS = 3;

function getStatusChipColor(status: SubmissionStatus): 'info' | 'warning' | 'success' | 'default' {
  if (status === 'new') return 'info';
  if (status === 'in_review') return 'warning';
  if (status === 'closed') return 'success';
  return 'default';
}

function formatDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function getPriorityColor(theme: Theme, value: SubmissionDetail['priority']) {
  if (value === 'high') return theme.palette.error.main;
  if (value === 'medium') return theme.palette.warning.main;
  return theme.palette.info.main;
}

function getPriorityChevronCount(value: SubmissionDetail['priority']) {
  if (value === 'high') return 3;
  if (value === 'medium') return 2;
  return 1;
}

function PriorityIndicator({
  priority,
  priorityDisplay,
}: {
  priority: SubmissionDetail['priority'];
  priorityDisplay: string;
}) {
  return (
    <Tooltip title={`Priority: ${priorityDisplay}`} arrow>
      <Box
        sx={(theme) => ({
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.15,
          color: getPriorityColor(theme, priority),
        })}
      >
        <PriorityCaretIcon level={getPriorityChevronCount(priority) as 1 | 2 | 3} size={28} />
      </Box>
    </Tooltip>
  );
}

function FactTile({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: CARD_RADIUS }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: 'action.selected',
            color: 'text.primary',
            width: 44,
            height: 44,
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            {label}
          </Typography>
          {children}
        </Box>
      </Stack>
    </Paper>
  );
}

function SubmissionDetailView({ data }: { data: SubmissionDetail }) {
  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          href="/submissions"
          startIcon={<ArrowBack />}
          size="small"
          sx={{ mb: 1 }}
        >
          All submissions
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          {data.company.legalName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Submission #{data.id}
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: CARD_RADIUS }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Domain />
            </Avatar>
          }
          title="Overview"
          slotProps={{ title: { variant: 'h6' } }}
          subheader={data.company.industry ? `${data.company.industry}` : undefined}
          action={
            <Stack alignItems="flex-end" spacing={0.75}>
              <PriorityIndicator priority={data.priority} priorityDisplay={data.priorityDisplay} />
              <Tooltip title={`Status: ${data.statusDisplay}`} arrow>
                <Chip label={data.statusDisplay} size="small" color={getStatusChipColor(data.status)} />
              </Tooltip>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <Typography color="text.secondary">
              {data.summary || 'No summary provided for this submission.'}
            </Typography>
            {data.company.headquartersCity ? (
              <Typography variant="body2" color="text.secondary">
                Headquarters: {data.company.headquartersCity}
              </Typography>
            ) : null}
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Created {formatDate(data.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary" component="span">
                ·
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updated {formatDate(data.updatedAt)}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(0, 1.6fr) minmax(0, 1fr)',
          },
        }}
      >
        <Stack spacing={3}>
          <Card variant="outlined" sx={{ borderRadius: CARD_RADIUS }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <People />
                </Avatar>
              }
              title="Contacts"
              slotProps={{ title: { variant: 'h6' } }}
            />
            <Divider />
            <CardContent sx={{ pt: 0 }}>
              {data.contacts.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No contacts on file.
                </Typography>
              ) : (
                <List disablePadding>
                  {data.contacts.map((contact) => (
                    <ListItem key={contact.id} alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <PersonOutline color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={`${contact.name}${contact.role ? ` · ${contact.role}` : ''}`}
                        secondary={
                          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                            {contact.email ? (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Email sx={{ fontSize: 16 }} color="action" />
                                <MuiLink href={`mailto:${contact.email}`} variant="body2">
                                  {contact.email}
                                </MuiLink>
                              </Stack>
                            ) : null}
                            {contact.phone ? (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Phone sx={{ fontSize: 16 }} color="action" />
                                <MuiLink href={`tel:${contact.phone}`} variant="body2">
                                  {contact.phone}
                                </MuiLink>
                              </Stack>
                            ) : null}
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: CARD_RADIUS }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Description />
                </Avatar>
              }
              title="Documents"
              slotProps={{ title: { variant: 'h6' } }}
            />
            <Divider />
            <CardContent sx={{ pt: 0 }}>
              {data.documents.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No documents uploaded.
                </Typography>
              ) : (
                <List disablePadding>
                  {data.documents.map((document) => (
                    <ListItem key={document.id} alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Description color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          document.fileUrl ? (
                            <MuiLink href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                              {document.title}
                              <OpenInNew sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle' }} />
                            </MuiLink>
                          ) : (
                            document.title
                          )
                        }
                        secondary={`${document.docType} · ${formatDate(document.uploadedAt)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: CARD_RADIUS }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Note />
                </Avatar>
              }
              title="Notes"
              slotProps={{ title: { variant: 'h6' } }}
            />
            <Divider />
            <CardContent sx={{ pt: 0 }}>
              {data.notes.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No notes yet.
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ pt: 2 }}>
                  {data.notes.map((note) => (
                    <Paper
                      key={note.id}
                      variant="outlined"
                      sx={{ p: 2, borderLeft: 4, borderColor: 'primary.gray' }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="baseline"
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Typography variant="subtitle2">{note.authorName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(note.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                        {note.body}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>

        <Stack spacing={3}>
          <FactTile icon={<Business fontSize="small" />} label="Broker">
            <Typography variant="body1" fontWeight={500}>
              {data.broker.name}
            </Typography>
            {data.broker.primaryContactEmail ? (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                <Email sx={{ fontSize: 16 }} color="action" />
                <MuiLink href={`mailto:${data.broker.primaryContactEmail}`} variant="body2">
                  {data.broker.primaryContactEmail}
                </MuiLink>
              </Stack>
            ) : null}
          </FactTile>

          <FactTile icon={<Person fontSize="small" />} label="Owner">
            <Typography variant="body1" fontWeight={500}>
              {data.owner.fullName}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
              <Email sx={{ fontSize: 16 }} color="action" />
              <MuiLink href={`mailto:${data.owner.email}`} variant="body2">
                {data.owner.email}
              </MuiLink>
            </Stack>
          </FactTile>
        </Stack>
      </Box>
    </Stack>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';
  const router = useRouter();
  const [isClientHydrated, setIsClientHydrated] = useState(false);
  const sessionQuery = useSession();

  const detailQuery = useSubmissionDetail(submissionId);

  useEffect(() => {
    setIsClientHydrated(true);
  }, []);

  useEffect(() => {
    if (sessionQuery.isSuccess && !sessionQuery.data.isAuthenticated) {
      router.replace('/login');
    }
  }, [router, sessionQuery.isSuccess, sessionQuery.data]);

  if (!isClientHydrated || sessionQuery.isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={64} thickness={4.5} />
        </Box>
      </Container>
    );
  }

  if (sessionQuery.isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        Unable to verify session right now. Please refresh.
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {detailQuery.isLoading && <Typography>Loading submission...</Typography>}
      {detailQuery.isError && (
        <Alert severity="error">Unable to load submission details. Please try again.</Alert>
      )}

      {!detailQuery.isLoading && !detailQuery.isError && detailQuery.data && (
        <SubmissionDetailView data={detailQuery.data} />
      )}
    </Container>
  );
}
