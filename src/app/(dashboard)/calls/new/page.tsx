'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCallPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    prospect: '',
    company: '',
    transcript: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Submit to API
    // For now, simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    router.push('/calls')
  }

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="New Call" 
        description="Upload a transcript for AI analysis"
        actions={
          <Link href="/calls">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calls
            </Button>
          </Link>
        }
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Call Details */}
            <Card>
              <CardHeader>
                <CardTitle>Call Details</CardTitle>
                <CardDescription>
                  Basic information about the sales call
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Call Title"
                  placeholder="e.g., Discovery Call with Acme Corp"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Prospect Name"
                    placeholder="e.g., John Smith"
                    value={formData.prospect}
                    onChange={(e) => setFormData({ ...formData, prospect: e.target.value })}
                  />
                  <Input
                    label="Company"
                    placeholder="e.g., Acme Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Transcript Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Transcript</CardTitle>
                <CardDescription>
                  Paste the call transcript or upload a file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload area */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">
                    Drag & drop a transcript file
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Supports .txt, .md, .doc files
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or paste directly
                    </span>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Paste your call transcript here...

Example format:
[00:00] Rep: Hi, this is Sarah from Talkio. Am I speaking with John?
[00:05] Prospect: Yes, this is John.
[00:08] Rep: Great! Thanks for taking my call..."
                  value={formData.transcript}
                  onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                  className="min-h-[300px] font-mono text-sm"
                />
              </CardContent>
            </Card>
            
            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Link href="/calls">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                isLoading={isSubmitting}
                disabled={!formData.title || !formData.transcript}
              >
                Analyze Call
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
