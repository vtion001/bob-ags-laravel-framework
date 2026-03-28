import React from 'react'
import Button from '@/components/ui/Button'

interface ActionButtonsCardProps {
  onCreateTask?: () => void
  onAddToSalesforce?: () => void
  onScheduleFollowUp?: () => void
  showCreateTask?: boolean
  showSalesforce?: boolean
  showFollowUp?: boolean
}

export default function ActionButtonsCard({
  onCreateTask,
  onAddToSalesforce,
  onScheduleFollowUp,
  showCreateTask = true,
  showSalesforce = true,
  showFollowUp = true,
}: ActionButtonsCardProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {showCreateTask && (
        <Button 
          variant="primary" 
          size="md"
          onClick={onCreateTask}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Task
        </Button>
      )}
      
      {showSalesforce && (
        <Button 
          variant="secondary" 
          size="md"
          onClick={onAddToSalesforce}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Add to Salesforce
        </Button>
      )}
      
      {showFollowUp && (
        <Button 
          variant="ghost" 
          size="md"
          onClick={onScheduleFollowUp}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Schedule Follow-up
        </Button>
      )}
    </div>
  )
}
