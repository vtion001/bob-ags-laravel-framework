'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Agent } from '@/lib/types'

interface UseAgentsReturn {
  agents: Agent[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAgents(): UseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ctm/agents')
      if (!res.ok) throw new Error('Failed to fetch agents')
      const data = await res.json()
      setAgents(data.agents || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setAgents([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return { agents, isLoading, error, refetch: fetchAgents }
}
