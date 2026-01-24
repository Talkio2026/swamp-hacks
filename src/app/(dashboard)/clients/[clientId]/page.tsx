'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatDateTime,
  formatDuration,
  formatRelativeTime,
} from '@/lib/utils'
import type {
  ClientDetailApiResponse,
  CallTimelineRow,
  FollowUpInfo,
} from '@/lib/types/clients'
import { cn } from '@/lib/utils'

const CONTEXT_COLLAPSE_THRESHOLD = 200

async function fetchClientDetail(
  clientId: string
): Promise<ClientDetailApiResponse & { meta?: { role?: string } }> {
  const res = await fetch(`/api/clients/${clientId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } })?.error?.message ?? 'Failed to fetch client')
  }
  return res.json()
}

async function fetchClientCalls(clientId: string) {
  const res = await fetch(`/api/clients/${clientId}/calls`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } })?.error?.message ?? 'Failed to fetch calls')
  }
  return res.json() as Promise<{ calls: CallTimelineRow[]; meta: { total: number } }>
}

async function patchContextSummary(
  clientId: string,
  summary: string
): Promise<ClientDetailApiResponse> {
  const res = await fetch(`/api/clients/${clientId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context: { summary } }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } })?.error?.message ?? 'Failed to update context')
  }
  return res.json()
}

function ClientHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-5 w-32" />
    </div>
  )
}

function ContextSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 max-w-[75%]" />
        <Skeleton className="h-3 w-24 mt-2" />
      </CardContent>
    </Card>
  )
}

function CallsTableSkeleton({ showRep }: { showRep: boolean }) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Call</TableHead>
            <TableHead>Date / time</TableHead>
            {showRep && <TableHead>Rep</TableHead>}
            <TableHead>Duration</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Follow-up</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: showRep ? 7 : 6 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full max-w-[100px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function FollowUpCard({ followUp }: { followUp: FollowUpInfo }) {
  if (followUp.status === 'NONE') return null

  if (followUp.status === 'MISSING') {
    return (
      <Card className="border-l-4 border-l-destructive/50">
        <CardContent className="py-4">
          <p className="text-sm font-medium text-muted-foreground">
            No follow-up scheduled
          </p>
        </CardContent>
      </Card>
    )
  }

  const rel = followUp.scheduledAt
    ? formatRelativeTime(followUp.scheduledAt)
    : null
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-sm font-medium">
          {followUp.scheduledAt
            ? formatDateTime(followUp.scheduledAt)
            : 'Follow-up scheduled'}
        </p>
        {rel && (
          <p className="text-sm text-muted-foreground mt-0.5">{rel}</p>
        )}
        {followUp.purpose && (
          <p className="text-sm text-muted-foreground mt-1">{followUp.purpose}</p>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyCalls() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-lg border bg-card">
      <p className="text-muted-foreground font-medium">No calls yet for this client.</p>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Calls appear here after your first Twilio call is analyzed.
      </p>
    </div>
  )
}

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = typeof params?.clientId === 'string' ? params.clientId : ''
  const queryClient = useQueryClient()

  const {
    data: detail,
    isLoading: detailLoading,
    isPending: detailPending,
    isError: detailError,
  } = useQuery({
    queryKey: ['client-detail', clientId],
    queryFn: () => fetchClientDetail(clientId),
    enabled: !!clientId,
  })

  const {
    data: callsData,
    isLoading: callsLoading,
    isPending: callsPending,
  } = useQuery({
    queryKey: ['client-calls', clientId],
    queryFn: () => fetchClientCalls(clientId),
    enabled: !!clientId,
  })

  const patchMutation = useMutation({
    mutationFn: (summary: string) => patchContextSummary(clientId, summary),
    onSuccess: (updated) => {
      queryClient.setQueryData(['client-detail', clientId], updated)
    },
  })

  const [contextExpanded, setContextExpanded] = useState(false)
  const [contextEditing, setContextEditing] = useState(false)
  const [contextDraft, setContextDraft] = useState('')

  const client = detail?.client
  const context = detail?.context
  const followUp = detail?.followUp
  const calls = callsData?.calls ?? []
  const role = (detail as { meta?: { role?: string } } | undefined)?.meta?.role
  const isManager = role === 'ADMIN' || role === 'MANAGER'
  const showRep = isManager

  const detailBusy = detailLoading || detailPending
  const callsBusy = callsLoading || callsPending

  const summary = context?.summary ?? ''
  const isLong = summary.length > CONTEXT_COLLAPSE_THRESHOLD
  const showTruncated = isLong && !contextExpanded
  const displaySummary = showTruncated
    ? summary.slice(0, CONTEXT_COLLAPSE_THRESHOLD) + '...'
    : summary

  function startEdit() {
    setContextDraft(summary)
    setContextEditing(true)
  }

  function cancelEdit() {
    setContextEditing(false)
    setContextDraft('')
  }

  function saveEdit() {
    patchMutation.mutate(contextDraft, {
      onSuccess: () => {
        setContextEditing(false)
        setContextDraft('')
      },
    })
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title={
          client ? (
            <>
              <Link
                href="/clients"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Clients
              </Link>
              {' / '}
              {client.name}
            </>
          ) : (
            <>Clients{clientId ? ' / …' : ''}</>
          )
        }
        description={client?.accountName ?? undefined}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {detailError && !client ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground font-medium">Client not found.</p>
            <Link
              href="/clients"
              className="mt-2 text-sm text-primary hover:underline"
            >
              Back to Clients
            </Link>
          </div>
        ) : (
        <>
        {/* Client Header */}
        <section>
          {detailBusy && !client ? (
            <ClientHeaderSkeleton />
          ) : client ? (
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                {client.name}
              </h2>
              {client.accountName && (
                <p className="text-muted-foreground text-sm">
                  {client.accountName}
                </p>
              )}
              {client.primaryRepName && (
                <Badge variant="secondary" className="text-xs">
                  Primary Rep: {client.primaryRepName}
                </Badge>
              )}
            </div>
          ) : null}
        </section>

        {/* Context Summary */}
        <section>
          {detailBusy && !context ? (
            <ContextSkeleton />
          ) : context ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Client Context</CardTitle>
                {!contextEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={startEdit}
                  >
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {contextEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={contextDraft}
                      onChange={(e) => setContextDraft(e.target.value)}
                      className="min-h-[120px]"
                      placeholder="Client context summary…"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={saveEdit}
                        disabled={patchMutation.isPending || !contextDraft.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        disabled={patchMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {summary ? displaySummary : 'Generating context…'}
                    </p>
                    {isLong && !contextEditing && (
                      <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground mt-1"
                        onClick={() => setContextExpanded((e) => !e)}
                      >
                        {contextExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Last updated{' '}
                      {context.lastUpdatedAt
                        ? formatRelativeTime(context.lastUpdatedAt)
                        : '—'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : null}
        </section>

        {/* Upcoming / Overdue Follow-up */}
        {followUp && followUp.status !== 'NONE' && (
          <section>
            <FollowUpCard followUp={followUp} />
          </section>
        )}

        {/* Calls Timeline */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Calls</h3>
          {callsBusy ? (
            <CallsTableSkeleton showRep={showRep} />
          ) : calls.length === 0 ? (
            <EmptyCalls />
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Call</TableHead>
                    <TableHead>Date / time</TableHead>
                    {showRep && <TableHead>Rep</TableHead>}
                    <TableHead>Duration</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calls.map((call) => (
                    <TableRow
                      key={call.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer"
                      onClick={() =>
                        router.push(`/clients/${clientId}/calls/${call.id}`)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(`/clients/${clientId}/calls/${call.id}`)
                        }
                      }}
                    >
                      <TableCell className="font-medium">{call.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(call.startedAt)}
                      </TableCell>
                      {showRep && (
                        <TableCell className="text-muted-foreground">
                          {call.repName ?? '—'}
                        </TableCell>
                      )}
                      <TableCell>
                        {formatDuration(call.durationSeconds)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {call.outcomeLabel}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            call.followUpStatus === 'MISSING' &&
                              'text-destructive/80',
                            call.followUpStatus === 'SCHEDULED' &&
                              'text-muted-foreground',
                            call.followUpStatus === 'UNKNOWN' &&
                              'text-muted-foreground'
                          )}
                        >
                          {call.followUpStatus === 'SCHEDULED'
                            ? 'Scheduled'
                            : call.followUpStatus === 'MISSING'
                              ? 'Missing'
                              : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {call.status === 'PROCESSING' ? 'Processing…' : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
        </>
        )}
      </div>
    </div>
  )
}
