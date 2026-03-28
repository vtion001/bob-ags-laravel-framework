import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function getScoreBadge(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800' }
  if (score >= 60) return { label: 'Good', color: 'bg-amber-100 text-amber-800' }
  return { label: 'Needs Work', color: 'bg-red-100 text-red-800' }
}
