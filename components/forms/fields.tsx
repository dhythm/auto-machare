'use client'

import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const controlClass =
  'h-12 w-full rounded-lg border border-input bg-card px-3.5 text-base sm:text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 aria-invalid:border-destructive'

function describedBy(id: string, error?: string) {
  return error ? `${id}-error` : undefined
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
      {error}
    </p>
  )
}

function FieldLabel({ htmlFor, label }: { htmlFor: string; label: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-foreground"
    >
      {label}
    </label>
  )
}

export function TextField({
  id,
  label,
  error,
  className,
  ...props
}: ComponentProps<'input'> & { id: string; label: string; error?: string }) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} />
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error)}
        className={controlClass}
        {...props}
      />
      <FieldError id={id} error={error} />
    </div>
  )
}

export function SelectField({
  id,
  label,
  error,
  options,
  placeholder = '選択してください',
  className,
  ...props
}: ComponentProps<'select'> & {
  id: string
  label: string
  error?: string
  /** A plain string is both the value and the label. */
  options: readonly (string | { value: string; label: string })[]
  placeholder?: string
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} />
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error)}
        className={controlClass}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options
          .map((option) =>
            typeof option === 'string'
              ? { value: option, label: option }
              : option,
          )
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
      <FieldError id={id} error={error} />
    </div>
  )
}

export function TextareaField({
  id,
  label,
  error,
  className,
  ...props
}: ComponentProps<'textarea'> & {
  id: string
  label: string
  error?: string
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} />
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error)}
        className={cn(controlClass, 'h-auto min-h-32 py-2')}
        {...props}
      />
      <FieldError id={id} error={error} />
    </div>
  )
}

export function CheckboxField({
  id,
  label,
  error,
  className,
  ...props
}: ComponentProps<'input'> & { id: string; label: string; error?: string }) {
  return (
    <div className={className}>
      <label className="inline-flex items-center gap-2 text-sm text-foreground">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error)}
          className="size-4 accent-primary"
          {...props}
        />
        {label}
      </label>
      <FieldError id={id} error={error} />
    </div>
  )
}

export function FormAlert({ error }: { error?: string }) {
  if (!error) return null
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
    >
      {error}
    </div>
  )
}
