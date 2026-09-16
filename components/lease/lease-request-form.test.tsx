// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LeaseRequestForm } from './lease-request-form'

afterEach(() => vi.unstubAllGlobals())

const props = {
  listingId: 'car-001',
  leasePerMonth: 42_000,
  booked: [{ startDate: '2026-10-10', endDate: '2027-10-09' }],
}

describe('LeaseRequestForm', () => {
  it('asks to log in when signed out', () => {
    render(<LeaseRequestForm {...props} signedIn={false} />)
    expect(
      screen.getByRole('link', { name: 'ログインして申し込む' }),
    ).toHaveAttribute('href', '/login?callbackUrl=%2Flistings%2Fcar-001')
    expect(screen.getByText('2026/10/10 〜 2027/10/9')).toBeInTheDocument()
  })

  it('previews the term total and submits the request', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ id: 'l-1', status: 'requested' }, { status: 201 }),
    )
    vi.stubGlobal('fetch', fetchMock)
    render(<LeaseRequestForm {...props} signedIn />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('開始日'), '2026-11-01')
    await user.selectOptions(screen.getByLabelText('契約期間'), '24')
    expect(
      screen.getByText('2026/11/1 〜 2028/10/31 · 総額 ¥1,008,000'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'リースを申し込む' }))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/listings/car-001/leases',
      expect.objectContaining({ method: 'POST' }),
    )
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toEqual({
      startDate: '2026-11-01',
      months: 24,
    })
    expect(await screen.findByRole('status')).toHaveTextContent(
      'リースを申し込みました',
    )
    expect(
      screen.getByRole('link', { name: 'マイページで確認する' }),
    ).toHaveAttribute('href', '/account')
  })

  it('shows the server error for a booked term', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { error: 'その期間はすでに予約されています。' },
          { status: 409 },
        ),
      ),
    )
    render(<LeaseRequestForm {...props} signedIn />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('開始日'), '2026-10-10')
    await user.selectOptions(screen.getByLabelText('契約期間'), '12')
    await user.click(screen.getByRole('button', { name: 'リースを申し込む' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'その期間はすでに予約されています。',
    )
  })
})
