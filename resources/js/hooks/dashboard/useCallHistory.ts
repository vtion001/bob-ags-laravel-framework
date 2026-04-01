import { useState, useEffect, useRef, useCallback } from 'react'
import { Call } from '@/lib/ctm'

interface AgentProfile {
  id: string
  name: string
  agent_id: string
  email?: string
  groupId?: string
  groupName?: string
}

interface UserGroup {
  id: string
  name: string
  userIds: number[]
}

interface UseCallHistoryOptions {
  agentIdFilter?: string
}

interface UseCallHistoryReturn {
  calls: Call[]
  filteredCalls: Call[]
  agentProfiles: AgentProfile[]
  userGroups: UserGroup[]
  isLoading: boolean
  isRefreshing: boolean
  isSearching: boolean
  isSyncing: boolean
  error: string | null
  searchQuery: string
  setSearchQuery: (q: string) => void
  agentIdFilter: string
  setAgentIdFilter: (id: string) => void
  groupFilter: string
  setGroupFilter: (id: string) => void
  analyzedOnly: boolean
  setAnalyzedOnly: (v: boolean) => void
  dateRange: { start: string; end: string }
  setDateRange: (r: { start: string; end: string }) => void
  scoreFilter: { min: number; max: number }
  setScoreFilter: (f: { min: number; max: number }) => void
  handleRefresh: () => void
  handleSearch: () => Promise<void>
  handleExport: () => void
}

// Extended Call interface to include agentId from CallAPIResponse
interface CallWithAgentId extends Call {
  agentId?: string | null
  agentName?: string | null
}

function dedupeCalls(calls: Call[]): Call[] {
  const seen = new Set<string>()
  return calls.filter(call => {
    if (seen.has(call.id)) return false
    seen.add(call.id)
    return true
  })
}

export function useCallHistory(options: UseCallHistoryOptions = {}): UseCallHistoryReturn {
  const [searchQuery, setSearchQuery] = useState('')
  const [agentIdFilter, setAgentIdFilter] = useState(options.agentIdFilter || '')
  const [agentProfiles, setAgentProfiles] = useState<AgentProfile[]>([])
  const [userGroups, setUserGroups] = useState<UserGroup[]>([])
  const [groupFilter, setGroupFilter] = useState('')
  const [analyzedOnly, setAnalyzedOnly] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [scoreFilter, setScoreFilter] = useState({ min: 0, max: 100 })
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([])
  const [allCalls, setAllCalls] = useState<Call[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastSeenTimestamp = useRef<string | null>(null)

  useEffect(() => {
    const fetchAgentsAndGroups = async () => {
      try {
        const res = await fetch('/api/ctm/agents', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          // Laravel returns { data: [...agents...] }
          const agentsData = data.data || []
          console.log('[useCallHistory] API /api/ctm/agents response:', {
            agentsCount: agentsData.length,
            firstAgent: agentsData[0]
          })
          if (agentsData.length > 0) {
            const mappedAgents = agentsData.map((agent: any) => ({
              id: agent.id || agent.uid?.toString() || '',
              name: agent.name || agent.full_name || 'Unknown',
              agent_id: agent.uid?.toString() || agent.id || '',
              email: agent.email || '',
            }))
            console.log('[useCallHistory] Mapped agentProfiles:', mappedAgents.slice(0, 3))
            setAgentProfiles(mappedAgents)
          }
        }
      } catch (err) {
        console.error('Failed to fetch agents/groups:', err)
      }
    }
    fetchAgentsAndGroups()
  }, [])

  const mergeNewCalls = useCallback((incoming: Call[]) => {
    setAllCalls(prev => {
      const existingIds = new Set(prev.map(c => c.id))
      const trulyNew = incoming.filter(c => !existingIds.has(c.id))
      if (trulyNew.length === 0) return prev
      const merged = dedupeCalls([...trulyNew, ...prev])
      merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      return merged
    })
  }, [])

  const fetchCalls = useCallback(async (options: { mode?: 'initial' | 'poll' | 'refresh'; blocking?: boolean } = {}) => {
    const { mode = 'poll', blocking = false } = options

    if (blocking) {
      setIsRefreshing(true)
      setError(null)
    } else if (mode === 'poll') {
      setIsSyncing(true)
      setError(null)
    } else {
      setIsLoading(true)
      setError(null)
    }

    try {
      const agentParam = agentIdFilter ? `&agentId=${encodeURIComponent(agentIdFilter)}` : ''

      if (mode === 'initial') {
        // Fetch from Laravel API proxy — returns { data: [...calls...] }
        const res = await fetch(`/api/ctm/calls?limit=200${agentParam}`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch calls')
        const data = await res.json()
        const calls: Call[] = dedupeCalls(data.data || [])
        if (calls.length > 0) {
          setAllCalls(calls)
        }
      } else {
        // Poll for new calls — only fetch latest via the history endpoint
        const url = `/api/ctm/calls?limit=200${agentParam}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch calls')
        const data = await res.json()
        const incoming: Call[] = dedupeCalls(data.data || [])
        if (incoming.length > 0) mergeNewCalls(incoming)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
      setIsSyncing(false)
    }
  }, [agentIdFilter, mergeNewCalls])

  useEffect(() => {
    fetchCalls({ mode: 'initial' })
  }, [fetchCalls])

  useEffect(() => {
    const interval = setInterval(() => fetchCalls({ mode: 'poll' }), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchCalls])

  useEffect(() => {
    let results = [...allCalls]

    if (searchQuery) {
      const normalizedQuery = searchQuery.replace(/\D/g, '')
      console.log('[useCallHistory] Phone search:', { searchQuery, normalizedQuery, totalCalls: results.length })
      
      const beforeCount = results.length
      results = results.filter(call => {
        const phoneFields = [
          call.phone,
          call.callerNumber,
          call.trackingNumber,
          call.destinationNumber,
          call.poolNumber,
          call.didNumber,
        ]
        const matches = phoneFields.some(field => {
          if (!field) return false
          const normalizedField = field.replace(/\D/g, '')
          return normalizedField.includes(normalizedQuery)
        })
        if (matches) {
          console.log('[useCallHistory] Matched call:', {
            id: call.id,
            phone: call.phone,
            callerNumber: call.callerNumber,
            trackingNumber: call.trackingNumber,
            matchedField: phoneFields.find(f => f?.replace(/\D/g, '').includes(normalizedQuery))
          })
        }
        return matches
      })
      console.log('[useCallHistory] Phone search results:', { before: beforeCount, after: results.length })
    }

    if (analyzedOnly) {
      results = results.filter(call => call.score !== undefined && call.score !== null && call.score > 0)
    }

    // DEBUG: Log group filter state
    console.log('[useCallHistory] Group filter DEBUG:', {
      groupFilter,
      userGroupsCount: userGroups.length,
      userGroups: userGroups.map(g => ({ id: g.id, name: g.name, userIds: g.userIds })),
      agentProfilesCount: agentProfiles.length,
      totalCalls: allCalls.length,
      hasGroupFilter: !!groupFilter
    })

    if (groupFilter) {
      const group = userGroups.find(g => g.id === groupFilter)
      console.log('[useCallHistory] Selected group:', group)
      
      if (group) {
        const callsWithAgentData = allCalls.filter(call => {
          // The API returns CallAPIResponse with flat agentId field, not call.agent object
          const callAgentId = (call as any).agentId ?? call.agent?.id ?? ''
          return callAgentId && callAgentId !== ''
        })
        console.log('[useCallHistory] Calls with agentId:', {
          count: callsWithAgentData.length,
          sample: callsWithAgentData.slice(0, 2).map(c => ({
            id: c.id,
            agentId: (c as any).agentId,
            agentObjId: c.agent?.id,
            agentName: c.agent?.name ?? (c as any).agentName
          }))
        })

        results = results.filter(call => {
          // Try both call.agent?.id (for Call type) and call.agentId (for CallAPIResponse)
          const callAgentId = (call as any).agentId ?? call.agent?.id ?? ''
          
          console.log('[useCallHistory] Filtering call:', {
            callId: call.id,
            'call.agent': call.agent,
            'call.agent?.id': call.agent?.id,
            'call.agentId (from API)': (call as any).agentId,
            callAgentId,
            agentProfilesSample: agentProfiles.slice(0, 3).map(a => a.agent_id)
          })

          // agent_id is stored as uid (number) as string, e.g., "123"
          const matchingAgent = agentProfiles.find(a => a.agent_id === callAgentId)
          
          if (!matchingAgent) {
            console.log('[useCallHistory] No agent match for callAgentId:', callAgentId)
            return false
          }
          
          console.log('[useCallHistory] Found matching agent:', matchingAgent)
          
          // group.userIds contains numbers (uid values), matchingAgent.agent_id is also a string number
          const agentUid = Number(matchingAgent.agent_id)
          const isInGroup = group.userIds.includes(agentUid)
          
          console.log('[useCallHistory] Group membership check:', {
            agentUid,
            groupUserIds: group.userIds,
            isInGroup
          })
          
          return isInGroup
        })
      }
    }

    if (scoreFilter.min > 0 || scoreFilter.max < 100) {
      results = results.filter(call =>
        call.score && call.score >= scoreFilter.min && call.score <= scoreFilter.max
      )
    }

    if (dateRange.start) {
      const startDate = new Date(dateRange.start)
      results = results.filter(call => new Date(call.timestamp) >= startDate)
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59, 999)
      results = results.filter(call => new Date(call.timestamp) <= endDate)
    }

    console.log('[useCallHistory] Filter results:', {
      inputCount: allCalls.length,
      outputCount: results.length
    })

    setFilteredCalls(results)
  }, [allCalls, searchQuery, analyzedOnly, groupFilter, scoreFilter, dateRange, userGroups, agentProfiles])

  const handleRefresh = useCallback(() => {
    fetchCalls({ mode: 'refresh', blocking: true })
  }, [fetchCalls])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError(null)
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const normalizedPhone = searchQuery.replace(/\D/g, '')
      const res = await fetch(`/api/ctm/calls/history/search?phone=${encodeURIComponent(normalizedPhone)}&hours=8760`, { credentials: 'include' })
      
      if (!res.ok) {
        throw new Error('Search failed')
      }

      const data = await res.json()
      // Laravel returns { data: [...calls...] }
      const searchedCalls: Call[] = dedupeCalls(data.data || [])
      
      console.log('[useCallHistory] Phone search results:', {
        searchQuery,
        normalizedPhone,
        resultsCount: searchedCalls.length
      })

      if (searchedCalls.length > 0) {
        setAllCalls(searchedCalls)
        setFilteredCalls(searchedCalls)
      } else {
        setError('No calls found for this phone number')
      }
    } catch (err) {
      console.error('Phone search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery])

  const handleExport = useCallback(() => {
    const csv = [
      ['Time', 'Phone', 'Direction', 'Duration', 'Score', 'Status'],
      ...filteredCalls.map(call => [
        new Date(call.timestamp).toISOString(),
        call.phone,
        call.direction,
        `${Math.floor(call.duration / 60)}m ${call.duration % 60}s`,
        call.score || 'N/A',
        call.status,
      ]),
    ]

    const csvContent = csv.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'call_history.csv'
    a.click()
  }, [filteredCalls])

  return {
    calls: allCalls,
    filteredCalls,
    agentProfiles,
    userGroups,
    isLoading,
    isRefreshing,
    isSearching,
    isSyncing,
    error,
    searchQuery,
    setSearchQuery,
    agentIdFilter,
    setAgentIdFilter,
    groupFilter,
    setGroupFilter,
    analyzedOnly,
    setAnalyzedOnly,
    dateRange,
    setDateRange,
    scoreFilter,
    setScoreFilter,
    handleRefresh,
    handleSearch,
    handleExport,
  }
}
