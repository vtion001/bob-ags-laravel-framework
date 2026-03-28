'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import Button from '@/components/ui/Button'

interface NotesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  callId: string
  initialNotes?: string
  onSave?: (notes: string) => void
}

export default function NotesDialog({
  open,
  onOpenChange,
  callId,
  initialNotes = '',
  onSave,
}: NotesDialogProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isSaving, setIsSaving] = useState(false)

  React.useEffect(() => {
    if (open) {
      setNotes(initialNotes)
    }
  }, [open, initialNotes])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/calls/${callId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, notes }),
      })

      if (!response.ok) {
        throw new Error('Failed to save notes')
      }

      onSave?.(notes)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save notes:', error)
      alert('Failed to save notes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Call Notes</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes about this call..."
            className="min-h-[200px]"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Notes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
