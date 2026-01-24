'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RiskBadge, StatusBadge } from '@/components/ui/badge'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'

// Mock data - will be replaced with real API data
const mockCalls = [
  { 
    id: '1', 
    title: 'Acme Corp Discovery Call', 
    prospect: 'John Smith',
    company: 'Acme Corp',
    rep: { firstName: 'Sarah', lastName: 'Wilson' },
    status: 'COMPLETED' as const, 
    riskLevel: 'HIGH' as const, 
    callDate: '2024-01-15T10:30:00',
    duration: 1845,
  },
  { 
    id: '2', 
    title: 'TechStart Product Demo', 
    prospect: 'Emily Chen',
    company: 'TechStart Inc',
    rep: { firstName: 'Mike', lastName: 'Johnson' },
    status: 'COMPLETED' as const, 
    riskLevel: 'LOW' as const, 
    callDate: '2024-01-15T14:00:00',
    duration: 2100,
  },
  { 
    id: '3', 
    title: 'Enterprise Solutions Pitch', 
    prospect: 'David Brown',
    company: 'Enterprise Solutions',
    rep: { firstName: 'Sarah', lastName: 'Wilson' },
    status: 'PROCESSING' as const, 
    riskLevel: null, 
    callDate: '2024-01-14T09:00:00',
    duration: 1500,
  },
  { 
    id: '4', 
    title: 'Budget Review Meeting', 
    prospect: 'Lisa Anderson',
    company: 'Anderson & Co',
    rep: { firstName: 'John', lastName: 'Doe' },
    status: 'COMPLETED' as const, 
    riskLevel: 'MEDIUM' as const, 
    callDate: '2024-01-14T11:30:00',
    duration: 900,
  },
  { 
    id: '5', 
    title: 'Follow-up Discussion', 
    prospect: 'Robert Taylor',
    company: 'Taylor Industries',
    rep: { firstName: 'Jane', lastName: 'Smith' },
    status: 'FAILED' as const, 
    riskLevel: null, 
    callDate: '2024-01-13T16:00:00',
    duration: 720,
  },
]

export default function CallsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')

  const filteredCalls = mockCalls.filter(call => {
    const matchesSearch = search === '' || 
      call.title.toLowerCase().includes(search.toLowerCase()) ||
      call.prospect?.toLowerCase().includes(search.toLowerCase()) ||
      call.company?.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter
    const matchesRisk = riskFilter === 'all' || call.riskLevel === riskFilter
    
    return matchesSearch && matchesStatus && matchesRisk
  })

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Calls" 
        description="Browse and manage your sales calls"
      />
      
      <div className="flex-1 p-6 space-y-4 overflow-auto">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search calls..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
              
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>
            </div>
          </CardContent>
        </Card>
        
        {/* Calls Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Call
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Rep
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Risk
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Duration
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <Link href={`/calls/${call.id}`} className="block">
                        <div className="font-medium hover:text-primary transition-colors">
                          {call.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {call.prospect} • {call.company}
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">
                        {call.rep.firstName} {call.rep.lastName}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={call.status} />
                    </td>
                    <td className="p-4">
                      {call.riskLevel ? (
                        <RiskBadge level={call.riskLevel} />
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {call.duration ? formatDuration(call.duration) : '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(call.callDate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCalls.length} of {mockCalls.length} calls
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Empty state */}
        {filteredCalls.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No calls found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
