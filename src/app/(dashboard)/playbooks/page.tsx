'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  BookOpen,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock playbooks data
const mockPlaybooks = [
  {
    id: '1',
    name: 'Standard B2B Sales',
    description: 'Default playbook for enterprise B2B sales calls',
    isDefault: true,
    isActive: true,
    stages: [
      { name: 'Introduction', description: 'Opening and rapport building' },
      { name: 'Discovery', description: 'Understanding needs and challenges' },
      { name: 'Presentation', description: 'Presenting the solution' },
      { name: 'Close', description: 'Securing commitment' },
    ],
    questions: [
      'What challenges are you currently facing?',
      'How long have you been dealing with this issue?',
      'Who else is involved in this decision?',
    ],
    doSay: ['Tell me more about that...', 'How does that impact your team?'],
    dontSay: ['Trust me', 'To be honest'],
  },
  {
    id: '2',
    name: 'Startup Outbound',
    description: 'Fast-paced playbook for startup sales',
    isDefault: false,
    isActive: true,
    stages: [
      { name: 'Hook', description: 'Quick attention grab' },
      { name: 'Problem', description: 'Pain point identification' },
      { name: 'Solution', description: 'Brief value prop' },
      { name: 'CTA', description: 'Clear next step' },
    ],
    questions: [
      'Are you currently solving X?',
      'What would it mean to fix this?',
    ],
    doSay: ['Would it be crazy if...'],
    dontSay: ['Just checking in'],
  },
]

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState(mockPlaybooks)
  const [expandedPlaybook, setExpandedPlaybook] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Playbooks" 
        description="Manage your sales playbooks and best practices"
        actions={
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Playbook
          </Button>
        }
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Info card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">What are Playbooks?</p>
                <p className="text-sm text-muted-foreground">
                  Playbooks define your sales methodology - the stages, questions, and best practices your team should follow. The AI uses playbooks to provide more relevant coaching and insights.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Playbooks list */}
          {playbooks.map((playbook) => (
            <Card key={playbook.id} className={cn(
              playbook.isDefault && 'ring-2 ring-primary/20'
            )}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setExpandedPlaybook(
                  expandedPlaybook === playbook.id ? null : playbook.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {playbook.isDefault && (
                      <Star className="h-4 w-4 text-primary fill-primary" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{playbook.name}</CardTitle>
                      <CardDescription>{playbook.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={playbook.isActive ? 'success' : 'secondary'}>
                      {playbook.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {expandedPlaybook === playbook.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {expandedPlaybook === playbook.id && (
                <CardContent className="border-t pt-4 space-y-6">
                  {/* Stages */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Sales Stages</h4>
                    <div className="flex gap-2 flex-wrap">
                      {playbook.stages.map((stage, i) => (
                        <div 
                          key={i}
                          className="flex-1 min-w-[120px] p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="text-sm font-medium">{stage.name}</div>
                          <div className="text-xs text-muted-foreground">{stage.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Discovery Questions */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Discovery Questions</h4>
                    <ul className="space-y-2">
                      {playbook.questions.map((q, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-muted-foreground">{i + 1}.</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Do/Don't Say */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-green-600 flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Do Say
                      </h4>
                      <ul className="space-y-1">
                        {playbook.doSay.map((phrase, i) => (
                          <li key={i} className="text-sm bg-green-50 p-2 rounded">
                            "{phrase}"
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-red-600 flex items-center gap-1">
                        <X className="h-4 w-4" />
                        Don't Say
                      </h4>
                      <ul className="space-y-1">
                        {playbook.dontSay.map((phrase, i) => (
                          <li key={i} className="text-sm bg-red-50 p-2 rounded">
                            "{phrase}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-between pt-4 border-t">
                    <div className="flex gap-2">
                      {!playbook.isDefault && (
                        <Button variant="outline" size="sm">
                          <Star className="h-4 w-4 mr-1" />
                          Set as Default
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {!playbook.isDefault && (
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
          
          {/* Create new playbook form (placeholder) */}
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Playbook</CardTitle>
                <CardDescription>
                  Define a new sales methodology for your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Playbook Name" placeholder="e.g., Enterprise Sales" />
                <Textarea 
                  label="Description" 
                  placeholder="Describe when to use this playbook..."
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button>Create Playbook</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
