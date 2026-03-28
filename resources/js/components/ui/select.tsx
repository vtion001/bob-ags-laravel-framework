'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  description?: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  label,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

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
      {label && (
        <label className="block text-sm font-medium text-navy-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 rounded-lg border bg-white text-left
          flex items-center justify-between gap-2
          transition-all duration-200
          focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20
          ${disabled 
            ? 'bg-navy-50 text-navy-400 cursor-not-allowed border-navy-200' 
            : 'border-navy-200 text-navy-900 hover:border-navy-400'
          }
          ${isOpen ? 'border-navy-500 ring-2 ring-navy-500/20' : ''}
        `}
      >
        <span className={selectedOption ? 'text-navy-900' : 'text-navy-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-navy-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-navy-200 shadow-xl overflow-hidden"
        >
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-2.5 text-left flex flex-col
                  transition-colors duration-150
                  hover:bg-navy-50 cursor-pointer
                  ${value === option.value ? 'bg-navy-100' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${value === option.value ? 'text-navy-900' : 'text-navy-700'}`}>
                    {option.label}
                  </span>
                  {value === option.value && (
                    <svg className="w-4 h-4 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {option.description && (
                  <span className="text-xs text-navy-400 mt-0.5">
                    {option.description}
                  </span>
                )}
              </button>
            ))}
            
            {options.length === 0 && (
              <div className="px-4 py-6 text-center text-navy-400">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Select
