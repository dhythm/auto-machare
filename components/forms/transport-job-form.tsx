'use client'

import { useState } from 'react'
import { transportVehicleSizes } from '@/lib/data'
import { validateTransportJob } from '@/lib/validation/transport'
import { listingCategories } from '@/lib/validation/listing-submission'
import {
  estimateDistanceKm,
  estimateTransportFee,
  prefectureNames,
  prefectureOf,
} from '@/lib/transport-fee'
import { useSubmissionForm } from './use-submission-form'
import { FormAlert, SelectField, TextField } from './fields'
import { ReceiptPanel } from './receipt'
import type { FormContact } from './contact'
import { SubmitButton } from './submit-button'

export type TransportJobInitial = {
  vehicleName?: string
  category?: string
  fromPrefecture?: string
  fromCity?: string
  vehicleSize?: string
}

export type TransportJobEdit = {
  jobId: string
  values: {
    vehicleName: string
    from: string
    to: string
    distanceKm: string
    vehicleSize: string
    vehicleCount: string
    desiredDate: string
    reward: string
    contactEmail: string
  }
}

function splitPlace(place: string): { prefecture: string; city: string } {
  const prefecture = prefectureOf(place) ?? ''
  return { prefecture, city: place.replace(prefecture, '').trim() }
}

type Places = {
  category: string
  fromPrefecture: string
  fromCity: string
  toPrefecture: string
  toCity: string
}

function joinPlace(prefecture: string, city: string): string {
  return [prefecture, city.trim()].filter(Boolean).join(' ')
}

export function TransportJobForm({
  contact,
  initial,
  edit,
}: {
  contact?: FormContact
  initial?: TransportJobInitial
  /** Present when editing an existing job. */
  edit?: TransportJobEdit
}) {
  const editFrom = edit ? splitPlace(edit.values.from) : undefined
  const editTo = edit ? splitPlace(edit.values.to) : undefined
  const [places, setPlaces] = useState<Places>({
    category: initial?.category ?? '',
    fromPrefecture: editFrom?.prefecture ?? initial?.fromPrefecture ?? '',
    fromCity: editFrom?.city ?? initial?.fromCity ?? '',
    toPrefecture: editTo?.prefecture ?? '',
    toCity: editTo?.city ?? '',
  })
  const form = useSubmissionForm({
    url: edit ? `/api/transport/jobs/${edit.jobId}` : '/api/transport/jobs',
    method: edit ? 'PUT' : 'POST',
    validate: validateTransportJob,
    initialValues: edit?.values ?? {
      vehicleName: initial?.vehicleName ?? '',
      from: joinPlace(initial?.fromPrefecture ?? '', initial?.fromCity ?? ''),
      to: '',
      distanceKm: '',
      vehicleSize: initial?.vehicleSize ?? '',
      vehicleCount: '1',
      desiredDate: '',
      reward: '',
      contactEmail: contact?.email ?? '',
    },
  })

  /** Keep the free-form places in sync and suggest distance and reward. */
  const updatePlaces = (patch: Partial<Places>) => {
    const next = { ...places, ...patch }
    setPlaces(next)
    form.setValue('from', joinPlace(next.fromPrefecture, next.fromCity))
    form.setValue('to', joinPlace(next.toPrefecture, next.toCity))
    const distance =
      next.fromPrefecture && next.toPrefecture
        ? estimateDistanceKm(next.fromPrefecture, next.toPrefecture)
        : undefined
    if (
      distance !== undefined &&
      ('fromPrefecture' in patch ||
        'toPrefecture' in patch ||
        'category' in patch)
    ) {
      form.setValue('distanceKm', String(Math.max(1, distance)))
      form.setValue(
        'reward',
        String(
          estimateTransportFee(
            next.category,
            Math.max(1, distance),
            Math.max(1, Number(form.values.vehicleCount) || 1),
          ),
        ),
      )
    }
  }

  if (form.receipt) {
    return (
      <ReceiptPanel
        receipt={form.receipt}
        title={edit ? '運搬依頼の更新' : '運搬の依頼'}
        description={
          edit ? '更新しました。' : '審査後に案件ボードへ掲載します。'
        }
        links={
          edit
            ? [
                { href: `/transport/${edit.jobId}`, label: '案件の詳細を見る' },
                { href: '/account', label: 'マイページにもどる' },
              ]
            : [{ href: '/transport', label: '案件ボードにもどる' }]
        }
      />
    )
  }

  return (
    <form onSubmit={form.submit} noValidate className="flex flex-col gap-5">
      <FormAlert error={form.failed ? '送信できませんでした。' : undefined} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="vehicle-name"
          label="運ぶ車"
          placeholder="例: トヨタ プリウス Z"
          value={form.values.vehicleName}
          onChange={(e) => form.setValue('vehicleName', e.target.value)}
          error={form.errors.vehicleName}
        />
        <SelectField
          id="category"
          label="カテゴリ"
          options={listingCategories}
          value={places.category}
          onChange={(e) => updatePlaces({ category: e.target.value })}
        />
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">
          出発地
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="fromPrefecture"
            label="出発地の都道府県"
            options={prefectureNames}
            value={places.fromPrefecture}
            onChange={(e) => updatePlaces({ fromPrefecture: e.target.value })}
            error={form.errors.from}
          />
          <TextField
            id="fromCity"
            label="出発地の市区町村"
            placeholder="例: 長岡市"
            value={places.fromCity}
            onChange={(e) => updatePlaces({ fromCity: e.target.value })}
          />
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">
          届け先
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="toPrefecture"
            label="届け先の都道府県"
            options={prefectureNames}
            value={places.toPrefecture}
            onChange={(e) => updatePlaces({ toPrefecture: e.target.value })}
            error={form.errors.to}
          />
          <TextField
            id="toCity"
            label="届け先の市区町村"
            placeholder="例: 上越市"
            value={places.toCity}
            onChange={(e) => updatePlaces({ toCity: e.target.value })}
          />
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="distanceKm"
          label="距離（km）"
          inputMode="numeric"
          value={form.values.distanceKm}
          onChange={(e) => form.setValue('distanceKm', e.target.value)}
          error={form.errors.distanceKm}
        />
        <SelectField
          id="vehicle-size"
          label="車両サイズ"
          options={transportVehicleSizes}
          value={form.values.vehicleSize}
          onChange={(e) => form.setValue('vehicleSize', e.target.value)}
          error={form.errors.vehicleSize}
        />
        <TextField
          id="vehicle-count"
          label="積載台数"
          inputMode="numeric"
          value={form.values.vehicleCount}
          onChange={(e) => form.setValue('vehicleCount', e.target.value)}
          error={form.errors.vehicleCount}
        />
        <TextField
          id="desiredDate"
          label="希望日"
          placeholder="例: 10/3 終日、相談"
          value={form.values.desiredDate}
          onChange={(e) => form.setValue('desiredDate', e.target.value)}
          error={form.errors.desiredDate}
        />
        <TextField
          id="reward"
          label="報酬（円）"
          inputMode="numeric"
          value={form.values.reward}
          onChange={(e) => form.setValue('reward', e.target.value)}
          error={form.errors.reward}
        />
      </div>
      <TextField
        id="contactEmail"
        label="メールアドレス"
        type="email"
        value={form.values.contactEmail}
        onChange={(e) => form.setValue('contactEmail', e.target.value)}
        error={form.errors.contactEmail}
      />
      <div>
        <SubmitButton
          label={edit ? '更新する' : '運搬を依頼する'}
          isSubmitting={form.isSubmitting}
        />
      </div>
    </form>
  )
}
