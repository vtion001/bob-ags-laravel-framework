import { CTMClient } from '../client'
import type { CTMSchedule, ScheduleTime } from '@/lib/types'

export class SchedulesService extends CTMClient {
  async getSchedules(): Promise<{ schedules?: CTMSchedule[] }> {
    return this.makeRequest<{ schedules?: CTMSchedule[] }>(
      `/accounts/${this.accountId}/schedules`
    )
  }

  async createSchedule(schedule: {
    name: string
    times?: ScheduleTime[]
    timezone?: string
  }): Promise<{ status: string; schedule?: CTMSchedule }> {
    return this.makeRequest<{ status: string; schedule?: CTMSchedule }>(
      `/accounts/${this.accountId}/schedules`,
      {
        method: 'POST',
        body: JSON.stringify({ schedule }),
      }
    )
  }

  async updateSchedule(schId: string, schedule: { name?: string }): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>(
      `/accounts/${this.accountId}/schedules/${schId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ schedule }),
      }
    )
  }
}

export function createSchedulesService(): SchedulesService {
  return new SchedulesService()
}
