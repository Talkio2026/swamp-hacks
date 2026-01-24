'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Skeleton } from '@/components/ui/skeleton'
import { Phone, CheckCircle, AlertTriangle, Clock, ArrowUpRight, Users, Zap, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalCalls: number
  completedCalls: number
  highRiskCalls: number
  processingCalls: number
  recentCalls: Array<{
    id: string
    title: string
    callDate: string
    duration: number
    rep: { firstName: string; lastName: string }
  }>
  objectionStats: Array<{ type: string; count: number }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="flex flex-col h-full bg-[#F5F7FA]">
      <Header 
        title="Dashboard" 
        description="Overview of your sales activity"
      />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Calls */}
          <div className="rounded-xl border border-[#E0E7FF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-medium text-[#4338CA] uppercase tracking-wider">Total Calls</span>
              <div className="h-9 w-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                <Phone className="h-4 w-4 text-[#4F46E5]" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-[28px] font-bold text-[#1E1B4B] tracking-tight">{stats?.totalCalls ?? 0}</div>
            )}
          </div>

          {/* Completed */}
          <div className="rounded-xl border border-[#E0E7FF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-medium text-[#4338CA] uppercase tracking-wider">Completed</span>
              <div className="h-9 w-9 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-[#10B981]" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-[28px] font-bold text-[#1E1B4B] tracking-tight">{stats?.completedCalls ?? 0}</div>
            )}
          </div>

          {/* High Risk */}
          <div className="rounded-xl border border-[#E0E7FF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-medium text-[#4338CA] uppercase tracking-wider">High Risk</span>
              <div className="h-9 w-9 rounded-lg bg-[#FEE2E2] flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-[28px] font-bold text-[#1E1B4B] tracking-tight">{stats?.highRiskCalls ?? 0}</div>
            )}
          </div>

          {/* Processing */}
          <div className="rounded-xl border border-[#E0E7FF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-medium text-[#4338CA] uppercase tracking-wider">Processing</span>
              <div className="h-9 w-9 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
                <Clock className="h-4 w-4 text-[#F59E0B]" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-[28px] font-bold text-[#1E1B4B] tracking-tight">{stats?.processingCalls ?? 0}</div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Calls - Takes 2 columns */}
          <div className="lg:col-span-2 rounded-xl border border-[#E0E7FF] bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-[#E0E7FF]">
              <h2 className="text-[13px] font-semibold text-[#1E1B4B]">Recent Calls</h2>
            </div>
            <div className="p-3">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-[#4338CA] text-[12px] p-4">{error}</p>
              ) : stats?.recentCalls?.length ? (
                <div className="space-y-1">
                  {stats.recentCalls.map((call) => (
                    <Link 
                      key={call.id} 
                      href={`/calls/${call.id}`}
                      className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[#F5F7FA] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center group-hover:bg-[#E0E7FF] transition-colors">
                          <Phone className="h-4 w-4 text-[#4F46E5]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[#1E1B4B] group-hover:text-[#4F46E5] transition-colors">{call.title}</p>
                          <p className="text-[11px] text-[#A5B4FC]">
                            {call.rep.firstName} {call.rep.lastName} · {new Date(call.callDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] text-[#A5B4FC] font-mono">
                          {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-[#C7D2FE] group-hover:text-[#4F46E5] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4">
                    <Phone className="h-5 w-5 text-[#4F46E5]" />
                  </div>
                  <p className="text-[13px] text-[#4338CA]">No calls yet</p>
                  <p className="text-[11px] text-[#A5B4FC] mt-1">Start making calls to see your history</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[#E0E7FF] bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-[#E0E7FF]">
              <h2 className="text-[13px] font-semibold text-[#1E1B4B]">Quick Actions</h2>
            </div>
            <div className="p-3 space-y-1">
              <Link 
                href="/calls/new"
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#F5F7FA] transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center group-hover:bg-[#E0E7FF] transition-colors">
                  <Zap className="h-4 w-4 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1E1B4B] group-hover:text-[#4F46E5] transition-colors">New Call</p>
                  <p className="text-[11px] text-[#A5B4FC]">Record a sales call</p>
                </div>
              </Link>
              
              <Link 
                href="/clients"
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#F5F7FA] transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center group-hover:bg-[#E0E7FF] transition-colors">
                  <Users className="h-4 w-4 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1E1B4B] group-hover:text-[#4F46E5] transition-colors">Clients</p>
                  <p className="text-[11px] text-[#A5B4FC]">Manage prospects</p>
                </div>
              </Link>
              
              <Link 
                href="/playbooks"
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#F5F7FA] transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center group-hover:bg-[#E0E7FF] transition-colors">
                  <BookOpen className="h-4 w-4 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1E1B4B] group-hover:text-[#4F46E5] transition-colors">Playbooks</p>
                  <p className="text-[11px] text-[#A5B4FC]">Sales strategies</p>
                </div>
              </Link>

              <Link 
                href="/training"
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#F5F7FA] transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center group-hover:bg-[#E0E7FF] transition-colors">
                  <svg className="h-4 w-4 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1E1B4B] group-hover:text-[#4F46E5] transition-colors">Training</p>
                  <p className="text-[11px] text-[#A5B4FC]">Practice sessions</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
