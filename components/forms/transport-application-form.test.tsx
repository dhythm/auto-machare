// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TransportJob } from '@/lib/data'
import { TransportApplicationForm } from './transport-application-form'

const job: TransportJob = {
  id: 'tj-01',
  vehicleName: 'マツダ CX-5 XD',
  from: '秋田県 大仙市',
  to: '山形県 天童市',
  distanceKm: 120,
  vehicleSize: '普通車',
  vehicleCount: 1,
  desiredDate: '9/28 午前',
  reward: 38_000,
  status: '募集中',
}

afterEach(() => vi.unstubAllGlobals())

describe('TransportApplicationForm', () => {
  it('prefills the contact and vehicle, validates, and posts', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(
        { id: 'a-1', receivedAt: '2026-09-13T00:00:00.000Z' },
        { status: 201 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    render(
      <QueryClientProvider client={new QueryClient()}>
        <TransportApplicationForm
          job={job}
          contact={{ name: '高橋陸送', email: 'k@example.com' }}
          defaultVehicle="セルフローダー"
        />
      </QueryClientProvider>,
    )
    const user = userEvent.setup()
    expect(screen.getByLabelText('お名前・屋号')).toHaveValue('高橋陸送')
    expect(screen.getByLabelText('車両')).toHaveValue('セルフローダー')
    await user.click(screen.getByRole('button', { name: '応募する' }))
    expect(screen.getByLabelText('対応可能日')).toHaveAccessibleDescription(
      '対応可能日を入力してください。',
    )
    expect(fetchMock).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText('対応可能日'), '2026-10-03')
    await user.click(screen.getByRole('button', { name: '応募する' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      '受け付けました',
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/transport/jobs/tj-01/applications',
      expect.objectContaining({ method: 'POST' }),
    )
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    )
    expect(body).toMatchObject({
      vehicle: 'セルフローダー',
      availableDate: '2026-10-03',
    })
  })
})
