import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TransportJobPage from './page'
import { getTransportJob } from '@/lib/server/transport'
import { getCurrentUser } from '@/lib/server/auth/session'

vi.mock('@/components/page-shell', () => ({
  PageShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('@/lib/server/transport', () => ({ getTransportJob: vi.fn() }))
vi.mock('@/lib/server/auth/session', () => ({
  getCurrentUser: vi.fn(),
  canView: () => true,
}))
vi.mock('@/lib/server/carriers', () => ({
  getCarrierProfile: vi.fn(),
  matchCarriersForJob: async () => [],
}))

describe('transport job detail', () => {
  it('keeps the owner edit action available after a job enters coordination', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'owner',
      name: 'Owner',
      email: 'owner@example.com',
      role: 'user',
    })
    vi.mocked(getTransportJob).mockResolvedValue({
      id: 'job-1',
      vehicleName: '乗用車',
      from: '新潟県',
      to: '長野県',
      distanceKm: 180,
      vehicleSize: '普通車',
      vehicleCount: 1,
      desiredDate: '10月1日',
      reward: 45000,
      status: '調整中',
      ownerUserId: 'owner',
    })

    render(await TransportJobPage({ params: Promise.resolve({ id: 'job-1' }) }))
    expect(screen.getByRole('link', { name: '編集する' })).toHaveAttribute(
      'href',
      '/transport/job-1/edit',
    )
    expect(
      screen.queryByRole('button', { name: '応募する' }),
    ).not.toBeInTheDocument()
  })
})
