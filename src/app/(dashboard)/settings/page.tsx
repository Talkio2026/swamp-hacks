'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  Shield, 
  Clock,
  Key,
  Bell,
  Database,
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Settings" 
        description="Manage your organization settings"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization
              </CardTitle>
              <CardDescription>
                Your organization details and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                label="Organization Name" 
                defaultValue="Acme Sales Inc" 
              />
              <Input 
                label="Billing Email" 
                type="email"
                defaultValue="billing@acme.com" 
              />
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
          
          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage who has access to your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Wilson', email: 'sarah@acme.com', role: 'ADMIN' },
                  { name: 'John Doe', email: 'john@acme.com', role: 'MANAGER' },
                  { name: 'Jane Smith', email: 'jane@acme.com', role: 'REP' },
                ].map((member) => (
                  <div 
                    key={member.email}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                    <Badge variant={
                      member.role === 'ADMIN' ? 'default' :
                      member.role === 'MANAGER' ? 'secondary' : 'outline'
                    }>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4">
                Invite Member
              </Button>
            </CardContent>
          </Card>
          
          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure your AI and integration API keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                label="Gemini API Key" 
                type="password"
                placeholder="Enter your Gemini API key"
              />
              <Input 
                label="OpenRouter API Key (Fallback)" 
                type="password"
                placeholder="Enter your OpenRouter API key"
              />
              <Input 
                label="ElevenLabs API Key (Optional)" 
                type="password"
                placeholder="For voice features"
              />
              <Button>Save API Keys</Button>
            </CardContent>
          </Card>
          
          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data & Privacy
              </CardTitle>
              <CardDescription>
                Manage data retention and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Data Retention</div>
                  <div className="text-sm text-muted-foreground">
                    How long to keep call recordings and transcripts
                  </div>
                </div>
                <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365" selected>1 year</option>
                  <option value="730">2 years</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Auto-delete Transcripts</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically remove transcripts after analysis
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardContent>
          </Card>
          
          {/* Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Audit Log
              </CardTitle>
              <CardDescription>
                Recent activity in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'Call analyzed', user: 'System', time: '5 min ago' },
                  { action: 'User invited', user: 'Sarah Wilson', time: '1 hour ago' },
                  { action: 'Playbook updated', user: 'John Doe', time: '2 hours ago' },
                  { action: 'Settings changed', user: 'Sarah Wilson', time: '1 day ago' },
                ].map((log, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium">{log.action}</div>
                      <div className="text-xs text-muted-foreground">by {log.user}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{log.time}</div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="mt-2 px-0 text-primary hover:text-primary/80">
                View full audit log →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
