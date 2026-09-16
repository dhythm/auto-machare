'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { formatYen } from '@/lib/data'
import { SelectField } from '@/components/forms/fields'
import {
  calculateResidualLease,
  leaseTermMonths,
  type ResidualLeaseTerms,
} from '@/lib/residual-lease'

const termOptions = leaseTermMonths.map((months) => ({
  value: String(months),
  label: `${months}ヶ月`,
}))

export function ResidualLeaseSimulator({
  terms,
}: {
  terms: ResidualLeaseTerms
}) {
  const [term, setTerm] = useState('24')
  const estimate = calculateResidualLease(terms, Number(term))
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="p-4">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Calculator className="size-4 text-primary" />
          残価シミュレーション
        </h3>
        <SelectField
          id="residual-lease-term"
          label="契約期間"
          className="mt-4"
          options={termOptions}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
        <dl className="mt-4 grid gap-3 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">リース料総額</dt>
            <dd className="font-medium text-foreground">
              {formatYen(estimate.leaseTotal)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">
              充当額（{terms.creditRate}%
              {terms.creditCap !== undefined &&
                `・上限 ${formatYen(terms.creditCap)}`}
              ）
            </dt>
            <dd className="shrink-0 font-semibold text-primary">
              {formatYen(estimate.credit)}
            </dd>
          </div>
        </dl>
      </div>
      <dl className="bg-secondary px-4 py-3" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-xs font-medium text-secondary-foreground">
            満了時の買取価格（残価）
          </dt>
          <dd className="font-display text-xl font-bold tracking-tight text-primary">
            {formatYen(estimate.buyoutPrice)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
