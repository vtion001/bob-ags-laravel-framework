import { CTMClient } from '../client'
import { transformCall } from '../transformer'
import type { Call, GetCallsParams, CTMCall } from '@/lib/types'

function normalizePhoneForComparison(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1)
  }
  return digits
}

function phoneMatches(phone1: string, phone2: string): boolean {
  const norm1 = normalizePhoneForComparison(phone1)
  const norm2 = normalizePhoneForComparison(phone2)
  if (!norm1 || !norm2) return false
  if (norm1.length === norm2.length) return norm1 === norm2
  const shorter = norm1.length < norm2.length ? norm1 : norm2
  const longer = norm1.length < norm2.length ? norm2 : norm1
  return longer.slice(-shorter.length) === shorter
}

function extractCursor(nextPage: string | null | undefined): string | null {
  if (!nextPage) return null
  try {
    const url = new URL(nextPage.startsWith('http') ? nextPage : `https://example.com${nextPage}`)
    return url.searchParams.get('after')
  } catch {
    return null
  }
}

export class CallsService extends CTMClient {
  /**
   * Get calls — single page using cursor-based pagination
   * Returns { calls, nextCursor } so caller can page further if needed
   */
  async getCalls(params: GetCallsParams = {}): Promise<{ calls: Call[]; nextCursor: string | null }> {
    const { limit = 100, hours, status, sourceId, agentId, fromDate, toDate, after } = params

    const queryParts: string[] = [`limit=${Math.min(limit, 200)}`]

    if (hours !== undefined) queryParts.push(`hours=${hours}`)
    if (status) queryParts.push(`status=${encodeURIComponent(status)}`)
    if (sourceId) queryParts.push(`source_id=${encodeURIComponent(sourceId)}`)
    if (agentId) queryParts.push(`agent_id=${encodeURIComponent(agentId)}`)
    if (fromDate) queryParts.push(`from_date=${encodeURIComponent(fromDate)}`)
    if (toDate) queryParts.push(`to_date=${encodeURIComponent(toDate)}`)
    if (after) queryParts.push(`after=${encodeURIComponent(after)}`)

    const endpoint = `/accounts/${this.accountId}/calls.json?${queryParts.join('&')}`

    const data = await this.makeRequest<{ calls?: CTMCall[]; next_page?: string }>(endpoint)

    const calls: Call[] = (data.calls || []).map(transformCall)
    const nextCursor = extractCursor(data.next_page)

    return { calls, nextCursor }
  }

  /**
   * Get ALL calls across multiple pages using cursor pagination
   * Use for bulk exports or when you need all data
   */
  async getAllCalls(params: { hours?: number; status?: string | null; sourceId?: string | null; agentId?: string | null; fromDate?: string; toDate?: string; maxPages?: number } = {}): Promise<Call[]> {
    const { hours = 8760, status, sourceId, agentId, fromDate, toDate, maxPages = 500 } = params

    const allCalls: Call[] = []
    let cursor: string | null = null
    let pageCount = 0

    while (pageCount < maxPages) {
      const result = await this.getCalls({
        limit: 200,
        hours,
        status,
        sourceId,
        agentId,
        fromDate,
        toDate,
        after: cursor || undefined,
      })

      if (result.calls.length === 0) break

      allCalls.push(...result.calls)
      pageCount++

      if (!result.nextCursor) break
      cursor = result.nextCursor

      // Small delay to be nice to the API
      if (pageCount % 10 === 0) await new Promise(r => setTimeout(r, 100))
    }

    console.log(`[getAllCalls] Fetched ${allCalls.length} calls across ${pageCount} pages`)
    return allCalls
  }

  async getCall(callId: string): Promise<Call | null> {
    try {
      const data = await this.makeRequest<CTMCall>(
        `/accounts/${this.accountId}/calls/${callId}.json`
      )
      return data ? transformCall(data) : null
    } catch {
      return null
    }
  }

  async getCallTranscript(callId: string): Promise<string> {
    try {
      const data = await this.makeRequest<{ transcript?: string }>(
        `/accounts/${this.accountId}/calls/${callId}/transcript`
      )
      return data.transcript || ''
    } catch {
      return ''
    }
  }

  async getActiveCalls(): Promise<Call[]> {
    const result = await this.getCalls({ hours: 1, limit: 50 })
    return result.calls
  }

  async getRecentCalls(minutes: number = 5): Promise<Call[]> {
    const hours = Math.max(0.017, minutes / 60)
    const result = await this.getCalls({ hours, limit: 50 })
    return result.calls
  }

  /**
   * Search calls by phone number
   * Uses CTM's phone_number filter param — fetches only matching calls, not all calls
   */
  async searchCallsByPhone(phoneNumber: string, hours: number = 8760): Promise<Call[]> {
    const allCalls: Call[] = []
    let cursor: string | null = null
    let pageCount = 0
    const maxPages = 500

    while (pageCount < maxPages) {
      const result = await this.getCalls({
        limit: 200,
        hours,
        after: cursor || undefined,
      })

      if (result.calls.length === 0) break

      // Filter locally by phone — CTM's phone_number param is unreliable for partial matches
      const matches = result.calls.filter(call => {
        const phoneFields = [
          call.phone,
          call.callerNumber,
          call.trackingNumber,
          call.destinationNumber,
          call.poolNumber,
          call.didNumber,
        ]
        return phoneFields.some(field => {
          if (!field) return false
          return phoneMatches(String(field), phoneNumber)
        })
      })

      allCalls.push(...matches)
      pageCount++

      // If we found a match, keep paging to find more
      if (matches.length > 0) {
        console.log(`[searchCallsByPhone] Page ${pageCount}: found ${matches.length} matches so far`)
      }

      if (!result.nextCursor) break
      cursor = result.nextCursor

      if (pageCount % 10 === 0) await new Promise(r => setTimeout(r, 100))
    }

    console.log(`[searchCallsByPhone] Total: ${allCalls.length} calls matching ${phoneNumber} across ${pageCount} pages`)
    return allCalls
  }
}

export function createCallsService(): CallsService {
  return new CallsService()
}
