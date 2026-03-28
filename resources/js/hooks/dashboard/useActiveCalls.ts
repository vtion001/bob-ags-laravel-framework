'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Call } from '@/lib/types'

interface UseActiveCallsReturn {
  activeCalls: Call[]
  isMonitoring: boolean
  startMonitoring: () => void
  stopMonitoring: () => void
  pollingInterval: number
  setPollingInterval: (interval: number) => void
}

export function useActiveCalls(defaultInterval: number = 3): UseActiveCallsReturn {
  const [activeCalls, setActiveCalls] = useState<Call[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [pollingInterval, setPollingInterval] = useState(defaultInterval)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchActiveCalls = useCallback(async () => {
    try {
      const res = await fetch('/api/ctm/active-calls')
      if (!res.ok) throw new Error('Failed to fetch active calls')
      const data = await res.json()
      setActiveCalls(data.calls || [])
    } catch (err) {
      console.error('Error fetching active calls:', err)
    }
  }, [])

  const startMonitoring = useCallback(() => {
    if (!isMonitoring) {
      setIsMonitoring(true)
      fetchActiveCalls()
      intervalRef.current = setInterval(fetchActiveCalls, pollingInterval * 1000)
    }
  }, [isMonitoring, pollingInterval, fetchActiveCalls])

  const stopMonitoring = useCallback(() => {
    if (isMonitoring) {
      setIsMonitoring(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isMonitoring])

  useEffect(() => {
    if (isMonitoring) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      intervalRef.current = setInterval(fetchActiveCalls, pollingInterval * 1000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isMonitoring, pollingInterval, fetchActiveCalls])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    activeCalls,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    pollingInterval,
    setPollingInterval,
  }
}
