import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NewTransportJobPage from './page'

vi.mock('@/components/page-shell', () => ({
  PageShell: ({ children }: { children: ReactNode }) => <>{children}</>,
  PageIntro: ({ title }: { title: string }) => <h1>{title}</h1>,
}))
vi.mock('@/lib/server/auth/session', () => ({
  getCurrentUser: async () => undefined,
}))

describe('new transport request', () => {
  it('keeps the chosen listing through the login redirect', async () => {
    render(
      await NewTransportJobPage({
        searchParams: Promise.resolve({ listingId: 'car-001' }),
      }),
    )

    expect(screen.getByRole('link', { name: 'ログイン' })).toHaveAttribute(
      'href',
      '/login?callbackUrl=%2Ftransport%2Fnew%3FlistingId%3Dcar-001',
    )
  })
})
