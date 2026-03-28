'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'

interface NoteEntry {
  id: string
  call_id: string
  user_id: string
  notes: string
  created_at: string
}

interface NotesLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  callId: string
}

export default function NotesLogDialog({
  open,
  onOpenChange,
  callId,
}: NotesLogDialogProps) {
  const [notesLog, setNotesLog] = useState<NoteEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && callId) {
      fetchNotesLog()
    }
  }, [open, callId])

  const fetchNotesLog = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/calls/${callId}/notes?callId=${callId}`)
      if (response.ok) {
        const data = await response.json()
        setNotesLog(data.notesLog || [])
      }
    } catch (error) {
      console.error('Failed to fetch notes log:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a')
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Notes History</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-navy-100 border-t-navy-900 rounded-full animate-spin" />
            </div>
          ) : notesLog.length === 0 ? (
            <div className="text-center py-8 text-navy-400">
              No notes history yet
            </div>
          ) : (
            <div className="space-y-4">
              {notesLog.map((entry) => (
                <div
                  key={entry.id}
                  className="border-l-4 border-navy-200 pl-4 py-2"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-navy-700">
                      Team Member
                    </span>
                    <span className="text-xs text-navy-400">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-navy-600 whitespace-pre-wrap bg-navy-50 rounded-lg p-3">
                    {entry.notes || '(empty note)'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
