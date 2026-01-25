'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    industry: '',
    contactEmail: '',
    contactPhone: '',
    initialNotes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create client')
      }

      router.push('/clients')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = 
    formData.clientName && 
    formData.companyName && 
    formData.industry && 
    formData.contactEmail && 
    formData.contactPhone

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="New Client" 
        description="Add a new client to start tracking calls"
        actions={
          <Link href="/clients">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-base">
                {error}
              </div>
            )}

            <Card>
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <UserPlus className="h-6 w-6" />
                  Client Information
                </CardTitle>
                <CardDescription className="text-base">
                  Enter the client details below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Name & Company - side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="relative">
                    <Input
                      label="Client Name"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="relative">
                    <Input
                      label="Company"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                {/* Industry */}
                <Input
                  label="Industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  required
                  className="h-12 text-base"
                />

                {/* Email & Phone - side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                    className="h-12 text-base"
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                    className="h-12 text-base"
                  />
                </div>

                {/* Notes */}
                <Textarea
                  placeholder="Notes (optional)"
                  value={formData.initialNotes}
                  onChange={(e) => setFormData({ ...formData, initialNotes: e.target.value })}
                  className="min-h-[120px] resize-none text-base"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Link href="/clients">
                <Button type="button" variant="outline" className="h-11 px-6 text-base">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                isLoading={isSubmitting}
                disabled={!isFormValid}
                className="h-11 px-6 text-base"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Add Client
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
