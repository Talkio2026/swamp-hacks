'use client'

import { useState } from 'react'
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
  Clock
} from 'lucide-react'
import Link from 'next/link'

// Mock client data based on mock_transcripts folder structure
const mockClients = [
  {
    clientId: 'CLT_001',
    clientName: 'Sarah Chen',
    companyName: 'Bright Ideas Marketing',
    industry: 'Marketing',
    contactEmail: 'sarah@brightideasmarketing.com',
    contactPhone: '+15551001001',
    salesRepName: 'Michael',
    currentStatus: 'closed_won',
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

// Calculate stats from mock data
const stats = {
  totalClients: mockClients.length,
  activeDeals: mockClients.filter(c => !['closed_won', 'closed_lost'].includes(c.currentStatus)).length,
  closedWon: mockClients.filter(c => c.currentStatus === 'closed_won').length,
  closedLost: mockClients.filter(c => c.currentStatus === 'closed_lost').length,
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  initial_contact: 'default',
  demo: 'warning',
  in_progress: 'warning',
  contract_accepted: 'success',
  rejected: 'destructive',
  followup: 'default',
  negotiation: 'warning',
}

const outcomeColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  interested: 'default',
  very_interested: 'success',
  hesitant_interest: 'warning',
  pending_decision: 'warning',
  closed_won: 'success',
  closed_lost: 'destructive',
}

const clientStatusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  prospect: 'default',
  qualified: 'warning',
  demo_scheduled: 'warning',
  negotiation: 'warning',
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
  // All folders closed by default
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

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
            {mockClients.length === 0 ? (
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
                {mockClients.map((client) => (
                  <div key={client.clientId} className="border rounded-lg overflow-hidden">
                    {/* Client Header (Folder) */}
                    <button
                      onClick={() => toggleClient(client.clientId)}
                      className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
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
                            <Badge variant={clientStatusColors[client.currentStatus] || 'default'}>
                              {formatStatus(client.currentStatus)}
                            </Badge>
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
                      <div className="text-sm text-muted-foreground">
                        {client.calls.length} call{client.calls.length !== 1 ? 's' : ''}
                      </div>
                    </button>
                    
                    {/* Calls (Files in Folder) */}
                    {expandedClients.has(client.clientId) && (
                      <div className="border-t">
                        {client.calls.map((call, index) => (
                          <Link
                            key={call.callSid}
                            href={`/calls/${call.callSid}`}
                            className="flex items-center justify-between p-4 pl-14 hover:bg-accent/50 transition-colors border-b last:border-b-0"
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
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
