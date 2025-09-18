'use client'

import { memo, useState, useCallback } from 'react'
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { AlertCircle, CheckCircle } from '@/components/icons'
import { cn } from '@/lib/utils'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

interface FormField {
  name: string
  label: string
  type?: string
  placeholder?: string
  validation?: ValidationRule
}

interface ValidatedFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, string>) => Promise<void>
  submitText?: string
  title?: string
  className?: string
}

export const ValidatedForm = memo(function ValidatedForm({
  fields,
  onSubmit,
  submitText = 'Отправить',
  title,
  className
}: ValidatedFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const validateField = useCallback((field: FormField, value: string): string | null => {
    const { validation } = field
    if (!validation) return null

    if (validation.required && !value.trim()) {
      return `${field.label} обязательно для заполнения`
    }

    if (validation.minLength && value.length < validation.minLength) {
      return `${field.label} должно содержать минимум ${validation.minLength} символов`
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      return `${field.label} должно содержать максимум ${validation.maxLength} символов`
    }

    if (validation.pattern && !validation.pattern.test(value)) {
      return `${field.label} имеет неверный формат`
    }

    if (validation.custom) {
      return validation.custom(value)
    }

    return null
  }, [])

  const handleChange = useCallback((fieldName: string, value: string) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }, [errors])

  const handleBlur = useCallback((field: FormField) => {
    const value = values[field.name] || ''
    const error = validateField(field, value)
    if (error) {
      setErrors(prev => ({ ...prev, [field.name]: error }))
    }
  }, [values, validateField])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      const value = values[field.name] || ''
      const error = validateField(field, value)
      if (error) {
        newErrors[field.name] = error
      }
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await onSubmit(values)
      setSubmitStatus('success')
      setValues({})
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }, [fields, values, validateField, onSubmit])

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(field => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            value={values[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={cn(errors[field.name] && 'border-destructive')}
          />
          {errors[field.name] && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors[field.name]}
            </div>
          )}
        </div>
      ))}

      {submitStatus === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          Форма успешно отправлена!
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          Произошла ошибка при отправке формы
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Отправка...' : submitText}
      </Button>
    </form>
  )

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {FormContent}
        </CardContent>
      </Card>
    )
  }

  return <div className={className}>{FormContent}</div>
})