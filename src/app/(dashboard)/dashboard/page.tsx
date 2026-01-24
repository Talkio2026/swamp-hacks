import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RiskBadge, StatusBadge } from '@/components/ui/badge'
import { Phone, AlertTriangle, CheckCircle, Clock, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Mock data - will be replaced with real data from API
const stats = {
  totalCalls: 156,
  completedCalls: 142,
  highRiskCalls: 12,
  processingCalls: 2,
}

const recentCalls = [
  { id: '1', title: 'Acme Corp Discovery Call', rep: 'John Doe', risk: 'HIGH' as const, date: '2024-01-15' },
  { id: '2', title: 'TechStart Demo', rep: 'Jane Smith', risk: 'LOW' as const, date: '2024-01-15' },
  { id: '3', title: 'Enterprise Solutions Pitch', rep: 'Mike Johnson', risk: 'MEDIUM' as const, date: '2024-01-14' },
  { id: '4', title: 'Startup Weekly Check-in', rep: 'Sarah Wilson', risk: 'LOW' as const, date: '2024-01-14' },
  { id: '5', title: 'Budget Discussion', rep: 'John Doe', risk: 'HIGH' as const, date: '2024-01-13' },
]

const objectionStats = [
  { type: 'Price', count: 45, percentage: 35 },
  { type: 'Timing', count: 32, percentage: 25 },
  { type: 'Competition', count: 26, percentage: 20 },
  { type: 'Authority', count: 18, percentage: 14 },
  { type: 'Need', count: 8, percentage: 6 },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Dashboard" 
        description="Overview of your sales performance"
        actions={
          <Link href="/calls/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Call
            </Button>
          </Link>
        }
      />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Calls
              </CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCalls}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Analyzed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCalls}</div>
              <p className="text-xs text-muted-foreground">91% completion rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Risk
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.highRiskCalls}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Processing
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processingCalls}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calls needing review */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Calls Needing Review</CardTitle>
              <Link href="/calls?filter=high-risk">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCalls.map((call) => (
                  <Link
                    key={call.id}
                    href={`/calls/${call.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{call.title}</p>
                      <p className="text-sm text-muted-foreground">{call.rep} • {call.date}</p>
                    </div>
                    <RiskBadge level={call.risk} />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Objection Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Objection Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {objectionStats.map((stat) => (
                  <div key={stat.type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{stat.type}</span>
                      <span className="text-muted-foreground">{stat.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/calls/new">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Transcript
                </Button>
              </Link>
              <Link href="/copilot">
                <Button variant="outline">
                  Start Live Copilot
                </Button>
              </Link>
              <Link href="/playbooks">
                <Button variant="outline">
                  Manage Playbooks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
