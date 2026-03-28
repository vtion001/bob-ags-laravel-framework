import { CTMClient } from '../client'
import type { CTMAccount } from '@/lib/types'

export class AccountsService extends CTMClient {
  async getAccounts(): Promise<{ accounts?: CTMAccount[] }> {
    return this.makeRequest<{ accounts?: CTMAccount[] }>('/accounts')
  }

  async createAccount(name: string, timezoneHint: string = 'America/Los_Angeles'): Promise<{ status: string; id: number; name: string }> {
    return this.makeRequest<{ status: string; id: number; name: string }>('/accounts', {
      method: 'POST',
      body: JSON.stringify({
        account: { name, timezone_hint: timezoneHint },
        billing_type: 'existing'
      }),
    })
  }
}

export function createAccountsService(): AccountsService {
  return new AccountsService()
}
