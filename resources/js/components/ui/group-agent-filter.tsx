'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

interface BaseAgent {
  id: string
  name: string
  uid?: number
  agent_id?: string
}

interface BaseUserGroup {
  id: string
  name: string
  userIds: number[]
}

interface GroupAgentFilterProps<TAgent extends BaseAgent = BaseAgent, TGroup extends BaseUserGroup = BaseUserGroup> {
  userGroups: TGroup[]
  allAgents: TAgent[]
  selectedGroup: string
  selectedAgent: string
  onGroupChange: (groupId: string) => void
  onAgentChange: (agentId: string) => void
  getAgentUid: (agent: TAgent) => number | undefined
  className?: string
}

interface GroupWithAgents<TAgent extends BaseAgent> {
  id: string
  name: string
  userIds: number[]
  agents: TAgent[]
}

export default function GroupAgentFilter<TAgent extends BaseAgent, TGroup extends BaseUserGroup>({
  userGroups,
  allAgents,
  selectedGroup,
  selectedAgent,
  onGroupChange,
  onAgentChange,
  getAgentUid,
  className = '',
}: GroupAgentFilterProps<TAgent, TGroup>) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  const groupsWithAgents: GroupWithAgents<TAgent>[] = userGroups.map(group => ({
    ...group,
    agents: allAgents.filter(agent => {
      const uid = getAgentUid(agent)
      return uid !== undefined && group.userIds.includes(uid)
    }),
  }))

  const getButtonLabel = () => {
    if (selectedAgent !== 'all' && selectedAgent !== '') {
      const agent = allAgents.find(a => String(a.id) === String(selectedAgent) || String((a as any).agent_id) === String(selectedAgent))
      return agent?.name || 'All Agents'
    }
    if (selectedGroup !== 'all' && selectedGroup !== '') {
      const group = userGroups.find(g => String(g.id) === String(selectedGroup))
      if (group) {
        const count = allAgents.filter(a => {
          const uid = getAgentUid(a)
          return uid !== undefined && group.userIds.includes(uid)
        }).length
        return `${group.name} (${count})`
      }
    }
    return 'All Agents'
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full px-3 py-2 rounded-lg border bg-white text-left
          flex items-center justify-between gap-2
          transition-all duration-200
          focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20
          border-navy-200 text-navy-900 hover:border-navy-400
        "
      >
        <span className="text-navy-900">{getButtonLabel()}</span>
        <ChevronDownIcon
          className="w-4 h-4 text-navy-400 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-navy-200 shadow-xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => {
                onGroupChange('all')
                onAgentChange('all')
                setIsOpen(false)
              }}
              className={`
                w-full px-4 py-2.5 text-left flex items-center justify-between
                transition-colors duration-150 hover:bg-navy-50 cursor-pointer
                ${(selectedGroup === 'all' || selectedGroup === '') && (selectedAgent === 'all' || selectedAgent === '') ? 'bg-navy-100' : ''}
              `}
            >
              <span className="font-medium text-navy-700">All Agents</span>
              <span className="text-xs text-navy-400">{allAgents.length}</span>
            </button>

            <div className="border-t border-navy-100 my-1" />

            {groupsWithAgents.map(group => (
              <div key={group.id}>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={`
                      flex-1 px-4 py-2.5 text-left flex items-center justify-between
                      transition-colors duration-150 hover:bg-navy-50 cursor-pointer
                      ${selectedGroup === String(group.id) && (selectedAgent === 'all' || selectedAgent === '') ? 'bg-navy-100' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRightIcon
                        className={`w-4 h-4 text-navy-400 transition-transform duration-200 ${
                          expandedGroups.has(String(group.id)) ? 'rotate-90' : ''
                        }`}
                      />
                      <span className="font-medium text-navy-700">{group.name}</span>
                    </div>
                    <span className="text-xs text-navy-400">{group.agents.length}</span>
                  </button>
                </div>

                {expandedGroups.has(String(group.id)) && (
                  <div className="bg-navy-50/50">
                    <button
                      type="button"
                      onClick={() => {
                        onGroupChange(String(group.id))
                        onAgentChange('all')
                        setIsOpen(false)
                      }}
                      className={`
                        w-full px-4 py-2 pl-10 text-left flex items-center justify-between
                        transition-colors duration-150 hover:bg-navy-100 cursor-pointer
                        ${selectedGroup === String(group.id) && (selectedAgent === 'all' || selectedAgent === '') ? 'bg-navy-200' : ''}
                      `}
                    >
                      <span className="text-navy-600">All in {group.name}</span>
                      <span className="text-xs text-navy-400">{group.agents.length}</span>
                    </button>
                    {group.agents.map(agent => {
                      const agentId = String(agent.id)
                      return (
                        <button
                          key={agentId}
                          type="button"
                          onClick={() => {
                            onAgentChange(agentId)
                            onGroupChange(String(group.id))
                            setIsOpen(false)
                          }}
                          className={`
                            w-full px-4 py-2 pl-10 text-left flex items-center justify-between
                            transition-colors duration-150 hover:bg-navy-100 cursor-pointer
                            ${selectedAgent === agentId ? 'bg-navy-200' : ''}
                          `}
                        >
                          <span className="text-navy-600">{agent.name}</span>
                          {selectedAgent === agentId && (
                            <svg className="w-4 h-4 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            {groupsWithAgents.length === 0 && (
              <div className="px-4 py-6 text-center text-navy-400">
                No groups available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}