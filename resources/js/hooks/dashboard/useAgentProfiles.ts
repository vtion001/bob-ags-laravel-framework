import { useState, useEffect, useCallback } from 'react'

interface CTMAgent {
  id: string
  name: string
  email: string
}

export interface AgentProfile {
  id: number
  name: string
  agent_id: string
  email: string | null
  phone: string | null
  notes: string | null
  status?: string
  created_at: string
}

interface UseAgentProfilesReturn {
  agents: AgentProfile[]
  ctmAgents: CTMAgent[]
  isLoading: boolean
  isFetchingCTM: boolean
  error: string | null
  showForm: boolean
  setShowForm: (v: boolean) => void
  showCTMFetch: boolean
  setShowCTMFetch: (v: boolean) => void
  editingAgent: AgentProfile | null
  setEditingAgent: (a: AgentProfile | null) => void
  formData: {
    name: string
    agentId: string
    email: string
    phone: string
    notes: string
  }
  setFormData: (d: typeof initialFormData) => void
  fetchAgents: () => Promise<void>
  fetchCTMAgents: () => Promise<void>
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleEdit: (agent: AgentProfile) => void
  handleDelete: (id: number) => Promise<void>
  handleAddCTMAgent: (ctmAgent: CTMAgent) => void
  handleAddAllCTMAgents: () => Promise<void>
  resetForm: () => void
}

const initialFormData = {
  name: '',
  agentId: '',
  email: '',
  phone: '',
  notes: '',
}

async function safeJson(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    // HTML response (like redirect to login) - read as text for error message
    const text = await response.text()
    throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`)
  }
  return response.json()
}

export function useAgentProfiles(): UseAgentProfilesReturn {
  const [agents, setAgents] = useState<AgentProfile[]>([])
  const [ctmAgents, setCtmAgents] = useState<CTMAgent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showCTMFetch, setShowCTMFetch] = useState(false)
  const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingCTM, setIsFetchingCTM] = useState(false)

  const fetchAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/agent-profiles', { credentials: 'include' })
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch agent profiles`)
      const data = await safeJson(response)
      setAgents(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const fetchCTMAgents = useCallback(async () => {
    setIsFetchingCTM(true)
    setError(null)
    try {
      const response = await fetch('/api/ctm/agents/all', { credentials: 'include' })
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch CTM agents`)
      const data = await safeJson(response)
      setCtmAgents(data.data?.agents || [])
      setShowCTMFetch(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsFetchingCTM(false)
    }
  }, [])

  const handleAddCTMAgent = useCallback((ctmAgent: CTMAgent) => {
    setFormData({
      name: ctmAgent.name,
      agentId: ctmAgent.id,
      email: ctmAgent.email,
      phone: '',
      notes: '',
    })
    setEditingAgent(null)
    setShowForm(true)
    setShowCTMFetch(false)
  }, [])

  const handleAddAllCTMAgents = useCallback(async () => {
    const existingAgentIds = agents.map(a => a.agent_id)
    const newAgents = ctmAgents.filter(a => !existingAgentIds.includes(a.id))

    if (newAgents.length === 0) {
      setError('All CTM agents already exist in your profiles')
      return
    }

    try {
      const response = await fetch('/api/agent-profiles/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ agents: newAgents }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to add agents`)
      await safeJson(response)
      fetchAgents()
      setShowCTMFetch(false)
    } catch (err: any) {
      setError(err.message)
    }
  }, [agents, ctmAgents, fetchAgents])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.agentId) {
      setError('Name and Agent ID are required')
      return
    }

    try {
      const url = editingAgent ? `/api/agent-profiles/${editingAgent.id}` : '/api/agent-profiles'
      const method = editingAgent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          agent_id: formData.agentId,
          email: formData.email || null,
          phone: formData.phone || null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) throw new Error(editingAgent ? `HTTP ${response.status}: Failed to update agent` : `HTTP ${response.status}: Failed to create agent`)

      await safeJson(response)
      resetForm()
      fetchAgents()
    } catch (err: any) {
      setError(err.message)
    }
  }, [formData, editingAgent, fetchAgents])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setEditingAgent(null)
    setShowForm(false)
    setError(null)
  }, [])

  const handleEdit = useCallback((agent: AgentProfile) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.name,
      agentId: agent.agent_id,
      email: agent.email || '',
      phone: agent.phone || '',
      notes: agent.notes || '',
    })
    setShowForm(true)
  }, [])

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this agent profile?')) return

    try {
      const response = await fetch(`/api/agent-profiles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to delete agent`)
      fetchAgents()
    } catch (err: any) {
      setError(err.message)
    }
  }, [fetchAgents])

  return {
    agents,
    ctmAgents,
    isLoading,
    isFetchingCTM,
    error,
    showForm,
    setShowForm,
    showCTMFetch,
    setShowCTMFetch,
    editingAgent,
    setEditingAgent,
    formData,
    setFormData,
    fetchAgents,
    fetchCTMAgents,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleAddCTMAgent,
    handleAddAllCTMAgents,
    resetForm,
  }
}