export * from './client'
export * from './transformer'
export * from './services'
export * from './services/calls'
export * from './services/agents'
export * from './services/numbers'
export * from './services/sources'
export * from './services/schedules'
export * from './services/voiceMenus'
export * from './services/receivingNumbers'
export * from './services/accounts'

import { CallsService, createCallsService } from './services/calls'
import { AgentsService, createAgentsService } from './services/agents'
import { NumbersService, createNumbersService } from './services/numbers'
import { SourcesService, createSourcesService } from './services/sources'
import { SchedulesService, createSchedulesService } from './services/schedules'
import { VoiceMenusService, createVoiceMenusService } from './services/voiceMenus'
import { ReceivingNumbersService, createReceivingNumbersService } from './services/receivingNumbers'
import { AccountsService, createAccountsService } from './services/accounts'
import type { Call, Agent, DashboardStats } from '@/lib/types'

export class CTMClient {
  calls: CallsService
  agents: AgentsService
  numbers: NumbersService
  sources: SourcesService
  schedules: SchedulesService
  voiceMenus: VoiceMenusService
  receivingNumbers: ReceivingNumbersService
  accounts: AccountsService

  constructor() {
    this.calls = new CallsService()
    this.agents = new AgentsService()
    this.numbers = new NumbersService()
    this.sources = new SourcesService()
    this.schedules = new SchedulesService()
    this.voiceMenus = new VoiceMenusService()
    this.receivingNumbers = new ReceivingNumbersService()
    this.accounts = new AccountsService()
  }

  getStats(calls: Call[]) {
    const totalCalls = calls.length
    const answered = calls.filter(c => c.status === 'completed' || c.status === 'active').length
    const missed = calls.filter(c => c.status === 'missed').length
    const withRecordings = calls.filter(c => c.recordingUrl).length
    const hotLeads = calls.filter(c => c.score && c.score >= 75).length
    const analyzed = calls.filter(c => c.score !== undefined).length
    const avgScore = calls.filter(c => c.score !== undefined).length > 0
      ? Math.round(calls.reduce((sum, c) => sum + (c.score || 0), 0) / analyzed)
      : 0

    return {
      totalCalls,
      answered,
      missed,
      withRecordings,
      hotLeads,
      analyzed,
      avgScore,
    }
  }

  getDashboardStats(calls: Call[]): DashboardStats {
    const stats = this.getStats(calls)
    return {
      totalCalls: stats.totalCalls,
      analyzed: stats.analyzed,
      hotLeads: stats.hotLeads,
      avgScore: String(stats.avgScore),
    }
  }
}

export function createCTMClient(): CTMClient {
  return new CTMClient()
}
