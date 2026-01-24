'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Users, 
  Phone, 
  Building2, 
  ChevronDown, 
  ChevronRight,
  User,
  Folder,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

// Type definitions
interface Call {
  callNumber: number
  callSid: string
  status: string
  outcome: string
  sentiment: string
  createdAt: string
  nextAction: string
}

interface Client {
  clientId: string
  clientName: string
  companyName: string
  industry: string
  contactEmail: string
  contactPhone: string
  salesRepName: string
  currentStatus: string
  totalCalls: number
  calls: Call[]
  isMock?: boolean
}

// Mock client data for demonstration
const mockClients: Client[] = [
  {
    clientId: 'CLT_001',
    clientName: 'Sarah Chen',
    companyName: 'Bright Ideas Marketing',
    industry: 'Marketing',
    contactEmail: 'sarah@brightideasmarketing.com',
    contactPhone: '+15551001001',
    salesRepName: 'Michael',
    currentStatus: 'closed_won',
    totalCalls: 3,
    isMock: true,
    calls: [
      {
        callNumber: 1,
        callSid: 'MOCK_CA_CLT001_CALL001',
        status: 'initial_contact',
        outcome: 'interested',
        sentiment: 'positive',
        createdAt: '2026-01-10T14:30:00.000Z',
        nextAction: 'scheduled_demo',
      },
      {
        callNumber: 2,
        callSid: 'MOCK_CA_CLT001_CALL002',
        status: 'demo',
        outcome: 'very_interested',
        sentiment: 'positive',
        createdAt: '2026-01-14T10:00:00.000Z',
        nextAction: 'contract_review',
      },
      {
        callNumber: 3,
        callSid: 'MOCK_CA_CLT001_CALL003',
        status: 'contract_accepted',
        outcome: 'closed_won',
        sentiment: 'positive',
        createdAt: '2026-01-17T15:00:00.000Z',
        nextAction: 'implementation_kickoff',
      },
    ],
  },
  {
    clientId: 'CLT_002',
    clientName: 'David Martinez',
    companyName: 'Genesis Tech Solutions',
    industry: 'Technology',
    contactEmail: 'd.martinez@genesistech.com',
    contactPhone: '+15551002002',
    salesRepName: 'Jessica',
    currentStatus: 'closed_lost',
    totalCalls: 2,
    isMock: true,
    calls: [
      {
        callNumber: 1,
        callSid: 'MOCK_CA_CLT002_CALL001',
        status: 'initial_contact',
        outcome: 'hesitant_interest',
        sentiment: 'neutral',
        createdAt: '2026-01-08T10:15:00.000Z',
        nextAction: 'scheduled_followup',
      },
      {
        callNumber: 2,
        callSid: 'MOCK_CA_CLT002_CALL002',
        status: 'rejected',
        outcome: 'closed_lost',
        sentiment: 'negative',
        createdAt: '2026-01-12T14:00:00.000Z',
        nextAction: 'none',
      },
    ],
  },
  {
    clientId: 'CLT_003',
    clientName: 'Lisa Wong',
    companyName: 'Nexus Retail Solutions',
    industry: 'Retail',
    contactEmail: 'lisa@nexusretail.com',
    contactPhone: '+15551003003',
    salesRepName: 'Kevin',
    currentStatus: 'negotiation',
    totalCalls: 2,
    isMock: true,
    calls: [
      {
        callNumber: 1,
        callSid: 'MOCK_CA_CLT003_CALL001',
        status: 'initial_contact',
        outcome: 'interested',
        sentiment: 'positive',
        createdAt: '2026-01-15T11:00:00.000Z',
        nextAction: 'scheduled_demo',
      },
      {
        callNumber: 2,
        callSid: 'MOCK_CA_CLT003_CALL002',
        status: 'in_progress',
        outcome: 'pending_decision',
        sentiment: 'positive',
        createdAt: '2026-01-20T11:00:00.000Z',
        nextAction: 'awaiting_cfo_approval',
      },
    ],
  },
]

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  initial_contact: 'default',
  demo: 'warning',
  in_progress: 'warning',
  contract_accepted: 'success',
  rejected: 'destructive',
  followup: 'default',
  negotiation: 'warning',
  prospect: 'default',
  qualified: 'warning',
  demo_scheduled: 'warning',
  closed_won: 'success',
  closed_lost: 'destructive',
}

const outcomeColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  interested: 'default',
  very_interested: 'success',
  hesitant_interest: 'warning',
  pending_decision: 'warning',
  closed_won: 'success',
  closed_lost: 'destructive',
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [callingClient, setCallingClient] = useState<string | null>(null)

  useEffect(() => {
    async function fetchClients() {
      try {
        // Fetch real clients from API
        const response = await fetch('/api/clients')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch clients')
        }
        
        // Process real clients and fetch their transcripts
        const realClients: Client[] = await Promise.all(
          (data.clients || []).map(async (client: {
            clientId: string
            clientName: string
            companyName: string
            industry: string
            contactEmail: string
            contactPhone: string
            salesRepName: string
            currentStatus: string
            totalCalls: number
          }) => {
            // Fetch transcripts for this client
            let calls: Call[] = []
            try {
              const transcriptsRes = await fetch(`/api/clients/${client.clientId}/transcripts`)
              const transcriptsData = await transcriptsRes.json()
              
              if (transcriptsRes.ok && transcriptsData.transcripts) {
                calls = transcriptsData.transcripts.map((t: {
                  callSid: string
                  callNumber?: number
                  status?: string
                  outcome?: string
                  sentiment?: string
                  createdAt?: string
                  nextAction?: string
                }) => ({
                  callNumber: t.callNumber || 1,
                  callSid: t.callSid,
                  status: t.status || 'completed',
                  outcome: t.outcome || 'unknown',
                  sentiment: t.sentiment || 'neutral',
                  createdAt: t.createdAt || new Date().toISOString(),
                  nextAction: t.nextAction || 'none',
                }))
              }
            } catch (err) {
              console.error(`Failed to fetch transcripts for ${client.clientId}:`, err)
            }
            
            return {
              ...client,
              calls,
              isMock: false,
            }
          })
        )
        
        // Get IDs of real clients to filter out duplicates
        const realClientIds = new Set(realClients.map(c => c.clientId))
        
        // Filter mock clients to exclude any that have same ID as real clients
        const filteredMockClients = mockClients.filter(mc => !realClientIds.has(mc.clientId))
        
        // Combine real clients with filtered mock clients (mock clients shown for demonstration)
        setClients([...realClients, ...filteredMockClients])
      } catch (err) {
        console.error('Error fetching clients:', err)
        setError(err instanceof Error ? err.message : 'Something went wrong')
        // Fall back to mock data on error
        setClients(mockClients)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [])

  const toggleClient = (clientId: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev)
      if (newSet.has(clientId)) {
        newSet.delete(clientId)
      } else {
        newSet.add(clientId)
      }
      return newSet
    })
  }

  const handleDeleteClick = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation() // Prevent folder toggle
    setDeleteConfirm(clientId)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return

    const client = clients.find(c => c.clientId === deleteConfirm)
    
    // If it's a mock client, just remove from state
    if (client?.isMock) {
      setClients(prev => prev.filter(c => c.clientId !== deleteConfirm))
      setDeleteConfirm(null)
      return
    }

    // Delete from API
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/clients?clientId=${deleteConfirm}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete client')
      }
      
      // Remove from state
      setClients(prev => prev.filter(c => c.clientId !== deleteConfirm))
    } catch (err) {
      console.error('Error deleting client:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete client')
    } finally {
      setIsDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm(null)
  }

  const handleCallClient = async (e: React.MouseEvent, client: Client) => {
    e.stopPropagation() // Prevent folder toggle
    
    if (client.isMock) {
      alert('Cannot call demo clients. Add a real client to make calls.')
      return
    }

    setCallingClient(client.clientId)
    
    try {
      const response = await fetch('/api/twilio/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: client.contactPhone,
          clientName: client.clientName,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate call')
      }
      
      alert(`Call initiated to ${client.clientName}!\nCall SID: ${data.callSid}`)
    } catch (err) {
      console.error('Error initiating call:', err)
      alert(err instanceof Error ? err.message : 'Failed to initiate call')
    } finally {
      setCallingClient(null)
    }
  }

  // Calculate stats
  const stats = {
    totalClients: clients.length,
    activeDeals: clients.filter(c => !['closed_won', 'closed_lost'].includes(c.currentStatus)).length,
    closedWon: clients.filter(c => c.currentStatus === 'closed_won').length,
    closedLost: clients.filter(c => c.currentStatus === 'closed_lost').length,
  }

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Clients" 
        description="Manage your sales prospects and clients"
        actions={
          <Link href="/clients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Client
            </Button>
          </Link>
        }
      />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Active Deals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.activeDeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Won
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.closedWon}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                Lost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.closedLost}</div>
            </CardContent>
          </Card>
        </div>

        {/* Client Folders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              All Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error && clients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Link href="/clients/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </Link>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No clients yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first client to start tracking calls
                </p>
                <Link href="/clients/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => (
                  <div key={client.clientId} className="border rounded-lg overflow-hidden">
                    {/* Client Header (Folder) */}
                    <button
                      onClick={() => toggleClient(client.clientId)}
                      className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {expandedClients.has(client.clientId) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <Folder className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{client.clientName}</span>
                            <span className="text-xs text-muted-foreground">({client.clientId})</span>
                            <Badge variant={statusColors[client.currentStatus] || 'default'}>
                              {formatStatus(client.currentStatus)}
                            </Badge>
                            {client.isMock && (
                              <Badge variant="outline" className="text-xs">
                                Demo
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {client.companyName}
                            </span>
                            <span>{client.industry}</span>
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {client.salesRepName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {client.contactPhone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {client.calls.length} call{client.calls.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={(e) => handleCallClient(e, client)}
                          disabled={callingClient === client.clientId}
                          className="p-1.5 rounded-md hover:bg-green-500/10 text-muted-foreground hover:text-green-500 transition-colors cursor-pointer disabled:opacity-50"
                          title="Call client"
                        >
                          {callingClient === client.clientId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Phone className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, client.clientId)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          title="Delete client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </button>
                    
                    {/* Calls (Files in Folder) */}
                    {expandedClients.has(client.clientId) && (
                      <div className="border-t">
                        {client.calls.length === 0 ? (
                          <div className="p-4 pl-14 text-sm text-muted-foreground">
                            No calls made yet.
                          </div>
                        ) : (
                          client.calls.map((call, index) => (
                            <Link
                              key={call.callSid}
                              href={`/calls/${call.callSid}`}
                              className="flex items-center justify-between p-4 pl-14 hover:bg-accent/50 transition-colors border-b last:border-b-0 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Call #{call.callNumber}</span>
                                    <Badge variant={statusColors[call.status] || 'default'}>
                                      {formatStatus(call.status)}
                                    </Badge>
                                    <Badge variant={outcomeColors[call.outcome] || 'default'}>
                                      {formatStatus(call.outcome)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span>{formatDate(call.createdAt)}</span>
                                    <span>Sentiment: {call.sentiment}</span>
                                    {call.nextAction !== 'none' && (
                                      <span>Next: {formatStatus(call.nextAction)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {index === client.calls.length - 1 && (
                                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                    Latest
                                  </span>
                                )}
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Delete Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-foreground">
                  {clients.find(c => c.clientId === deleteConfirm)?.clientName}
                </span>
                ? This action cannot be undone and will remove all associated data.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
