'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  Users, 
  Phone, 
  Mic, 
  Settings, 
  Zap,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Section {
  id: string
  title: string
  icon: React.ElementType
  content: React.ReactNode
}

const sections: Section[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Welcome to Talkio</h3>
          <p className="text-gray-300 mb-4">
            Talkio is an AI-powered sales call copilot that helps you improve your sales performance through real-time assistance and post-call analysis.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-white">
            <CheckCircle className="h-4 w-4 text-green-400" />
            Quick Setup (3 steps)
          </h4>
          <ol className="space-y-3 ml-6">
            <li className="text-gray-300">
              <span className="font-medium text-white">1. Add Your First Client</span>
              <br />
              Navigate to Clients → New Client and enter their contact information
            </li>
            <li className="text-gray-300">
              <span className="font-medium text-white">2. Make a Call</span>
              <br />
              Click the phone icon next to any client to initiate a call
            </li>
            <li className="text-gray-300">
              <span className="font-medium text-white">3. Review AI Insights</span>
              <br />
              After the call, view detailed analysis, scores, and coaching tips
            </li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'clients',
    title: 'Managing Clients',
    icon: Users,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Client Management</h3>
          <p className="text-gray-300 mb-4">
            Organize your prospects and track their journey through the sales pipeline.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Adding a New Client</h4>
          <ul className="space-y-2 ml-6 list-disc text-gray-300">
            <li>Click "New Client" button on the Clients page</li>
            <li>Fill in contact details (name, company, email, phone)</li>
            <li>Assign a sales rep and set initial status</li>
            <li>Save to add them to your pipeline</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Client Statuses</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs font-medium">Prospect</span>
              <span className="text-sm text-gray-300">Initial contact, not yet qualified</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-xs font-medium">Qualified</span>
              <span className="text-sm text-gray-300">Meets criteria, ready for demo</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-xs font-medium">Negotiation</span>
              <span className="text-sm text-gray-300">Discussing terms and pricing</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs font-medium">Closed Won</span>
              <span className="text-sm text-gray-300">Deal successfully closed</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs font-medium">Closed Lost</span>
              <span className="text-sm text-gray-300">Deal did not proceed</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Viewing Call History</h4>
          <p className="text-gray-300 mb-2">
            Click on any client folder to expand and view all calls made to that client. Each call shows:
          </p>
          <ul className="space-y-1 ml-6 list-disc text-gray-300">
            <li>Call number and date</li>
            <li>Status and outcome</li>
            <li>Sentiment analysis</li>
            <li>Next action items</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'calls',
    title: 'Making & Analyzing Calls',
    icon: Phone,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Call Workflow</h3>
          <p className="text-gray-300 mb-4">
            Talkio handles the entire call lifecycle from initiation to analysis.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Initiating a Call</h4>
          <ol className="space-y-2 ml-6 list-decimal text-gray-300">
            <li>Navigate to the Clients page</li>
            <li>Find your client and click the phone icon</li>
            <li>The system will initiate the call via Twilio</li>
            <li>Call is automatically recorded and transcribed</li>
          </ol>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Post-Call Analysis</h4>
          <p className="text-gray-300 mb-3">
            After each call, AI analyzes the conversation and provides:
          </p>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-950/30 rounded-r">
              <p className="font-medium text-sm text-white">Performance Scores (0-100)</p>
              <p className="text-xs text-gray-300">Opening, Discovery, Presentation, Closing, Overall</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-950/30 rounded-r">
              <p className="font-medium text-sm text-white">Strengths & Improvements</p>
              <p className="text-xs text-gray-300">What you did well and areas to improve</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-950/30 rounded-r">
              <p className="font-medium text-sm text-white">Objection Detection</p>
              <p className="text-xs text-gray-300">Identified objections with suggested responses</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-950/30 rounded-r">
              <p className="font-medium text-sm text-white">Coaching Tips</p>
              <p className="text-xs text-gray-300">Personalized suggestions for improvement</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Understanding Risk Levels</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs font-medium">LOW</span>
              <span className="text-sm text-gray-300">Call went well, high chance of progression</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-xs font-medium">MEDIUM</span>
              <span className="text-sm text-gray-300">Some concerns but recoverable</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs font-medium">HIGH</span>
              <span className="text-sm text-gray-300">Major issues, deal at risk</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'live-copilot',
    title: 'Live Copilot',
    icon: Mic,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Real-Time AI Assistance</h3>
          <p className="text-gray-300 mb-4">
            Get live suggestions and coaching during your sales calls.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">How It Works</h4>
          <ol className="space-y-2 ml-6 list-decimal text-gray-300">
            <li>Navigate to Live Copilot page</li>
            <li>Start a demo session or paste live transcript</li>
            <li>AI tracks the current stage of your call</li>
            <li>Receive real-time suggestions and prompts</li>
          </ol>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Suggestion Types</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-950/50 rounded">
                <Lightbulb className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">Prompts</p>
                <p className="text-xs text-gray-300">Suggested questions to ask the prospect</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-950/50 rounded">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">Warnings</p>
                <p className="text-xs text-gray-300">Objections detected that need addressing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-950/50 rounded">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">Tips</p>
                <p className="text-xs text-gray-300">Coaching insights and best practices</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Sales Stages</h4>
          <p className="text-gray-300 mb-3">
            The copilot tracks your progress through these stages:
          </p>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="px-2 py-1 bg-blue-600 text-white rounded">Introduction</span>
            <ChevronRight className="h-4 w-4 text-gray-500" />
            <span className="px-2 py-1 bg-gray-700 text-gray-200 rounded">Discovery</span>
            <ChevronRight className="h-4 w-4 text-gray-500" />
            <span className="px-2 py-1 bg-gray-700 text-gray-200 rounded">Presentation</span>
            <ChevronRight className="h-4 w-4 text-gray-500" />
            <span className="px-2 py-1 bg-gray-700 text-gray-200 rounded">Negotiation</span>
            <ChevronRight className="h-4 w-4 text-gray-500" />
            <span className="px-2 py-1 bg-gray-700 text-gray-200 rounded">Close</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Manual Input</h4>
          <p className="text-gray-300">
            You can paste transcript snippets or type notes manually to get AI suggestions even without a live connection.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'playbooks',
    title: 'Playbooks',
    icon: BookOpen,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Sales Playbooks</h3>
          <p className="text-gray-300 mb-4">
            Define your sales methodology and ensure consistent execution across your team.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">What is a Playbook?</h4>
          <p className="text-gray-300 mb-3">
            A playbook is a structured framework that defines:
          </p>
          <ul className="space-y-2 ml-6 list-disc text-gray-300">
            <li>Sales stages and their success criteria</li>
            <li>Required discovery questions</li>
            <li>Common objections and how to handle them</li>
            <li>Recommended phrases and language</li>
            <li>Phrases to avoid</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Creating a Playbook</h4>
          <ol className="space-y-2 ml-6 list-decimal text-gray-300">
            <li>Navigate to Playbooks page</li>
            <li>Click "New Playbook"</li>
            <li>Define your sales stages</li>
            <li>Add required questions for each stage</li>
            <li>Document common objections and responses</li>
            <li>Set as default for your organization</li>
          </ol>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">How Playbooks Improve Performance</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-white">Consistent Execution</p>
                <p className="text-xs text-gray-300">Every rep follows the same proven methodology</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-white">Better Coaching</p>
                <p className="text-xs text-gray-300">AI evaluates calls against your specific standards</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-white">Faster Onboarding</p>
                <p className="text-xs text-gray-300">New reps learn your methodology quickly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    icon: Lightbulb,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Tips for Success</h3>
          <p className="text-gray-300 mb-4">
            Get the most out of Talkio with these proven strategies.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Before the Call</h4>
          <ul className="space-y-2 ml-6 list-disc text-gray-300">
            <li>Review the client's previous call history and notes</li>
            <li>Check the playbook for required questions</li>
            <li>Set clear objectives for the call</li>
            <li>Have the Live Copilot ready for real-time assistance</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">During the Call</h4>
          <ul className="space-y-2 ml-6 list-disc text-gray-300">
            <li>Follow the sales stages in order</li>
            <li>Ask open-ended discovery questions</li>
            <li>Listen for objections and address them immediately</li>
            <li>Use the Live Copilot suggestions when stuck</li>
            <li>Take notes on key points and next steps</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">After the Call</h4>
          <ul className="space-y-2 ml-6 list-disc text-gray-300">
            <li>Review the AI analysis within 24 hours</li>
            <li>Focus on 1-2 improvement areas per call</li>
            <li>Update client status and next actions</li>
            <li>Share coaching tips with your manager</li>
            <li>Practice handling objections that came up</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Scoring Guidelines</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs font-medium">90-100</span>
              <span className="text-sm text-gray-300">Exceptional performance, best practices followed</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-medium">70-89</span>
              <span className="text-sm text-gray-300">Good performance, met expectations</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-xs font-medium">50-69</span>
              <span className="text-sm text-gray-300">Needs improvement, review coaching tips</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs font-medium">&lt;50</span>
              <span className="text-sm text-gray-300">Significant issues, requires immediate coaching</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Common Objections</h4>
          <p className="text-gray-300 mb-3">
            Be prepared to handle these frequent objections:
          </p>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-gray-800/50 rounded">
              <p className="font-medium text-white">Price: "It's too expensive"</p>
              <p className="text-xs text-gray-300 mt-1">Focus on ROI and value, not cost</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded">
              <p className="font-medium text-white">Timing: "Not the right time"</p>
              <p className="text-xs text-gray-300 mt-1">Uncover the real reason, create urgency</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded">
              <p className="font-medium text-white">Authority: "I need to check with my boss"</p>
              <p className="text-xs text-gray-300 mt-1">Identify decision makers early</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded">
              <p className="font-medium text-white">Competition: "We're looking at other options"</p>
              <p className="text-xs text-gray-300 mt-1">Differentiate your unique value</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'settings',
    title: 'Settings & Admin',
    icon: Settings,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Organization Settings</h3>
          <p className="text-gray-300 mb-4">
            Configure your organization's preferences and features.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">User Roles</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs font-medium">ADMIN</span>
              <span className="text-sm text-gray-300">Full access, manage users and settings</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-medium">MANAGER</span>
              <span className="text-sm text-gray-300">View team performance, manage playbooks</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs font-medium">REP</span>
              <span className="text-sm text-gray-300">Make calls, view own performance</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Feature Flags</h4>
          <ul className="space-y-2 ml-6 list-disc text-gray-300">
            <li><span className="font-medium text-white">Live Copilot:</span> Enable/disable real-time assistance</li>
            <li><span className="font-medium text-white">Voice Playback:</span> Allow audio playback of recordings</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Data Retention</h4>
          <p className="text-gray-300 mb-2">
            Configure how long call data is stored (default: 365 days)
          </p>
          <div className="p-3 bg-yellow-950/30 border border-yellow-800/50 rounded">
            <p className="text-sm text-yellow-300">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Ensure compliance with your industry's data retention policies
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Integrations</h4>
          <ul className="space-y-2 ml-6 list-disc text-gray-300">
            <li><span className="font-medium text-white">Twilio:</span> Phone system for making and recording calls</li>
            <li><span className="font-medium text-white">Clerk:</span> Authentication and user management</li>
            <li><span className="font-medium text-white">Google Gemini:</span> AI analysis and suggestions</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Audit Logs</h4>
          <p className="text-gray-300">
            All actions are logged for security and compliance. Admins can view:
          </p>
          <ul className="space-y-1 ml-6 list-disc text-gray-300 mt-2">
            <li>User actions and timestamps</li>
            <li>Call creation and analysis</li>
            <li>Playbook modifications</li>
            <li>Settings changes</li>
          </ul>
        </div>
      </div>
    ),
  },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started')

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-semibold text-lg text-white">Talkio</span>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-gray-400">Documentation</span>
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-gray-800 bg-gray-900/30 overflow-y-auto sticky top-16 h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-left',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{section.title}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <div className="max-w-4xl mx-auto p-8 space-y-12">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <div key={section.id} id={section.id} className="scroll-mt-8">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-600/20 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                    </div>
                    <div className="prose prose-sm max-w-none prose-invert">
                      {section.content}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
