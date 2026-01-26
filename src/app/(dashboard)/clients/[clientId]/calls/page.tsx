'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatDuration } from '@/lib/utils'
import type { ClientCallsListApiResponse } from '@/lib/types/clients'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

function buildCallsQueryString(
  clientId: string,
  searchParams: URLSearchParams
): string {
  const params = new URLSearchParams()
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const outcome = searchParams.get('outcome') ?? 'all'
  const repId = searchParams.get('repId') ?? 'all'
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)
  if (outcome !== 'all') params.set('outcome', outcome)
  if (repId !== 'all') params.set('repId', repId)
  const qs = params.toString()
  return qs ? `/api/clients/${clientId}/calls?${qs}` : `/api/clients/${clientId}/calls`
}

async function fetchCallsList(
  _clientId: string,
  queryString: string
): Promise<ClientCallsListApiResponse> {
  const res = await fetch(queryString)
  
  // Check if response is JSON before parsing
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`API returned non-JSON response. Status: ${res.status}`);
  }
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ??
        'Failed to fetch calls'
    )
  }
  return res.json()
}

function CallsTableSkeleton({ showRep }: { showRep: boolean }) {
  const cols = showRep ? 7 : 6
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Call</TableHead>
            <TableHead>Date</TableHead>
            {showRep && <TableHead>Rep</TableHead>}
            <TableHead>Duration</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Follow-Up</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: cols }).map((_, j) => (
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

function EmptyCalls() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-lg border bg-card">
      <p className="text-muted-foreground font-medium">
        No calls recorded yet for this client.
      </p>
    </div>
  )
}

export default function ClientCallsListPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const clientId = typeof params?.clientId === 'string' ? params.clientId : ''

  const [dateFromInput, setDateFromInput] = useState(
    () => searchParams.get('dateFrom') ?? ''
  )
  const [dateToInput, setDateToInput] = useState(
    () => searchParams.get('dateTo') ?? ''
  )
  const debouncedDateFrom = useDebounce(dateFromInput, 300)
  const debouncedDateTo = useDebounce(dateToInput, 300)

  const outcome = searchParams.get('outcome') ?? 'all'
  const repId = searchParams.get('repId') ?? 'all'

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams)
      for (const [k, v] of Object.entries(updates)) {
        if (!v || v === 'all') next.delete(k)
        else next.set(k, v)
      }
      router.replace(
        `/clients/${clientId}/calls${next.toString() ? `?${next.toString()}` : ''}`,
        { scroll: false }
      )
    },
    [router, searchParams, clientId]
  )

  useEffect(() => {
    if (debouncedDateFrom !== (searchParams.get('dateFrom') ?? '')) {
      updateParams({ dateFrom: debouncedDateFrom })
    }
  }, [debouncedDateFrom, searchParams, updateParams])

  useEffect(() => {
    if (debouncedDateTo !== (searchParams.get('dateTo') ?? '')) {
      updateParams({ dateTo: debouncedDateTo })
    }
  }, [debouncedDateTo, searchParams, updateParams])

  const queryString = buildCallsQueryString(clientId, searchParams)
  const { data, isLoading, isPending, isError } = useQuery({
    queryKey: ['client-calls-list', clientId, queryString],
    queryFn: () => fetchCallsList(clientId, queryString),
    enabled: !!clientId,
  })

  const client = data?.client
  const calls = data?.calls ?? []
  const role = data?.meta?.role
  const isManager = role === 'ADMIN' || role === 'MANAGER'
  const showRep = isManager
  const reps = data?.meta?.reps ?? []
  const outcomes = data?.meta?.outcomes ?? []
  const busy = isLoading || isPending

  const subtitle =
    client?.accountName != null
      ? `${client.name} — ${client.accountName}`
      : client?.name ?? ''

  return (
    <div className="flex h-full flex-col">
      <Header
        title={
          <>
            <Link
              href="/clients"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Clients
            </Link>
            {' > '}
            {client?.name ?? (clientId ? '…' : '')}
          </>
        }
        description={undefined}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Page header */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">Calls</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {client ? subtitle : '—'}
          </p>
        </section>

        {/* Inline filters */}
        <section className="flex flex-wrap items-end gap-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="date-from"
              className="text-sm font-medium text-muted-foreground"
            >
              Date from
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFromInput}
              onChange={(e) => setDateFromInput(e.target.value)}
              className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="date-to"
              className="text-sm font-medium text-muted-foreground"
            >
              Date to
            </label>
            <input
              id="date-to"
              type="date"
              value={dateToInput}
              onChange={(e) => setDateToInput(e.target.value)}
              className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="outcome"
              className="text-sm font-medium text-muted-foreground"
            >
              Outcome
            </label>
            <select
              id="outcome"
              value={outcome}
              onChange={(e) => updateParams({ outcome: e.target.value })}
              className="h-9 min-w-[160px] rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All</option>
              {outcomes.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          {showRep && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="rep"
                className="text-sm font-medium text-muted-foreground"
              >
                Rep
              </label>
              <select
                id="rep"
                value={repId}
                onChange={(e) => updateParams({ repId: e.target.value })}
                className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All</option>
                {reps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* Table */}
        <section>
          {isError && !data ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border bg-card">
              <p className="text-muted-foreground font-medium">
                Failed to load calls.
              </p>
              <Link
                href={`/clients/${clientId}`}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Back to client
              </Link>
            </div>
          ) : busy ? (
            <CallsTableSkeleton showRep={showRep} />
          ) : calls.length === 0 ? (
            <EmptyCalls />
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Call</TableHead>
                    <TableHead>Date</TableHead>
                    {showRep && <TableHead>Rep</TableHead>}
                    <TableHead>Duration</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Follow-Up</TableHead>
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
                        router.push(
                          `/clients/${clientId}/calls/${call.id}`
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(
                            `/clients/${clientId}/calls/${call.id}`
                          )
                        }
                      }}
                    >
                      <TableCell className="font-medium">
                        {call.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(call.startedAt)}
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
                            (call.followUpStatus === 'SCHEDULED' ||
                              call.followUpStatus === 'UNKNOWN') &&
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
                        {call.status === 'PROCESSING'
                          ? 'Processing…'
                          : call.status === 'FAILED'
                            ? 'Failed'
                            : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
