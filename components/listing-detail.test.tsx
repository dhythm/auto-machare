import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ListingDetail } from './listing-detail'
import { getListing } from '@/lib/server/listings'
import { buildModes } from '@/lib/server/listing-detail'

describe('ListingDetail', () => {
  it('shows residual lease pricing per month, not per day', async () => {
    const listing = (await getListing('car-001'))!
    render(
      <ListingDetail
        listing={listing}
        modes={buildModes(listing)}
        related={[]}
        booked={[]}
        viewer={{ signedIn: false, isOwner: false }}
      />,
    )
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: '残価設定リース' }))
    expect(screen.getByText(/\/月$/)).toBeInTheDocument()
    expect(screen.queryByText(/\/日$/)).not.toBeInTheDocument()
  })

  it('preserves the selected vehicle when starting a transport request', async () => {
    const listing = (await getListing('car-001'))!
    render(
      <ListingDetail
        listing={listing}
        modes={buildModes(listing)}
        related={[]}
        booked={[]}
        viewer={{ signedIn: false, isOwner: false }}
      />,
    )

    expect(
      screen.getByRole('link', { name: 'この車両の運搬を依頼する' }),
    ).toHaveAttribute('href', '/transport/new?listingId=car-001')
  })

  it('exposes the selected transaction and retains purchase and question destinations', async () => {
    const listing = (await getListing('car-001'))!
    render(
      <ListingDetail
        listing={listing}
        modes={buildModes(listing)}
        related={[]}
        booked={[]}
        viewer={{ signedIn: false, isOwner: false }}
      />,
    )
    const purchase = screen.getByRole('button', { name: '購入する' })
    expect(purchase).toHaveAttribute('aria-pressed', 'false')
    await userEvent.setup().click(purchase)

    expect(purchase).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('link', { name: 'ログインして購入を申し込む' }),
    ).toHaveAttribute('href', '/login?callbackUrl=%2Flistings%2Fcar-001')
    expect(
      screen.getByRole('link', { name: '出品者に質問する' }),
    ).toHaveAttribute('href', '/listings/car-001/inquiry?mode=question')
  })

  it('links the seller block to the seller page', async () => {
    const listing = (await getListing('car-001'))!
    render(
      <ListingDetail
        listing={listing}
        modes={buildModes(listing)}
        related={[]}
        booked={[]}
        viewer={{ signedIn: false, isOwner: false }}
      />,
    )

    expect(screen.getByRole('link', { name: '出品者ページ' })).toHaveAttribute(
      'href',
      '/sellers/demo-seller',
    )
  })
})
