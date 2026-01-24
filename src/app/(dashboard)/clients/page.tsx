'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatRelativeTime } from '@/lib/utils'
import type { ClientRow, ClientsApiResponse } from '@/lib/types/clients'
import { useDebounce } from '@/hooks/use-debounce'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

function buildClientsQueryParams(searchParams: URLSearchParams): string {
  const q = searchParams.get('q') ?? ''
  const followUp = searchParams.get('followUp') ?? 'all'
  const recent = searchParams.get('recent') ?? 'all'
  const repId = searchParams.get('repId') ?? 'all'
  const needsAttention = searchParams.get('needsAttention') ?? 'all'
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (followUp !== 'all') params.set('followUp', followUp)
  if (recent !== 'all') params.set('recent', recent)
  if (repId !== 'all') params.set('repId', repId)
  if (needsAttention !== 'all') params.set('needsAttention', needsAttention)
  return params.toString()
}

async function fetchClients(
  queryString: string
): Promise<ClientsApiResponse> {
  const url = queryString
    ? `/api/clients?${queryString}`
    : '/api/clients'
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to fetch clients')
  }
  return res.json()
}

function ClientsTableSkeleton({
  showNeedsAttention,
}: {
  showNeedsAttention: boolean
}) {
  const cols = 5 + (showNeedsAttention ? 1 : 0)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client Name</TableHead>
          <TableHead>Organization / Account</TableHead>
          <TableHead>Last Call</TableHead>
          <TableHead>Total Calls</TableHead>
          <TableHead>Follow-Up Status</TableHead>
          {showNeedsAttention && <TableHead>Needs Attention</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: cols }).map((_, j) => (
              <TableCell key={j}>
                <div className="h-5 w-full max-w-[120px] rounded bg-muted animate-pulse" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <p className="text-muted-foreground font-medium">
        Clients will appear here after your first sales call is analyzed.
      </p>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Connect Twilio (or your phone system) to record calls. Talkio ingests
        post-call transcripts and builds client context over time.
      </p>
    </div>
  )
}

export default function ClientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get('q') ?? ''
  )
  const debouncedSearch = useDebounce(searchInput, 300)

  const followUp = searchParams.get('followUp') ?? 'all'
  const recent = searchParams.get('recent') ?? 'all'
  const repId = searchParams.get('repId') ?? 'all'
  const needsAttention = searchParams.get('needsAttention') ?? 'all'

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams)
      for (const [k, v] of Object.entries(updates)) {
        if (v === 'all' || v === '') next.delete(k)
        else next.set(k, v)
      }
      router.replace(`/clients?${next.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  useEffect(() => {
    if (debouncedSearch === (searchParams.get('q') ?? '')) return
    updateParams({ q: debouncedSearch })
  }, [debouncedSearch, searchParams, updateParams])

  const queryString = buildClientsQueryParams(searchParams)
  const { data, isLoading, isPending } = useQuery({
    queryKey: ['clients', queryString],
    queryFn: () => fetchClients(queryString),
  })

  const isManager = data?.meta?.role === 'ADMIN' || data?.meta?.role === 'MANAGER'
  const showNeedsAttention = isManager
  const showRepFilter = isManager
  const reps = data?.meta?.reps ?? []

  const clients = data?.clients ?? []

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Clients"
        description="All active clients for this organization"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-[200px] sm:w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by client name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9"
                aria-label="Search clients"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              className="h-9"
            >
              Filters
              {filtersOpen ? (
                <ChevronUp className="ml-1.5 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-1.5 h-4 w-4" />
              )}
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">

        {/* Collapsible filters */}
        {filtersOpen && (
          <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Follow-up status
              </label>
              <select
                value={followUp}
                onChange={(e) =>
                  updateParams({ followUp: e.target.value })
                }
                className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="missing">Missing</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Recent activity
              </label>
              <select
                value={recent}
                onChange={(e) => updateParams({ recent: e.target.value })}
                className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
            {showRepFilter && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Assigned rep
                </label>
                <select
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
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Needs attention
              </label>
              <select
                value={needsAttention}
                onChange={(e) =>
                  updateParams({ needsAttention: e.target.value })
                }
                className="h-9 min-w-[120px] rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border bg-card">
          {isLoading || isPending ? (
            <div className="p-4">
              <ClientsTableSkeleton showNeedsAttention={showNeedsAttention} />
            </div>
          ) : clients.length === 0 ? (
            <EmptyState />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Organization / Account</TableHead>
                  <TableHead>Last Call</TableHead>
                  <TableHead>Total Calls</TableHead>
                  <TableHead>Follow-Up Status</TableHead>
                  {showNeedsAttention && (
                    <TableHead>Needs Attention</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow
                    key={client.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => router.push(`/clients/${client.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/clients/${client.id}`)
                      }
                    }}
                  >
                    <TableCell>
                      <span className="font-medium">{client.name}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.accountName ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.status === 'PROCESSING' ||
                      (client.totalCalls > 0 && !client.lastCallAt) ? (
                        'Processing…'
                      ) : (
                        formatRelativeTime(client.lastCallAt) ?? '—'
                      )}
                    </TableCell>
                    <TableCell>{client.totalCalls}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          client.followUpStatus === 'MISSING' &&
                            'text-destructive/80',
                          client.followUpStatus === 'SCHEDULED' &&
                            'text-muted-foreground',
                          client.followUpStatus === 'UNKNOWN' &&
                            'text-muted-foreground'
                        )}
                      >
                        {client.followUpStatus === 'SCHEDULED'
                          ? 'Scheduled'
                          : client.followUpStatus === 'MISSING'
                            ? 'Missing'
                            : '—'}
                      </span>
                    </TableCell>
                    {showNeedsAttention && (
                      <TableCell>
                        {client.needsAttention ? (
                          <span
                            title={client.needsAttentionReason ?? undefined}
                            className="inline-flex items-center gap-1.5"
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
                              aria-hidden
                            />
                            Yes
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
