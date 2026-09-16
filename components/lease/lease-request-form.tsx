'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { CircleCheckBig } from 'lucide-react'
import { FormAlert, SelectField, TextField } from '@/components/forms/fields'
import { SubmitButton } from '@/components/forms/submit-button'
import { buttonVariants } from '@/components/ui/button'
import { formatYen } from '@/lib/data'
import {
  leaseEndDate,
  leaseTermMonths,
  type DateRange,
} from '@/lib/residual-lease'
import { validateLeaseRequest } from '@/lib/validation/lease'
import { cn } from '@/lib/utils'

function shortDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${year}/${Number(month)}/${Number(day)}`
}

function BookedRanges({ booked }: { booked: DateRange[] }) {
  if (booked.length === 0) return null
  return (
    <p className="text-xs text-muted-foreground">
      契約済み:{' '}
      {booked.map((range, index) => (
        <span key={range.startDate + range.endDate}>
          {index > 0 && '、'}
          {shortDate(range.startDate)} 〜 {shortDate(range.endDate)}
        </span>
      ))}
    </p>
  )
}

const termOptions = leaseTermMonths.map((months) => ({
  value: String(months),
  label: `${months}ヶ月`,
}))

export function LeaseRequestForm({
  listingId,
  leasePerMonth,
  booked,
  signedIn,
}: {
  listingId: string
  leasePerMonth: number
  booked: DateRange[]
  signedIn: boolean
}) {
  const [startDate, setStartDate] = useState('')
  const [term, setTerm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const months = Number(term)
  const endDate = months > 0 ? leaseEndDate(startDate, months) : undefined

  if (!signedIn) {
    return (
      <div className="flex flex-col gap-2">
        <BookedRanges booked={booked} />
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/listings/${listingId}`)}`}
          className={cn(buttonVariants(), 'h-11')}
        >
          ログインして申し込む
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div
        role="status"
        className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-sm"
      >
        <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          リースを申し込みました。出品者の承認をお待ちください。
          <Link href="/account" className="ml-1 font-medium text-primary">
            マイページで確認する
          </Link>
        </span>
      </div>
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(undefined)
    const parsed = validateLeaseRequest({ startDate, months })
    if (!parsed.ok) {
      setErrors(parsed.errors)
      return
    }
    setErrors({})
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/listings/${listingId}/leases`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.value),
      })
      if (response.status === 201) {
        setDone(true)
        return
      }
      const body = (await response.json()) as { error?: string }
      setError(body.error ?? '申し込めませんでした。')
    } catch {
      setError('申し込めませんでした。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <FormAlert error={error} />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="lease-start"
          label="開始日"
          type="date"
          value={startDate}
          error={errors.startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
        <SelectField
          id="lease-term"
          label="契約期間"
          options={termOptions}
          value={term}
          error={errors.months}
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>
      <BookedRanges booked={booked} />
      {endDate && (
        <p className="text-sm text-foreground">
          {shortDate(startDate)} 〜 {shortDate(endDate)} · 総額{' '}
          {formatYen(leasePerMonth * months)}
        </p>
      )}
      <SubmitButton label="リースを申し込む" isSubmitting={isSubmitting} />
    </form>
  )
}
