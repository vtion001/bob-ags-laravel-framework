'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Call } from '@/lib/types'

interface UseCallsOptions {
  limit?: number
  hours?: number
  agentId?: string
}

interface UseCallsReturn {
  calls: Call[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCalls(options: UseCallsOptions = {}): UseCallsReturn {
  const { limit = 100, hours = 24, agentId } = options
  const [calls, setCalls] = useState<Call[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCalls = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = `/api/ctm/calls?limit=${limit}&hours=${hours}`
      if (agentId) url += `&agent_id=${agentId}`
      
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch calls')
      const data = await res.json()
      setCalls(data.calls || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setCalls([])
    } finally {
      setIsLoading(false)
    }
  }, [limit, hours, agentId])

  useEffect(() => {
    fetchCalls()
  }, [fetchCalls])

  return { calls, isLoading, error, refetch: fetchCalls }
}
