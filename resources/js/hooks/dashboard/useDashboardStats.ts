'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DashboardStats } from '@/lib/types'

interface UseDashboardStatsReturn {
  stats: DashboardStats
  recentCalls: import('@/lib/types').Call[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardStats(limit: number = 100, hours: number = 168): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 0,
    analyzed: 0,
    hotLeads: 0,
    avgScore: '0',
  })
  const [recentCalls, setRecentCalls] = useState<import('@/lib/types').Call[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ctm/dashboard/stats?limit=${limit}&hours=${hours}`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data.stats)
      setRecentCalls(data.recentCalls || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [limit, hours])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, recentCalls, isLoading, error, refetch: fetchStats }
}
