/**
 * WCAG 2.1 AA Compliant Components for Normal Dance
 * Implements proper ARIA attributes, keyboard navigation, and screen reader support
 * Focus management, color contrast, and accessibility testing integration
 */

'use client'

import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { Button as BaseButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Accessible Button Component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-pressed'?: boolean
  'aria-modal'?: boolean
  tabIndex?: number
  isLoading?: boolean
  loadingText?: string
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
  className,
  variant = 'default',
  size = 'default',
  children,
  isLoading = false,
  loadingText = 'Загрузка...',
  disabled,
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = useState(false)

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsPressed(true)
    }
  }, [])

  const handleKeyUp = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsPressed(false)
    }
  }, [])

  return (
    <BaseButton
      ref={ref}
      className={cn(
        'transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        isPressed && 'scale-95',
        isLoading && 'opacity-70 cursor-not-allowed',
        className
      )}
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="sr-only">{loadingText}</span>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" aria-hidden="true" />
          <span aria-hidden="true">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </BaseButton>
  )
})
AccessibleButton.displayName = 'AccessibleButton'

// Accessible Input Component  
interface AccessibleInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'aria-label'> {
  label?: string
  error?: string
  hint?: string
  isRequired?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  hasError?: boolean
}

const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(({
  id,
  label,
  error,
  hint,
  isRequired = false,
  hasError = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const errorId = id ? `${id}-error` : undefined
  const hintId = id ? `${id}-hint` : undefined
  const labelledBy = [id ? `${id}-label` : null, hintId].filter(Boolean).join(' ')

  return (
    <div className="space-y-2">
      {label && (
        <label
          id={id ? `${id}-label` : undefined}
          htmlFor={id}
          className={cn(
            'block text-sm font-medium leading-6 transition-colors',
            isFocused || props.value ? 'text-white' : 'text-gray-400',
            hasError && 'text-red-500',
            isRequired && "after:content-['*'] after:ml-1 after:text-red-500"
          )}
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1" aria-label="обязательно">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-400" aria-hidden="true">{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          id={id}
          className={cn(
            'flex w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400',
            'transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={cn(
            error && errorId,
            hint && hintId
          ).trim() || undefined}
          aria-required={isRequired}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-400" aria-hidden="true">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {hint && (
        <p id={hintId} className="text-xs text-gray-400">
          {hint}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
AccessibleInput.displayName = 'AccessibleInput'

// Accessible Modal Component
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  closeButtonLabel?: string
}

const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  closeButtonLabel = 'Закрыть'
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const lastActiveElement = useRef<HTMLElement | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Store last active element when modal opens
  useEffect(() => {
    if (isOpen) {
      lastActiveElement.current = document.activeElement as HTMLElement
      modalRef.current?.focus()
      // Trap focus within modal
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0]?.focus()
      }
    } else {
      // Restore focus when modal closes
      lastActiveElement.current?.focus()
    }
  }, [isOpen])

  // Handle ESC key
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
    if (event.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements) {
        const currentIndex = Array.from(focusableElements).indexOf(
          document.activeElement as HTMLElement
        )
        let newIndex = currentIndex
        
        if (event.shiftKey) {
          // Shift+Tab: go to previous element
          newIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1
        } else {
          // Tab: go to next element
          newIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0
        }
        
        focusableElements[newIndex]?.focus()
        event.preventDefault()
      }
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={handleKeyDown}
        aria-label="Закрыть модальное окно"
      />
      
      <div
        ref={modalRef}
        className={cn(
          'relative z-50 w-full max-w-lg rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-xl',
          className
        )}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-2 text-gray-400">
                {description}
              </p>
            )}
          </div>
          
          <button
            onClick={onClose}
            aria-label={closeButtonLabel}
            className="ml-4 rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// Accessible Skip Links Component
interface SkipLinksProps {
  showOnFocus?: boolean
}

const SkipLinks: React.FC<SkipLinksProps> = ({ showOnFocus = true }) => {
  return (
    <div
      className={cn(
        'fixed top-0 left-0 z-50 -translate-x-full focus:translate-x-0 transition-transform',
        showOnFocus && 'focus-within:translate-x-0'
      )}
    >
      <nav aria-label="Пропустить к содержимому">
        <a
          href="#main-content"
          className="block bg-blue-600 text-white px-6 py-3 text-lg font-medium border-0 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
        >
          Перейти к основному контенту
        </a>
        <a
          href="#navigation"
          className="block bg-blue-600 text-white px-6 py-3 text-lg font-medium border-0 focus:ring-2 focus:ring-blue-500/50 focus:outline-none border-t-0"
        >
          Перейти к навигации
        </a>
        <a
          href="#search"
          className="block bg-blue-600 text-white px-6 py-3 text-lg font-medium border-0 focus:ring-2 focus:ring-blue-500/50 focus:outline-none border-t-0"
        >
          Перейти к поиску
        </a>
      </nav>
    </div>
  )
}

// Accessible Table Component
interface AccessibleTableProps {
  caption: string
  headers: string[]
  rows: string[][]
  className?: string
}

const AccessibleTable: React.FC<AccessibleTableProps> = ({
  caption,
  headers,
  rows,
  className
}) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse border border-gray-700', className)}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-gray-800">
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="border border-gray-700 px-4 py-3 text-left text-sm font-semibold text-white"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={cn('hover:bg-gray-800/50', rowIndex % 2 === 0 && 'bg-gray-900/25')}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border border-gray-700 px-4 py-3 text-sm text-gray-300"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Accessible Progress Bar Component
interface AccessibleProgressBarProps {
  value: number
  max?: number
  label?: string
  className?: string
  showLabel?: boolean
}

const AccessibleProgressBar: React.FC<AccessibleProgressBarProps> = ({
  value,
  max = 100,
  label,
  className,
  showLabel = false
}) => {
  const percentage = (value / max) * 100

  return (
    <div className={cn('w-full space-y-2', className)}>
      {(label || showLabel) && (
        <div className="flex justify-between text-sm text-gray-400">
          <span>{label || 'Прогресс'}</span>
          <span aria-live="polite" aria-atomic="true">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className="h-2 bg-gray-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

// Tooltip Component for help text
interface TooltipProps {
  content: string
  children: React.ReactNode
  className?: string
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsVisible(prev => !prev)
    }
    if (event.key === 'Escape') {
      setIsVisible(false)
    }
  }, [])

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div
        className="inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg border border-gray-700',
            'bottom-full left-1/2 -translate-x-1/2 mb-2',
            'after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-700',
            className
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  )
}

export {
  AccessibleButton,
  AccessibleInput,
  AccessibleModal,
  SkipLinks,
  AccessibleTable,
  AccessibleProgressBar,
  Tooltip
}
