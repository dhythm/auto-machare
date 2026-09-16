// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ResidualLeaseSimulator } from './residual-lease-simulator'

describe('ResidualLeaseSimulator', () => {
  it('recalculates the credit from the term in months', async () => {
    render(
      <ResidualLeaseSimulator
        terms={{
          leasePerMonth: 42_000,
          salePrice: 2_180_000,
          creditRate: 40,
          creditCap: 600_000,
        }}
      />,
    )
    const months = screen.getByLabelText('契約期間')
    expect(months).toHaveValue('24')
    expect(screen.getByText('¥1,008,000')).toBeInTheDocument()
    expect(screen.getByText('¥403,200')).toBeInTheDocument()
    expect(screen.getByText('¥1,776,800')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.selectOptions(months, '60')
    expect(screen.getByText('¥600,000')).toBeInTheDocument()
    expect(screen.getByText('¥1,580,000')).toBeInTheDocument()
  })
})
