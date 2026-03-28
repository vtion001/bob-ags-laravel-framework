import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = true, ...props }, ref) => {
    const baseStyles = 'bg-white border border-navy-200 rounded-xl shadow-sm'
    const hoverStyles = hoverable ? 'hover:border-navy-300 hover:shadow-md transition-all duration-200' : ''
    
    return (
      <div
        ref={ref}
        className={`${baseStyles} ${hoverStyles} ${className || ''}`}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export default Card
