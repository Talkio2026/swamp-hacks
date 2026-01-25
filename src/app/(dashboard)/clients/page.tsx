'use client'

import { useState, useEffect } from 'react'
import { useModal } from '@/contexts/modal-context'
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
  Trash2,
  Bot,
  X,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  RefreshCw
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
  const { setModalOpen } = useModal()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Agent summary state
  const [agentModalOpen, setAgentModalOpen] = useState(false)
  
  // Sync all modal states with modal context for sidebar blending
  useEffect(() => {
    setModalOpen(agentModalOpen || !!deleteConfirm)
  }, [agentModalOpen, deleteConfirm, setModalOpen])
  const [agentLoading, setAgentLoading] = useState(false)
  const [agentError, setAgentError] = useState<string | null>(null)
  const [agentSummary, setAgentSummary] = useState<{
    clientId: string
    clientName: string
    companyName: string
    summary: {
      relationshipSummary: string
      clientProfile: {
        communicationStyle: string
        decisionMakingProcess: string
        keyPriorities: string[]
        painPoints: string[]
      }
      progressionAnalysis: {
        currentStage: string
        stageProgression: string
        velocityAssessment: string
      }
      sentimentTrend: {
        overall: string
        trend: string
        analysis: string
      }
      objectionsHistory: Array<{
        objection: string
        status: string
        resolution: string
      }>
      buyingSignals: string[]
      risks: Array<{
        risk: string
        severity: string
        mitigation: string
      }>
      recommendedStrategy: {
        immediateActions: string[]
        talkingPoints: string[]
        questionsToAsk: string[]
      }
      nextBestAction: string
      dealProbability: {
        percentage: number
        rationale: string
      }
      modelUsed: string
      generatedAt?: string
    }
    cached?: boolean
  } | null>(null)

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

  // Handle agent button click
  const handleAgentClick = async (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation() // Prevent folder toggle
    
    const client = clients.find(c => c.clientId === clientId)
    if (!client) return
    
    // For mock clients, show a message
    if (client.isMock) {
      setAgentError('AI Agent is only available for real clients with actual call transcripts.')
      setAgentModalOpen(true)
      return
    }
    
    // Check if client has calls
    if (client.calls.length === 0) {
      setAgentError('No calls found for this client. Make some calls first to generate AI insights.')
      setAgentModalOpen(true)
      return
    }
    
    setAgentLoading(true)
    setAgentError(null)
    setAgentSummary(null)
    setAgentModalOpen(true)
    
    try {
      const response = await fetch(`/api/clients/${clientId}/agent-summary`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary')
      }
      
      setAgentSummary({
        clientId: data.clientId,
        clientName: data.clientName,
        companyName: data.companyName,
        summary: data.summary,
        cached: data.cached,
      })
    } catch (err) {
      console.error('Error generating agent summary:', err)
      setAgentError(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setAgentLoading(false)
    }
  }

  // Handle refresh agent summary (force regeneration)
  const handleAgentRefresh = async () => {
    if (!agentSummary) return
    
    setAgentLoading(true)
    setAgentError(null)
    
    try {
      const response = await fetch(`/api/clients/${agentSummary.clientId}/agent-summary?refresh=true`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate summary')
      }
      
      setAgentSummary({
        clientId: data.clientId,
        clientName: data.clientName,
        companyName: data.companyName,
        summary: data.summary,
        cached: data.cached,
      })
    } catch (err) {
      console.error('Error regenerating agent summary:', err)
      setAgentError(err instanceof Error ? err.message : 'Failed to regenerate summary')
    } finally {
      setAgentLoading(false)
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
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 pb-0 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2 bg-gradient-to-b from-violet-50 via-violet-50/80 to-transparent">
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
            <CardHeader className="pb-2 bg-gradient-to-b from-violet-50 via-violet-50/80 to-transparent">
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
            <CardHeader className="pb-2 bg-gradient-to-b from-violet-50 via-violet-50/80 to-transparent">
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
            <CardHeader className="pb-2 bg-gradient-to-b from-violet-50 via-violet-50/80 to-transparent">
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
        </div>

        {/* Client Folders */}
        <Card className="border-0 shadow-none rounded-none">
          <CardHeader className="bg-gradient-to-b from-violet-50 via-violet-50/80 to-transparent px-0 pt-6 pb-4">
            <CardTitle className="flex items-center gap-2 px-8">
              <Folder className="h-5 w-5" />
              All Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
              <div className="space-y-0">
                {clients.map((client) => (
                  <div key={client.clientId} className="border-b border-[#E0E7FF] overflow-hidden last:border-b-0">
                    {/* Client Header (Folder) */}
                    <div
                      onClick={() => toggleClient(client.clientId)}
                      className="w-full flex items-center justify-between px-8 py-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && toggleClient(client.clientId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out ${expandedClients.has(client.clientId) ? 'rotate-90' : 'rotate-0'}`}>
                          <ChevronRight className="h-5 w-5" />
                        </div>
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
                          onClick={(e) => handleAgentClick(e, client.clientId)}
                          className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                          title="AI Agent Summary"
                        >
                          <Bot className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, client.clientId)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          title="Delete client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Calls (Files in Folder) */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedClients.has(client.clientId)
                          ? 'max-h-[2000px] opacity-100'
                          : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="border-t">
                        {client.calls.length === 0 ? (
                          <div className="px-8 py-4 pl-24 text-sm text-muted-foreground">
                            No calls made yet.
                          </div>
                        ) : (
                          client.calls.map((call, index) => (
                            <Link
                              key={call.callSid}
                              href={`/calls/${call.callSid}`}
                              className="flex items-center justify-between px-8 py-4 pl-24 hover:bg-accent/50 transition-colors border-b border-[#E0E7FF] last:border-b-0 cursor-pointer"
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
                    </div>
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
            <CardHeader className="bg-gradient-to-b from-violet-50 via-violet-50/80 to-transparent">
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

      {/* Agent Summary Modal */}
      {agentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0 border-b bg-gradient-to-b from-violet-50 via-violet-50/80 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Client Agent
                  {agentSummary && (
                    <span className="text-muted-foreground font-normal text-base">
                      — {agentSummary.clientName} ({agentSummary.companyName})
                    </span>
                  )}
                </CardTitle>
                <button
                  onClick={() => setAgentModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              {agentLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analyzing client history...</p>
                  <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
                </div>
              )}

              {agentError && !agentLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
                  <p className="text-destructive font-medium">Error</p>
                  <p className="text-muted-foreground text-center mt-2">{agentError}</p>
                </div>
              )}

              {agentSummary && !agentLoading && (
                <div className="space-y-6">
                  {/* Relationship Summary */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4" />
                      Relationship Summary
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {agentSummary.summary.relationshipSummary}
                    </p>
                  </div>

                  {/* Deal Probability & Next Action */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Deal Probability</h4>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold text-primary">
                          {agentSummary.summary.dealProbability.percentage}%
                        </div>
                        <p className="text-xs text-muted-foreground flex-1">
                          {agentSummary.summary.dealProbability.rationale}
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        Next Best Action
                      </h4>
                      <p className="text-sm">{agentSummary.summary.nextBestAction}</p>
                    </div>
                  </div>

                  {/* Sentiment & Progression */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        {agentSummary.summary.sentimentTrend.trend === 'improving' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : agentSummary.summary.sentimentTrend.trend === 'declining' ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <Target className="h-4 w-4" />
                        )}
                        Sentiment Trend
                      </h4>
                      <Badge variant={
                        agentSummary.summary.sentimentTrend.overall === 'positive' ? 'success' :
                        agentSummary.summary.sentimentTrend.overall === 'negative' ? 'destructive' : 'default'
                      }>
                        {agentSummary.summary.sentimentTrend.overall} ({agentSummary.summary.sentimentTrend.trend})
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {agentSummary.summary.sentimentTrend.analysis}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Pipeline Stage</h4>
                      <Badge>{agentSummary.summary.progressionAnalysis.currentStage.replace('_', ' ')}</Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {agentSummary.summary.progressionAnalysis.velocityAssessment}
                      </p>
                    </div>
                  </div>

                  {/* Client Profile */}
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client Profile
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Communication Style:</span>
                        <p>{agentSummary.summary.clientProfile.communicationStyle}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Decision Making:</span>
                        <p>{agentSummary.summary.clientProfile.decisionMakingProcess}</p>
                      </div>
                    </div>
                    {agentSummary.summary.clientProfile.keyPriorities.length > 0 && (
                      <div className="mt-3">
                        <span className="text-muted-foreground text-sm">Key Priorities:</span>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {agentSummary.summary.clientProfile.keyPriorities.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Buying Signals */}
                  {agentSummary.summary.buyingSignals.length > 0 && (
                    <div className="border border-green-500/20 bg-green-500/5 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-700">
                        <Lightbulb className="h-4 w-4" />
                        Buying Signals
                      </h4>
                      <ul className="text-sm space-y-1">
                        {agentSummary.summary.buyingSignals.map((signal, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {signal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risks */}
                  {agentSummary.summary.risks.length > 0 && (
                    <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        Risks
                      </h4>
                      <div className="space-y-2">
                        {agentSummary.summary.risks.map((risk, i) => (
                          <div key={i} className="text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                risk.severity === 'high' ? 'destructive' :
                                risk.severity === 'medium' ? 'warning' : 'default'
                              } className="text-xs">
                                {risk.severity}
                              </Badge>
                              <span>{risk.risk}</span>
                            </div>
                            <p className="text-xs text-muted-foreground ml-14 mt-1">
                              Mitigation: {risk.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Strategy */}
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Recommended Strategy
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {agentSummary.summary.recommendedStrategy.immediateActions.length > 0 && (
                        <div>
                          <span className="text-muted-foreground font-medium">Immediate Actions:</span>
                          <ul className="list-disc list-inside mt-1">
                            {agentSummary.summary.recommendedStrategy.immediateActions.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {agentSummary.summary.recommendedStrategy.talkingPoints.length > 0 && (
                        <div>
                          <span className="text-muted-foreground font-medium">Talking Points:</span>
                          <ul className="list-disc list-inside mt-1">
                            {agentSummary.summary.recommendedStrategy.talkingPoints.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {agentSummary.summary.recommendedStrategy.questionsToAsk.length > 0 && (
                        <div>
                          <span className="text-muted-foreground font-medium">Questions to Ask:</span>
                          <ul className="list-disc list-inside mt-1">
                            {agentSummary.summary.recommendedStrategy.questionsToAsk.map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Model info and cache status */}
                  <div className="flex items-center justify-center gap-4 pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      {agentSummary.cached ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Cached result
                        </span>
                      ) : (
                        <span>Generated by {agentSummary.summary.modelUsed}</span>
                      )}
                    </p>
                    <button
                      onClick={handleAgentRefresh}
                      disabled={agentLoading}
                      className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 disabled:opacity-50"
                      title="Regenerate summary"
                    >
                      <RefreshCw className={`h-3 w-3 ${agentLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
