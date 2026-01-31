'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'
import Link from 'next/link'

export default function CallsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Calls" 
        description="Browse and manage your sales calls"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">View Calls from Clients</h3>
              <p className="text-muted-foreground mb-4">
                All calls are organized by client. Navigate to the Clients section to view call history.
              </p>
              <Link href="/clients">
                <Button>
                  View Clients
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
