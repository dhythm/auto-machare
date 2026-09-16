import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TransportBoard } from './transport-board'
import { getTransportJobs } from '@/lib/server/transport'

vi.mock('@/lib/server/transport', () => ({ getTransportJobs: vi.fn() }))

describe('TransportBoard', () => {
  it('keeps application links for open jobs and detail links for jobs under coordination', async () => {
    vi.mocked(getTransportJobs).mockResolvedValue([
      {
        id: 'open-job',
        vehicleName: '乗用車 Z',
        from: '新潟県 長岡市',
        to: '長野県 長野市',
        distanceKm: 180,
        vehicleSize: '普通車',
        vehicleCount: 1,
        desiredDate: '10月1日',
        reward: 45000,
        status: '募集中',
      },
      {
        id: 'coordinating-job',
        vehicleName: 'マツダ CX-5 XD',
        from: '秋田県 大仙市',
        to: '山形県 天童市',
        distanceKm: 120,
        vehicleSize: '普通車',
        vehicleCount: 1,
        desiredDate: '10月2日',
        reward: 38000,
        status: '調整中',
      },
    ])

    render(await TransportBoard())

    const openCard = screen.getByText('乗用車 Z').closest('li')!
    const coordinatingCard = screen.getByText('マツダ CX-5 XD').closest('li')!
    expect(
      within(openCard).getByRole('link', { name: 'この案件に応募する' }),
    ).toHaveAttribute('href', '/transport/open-job')
    expect(
      within(coordinatingCard).getByRole('link', { name: '案件の詳細を見る' }),
    ).toHaveAttribute('href', '/transport/coordinating-job')
  })

  it('shows a useful empty state while keeping the request and carrier registration entrances', async () => {
    vi.mocked(getTransportJobs).mockResolvedValue([])
    render(await TransportBoard())

    expect(
      screen.getByText('現在、公開中の運搬案件はありません'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '運搬を依頼する' }),
    ).toHaveAttribute('href', '/transport/new')
    expect(
      screen.getByRole('link', { name: '運搬者として登録する' }),
    ).toHaveAttribute('href', '/transport/register')
  })
})
