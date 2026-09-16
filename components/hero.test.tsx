// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Hero } from './hero'

describe('Hero search', () => {
  it('submits the selected deal, category and keyword to the existing listing search', async () => {
    const user = userEvent.setup()
    render(<Hero />)
    const form = screen.getByRole('search', { name: '車両を探す' })
    expect(form).toHaveAttribute('action', '/listings')
    expect(form).toHaveAttribute('method', 'get')
    await user.click(screen.getByRole('button', { name: 'リースする' }))
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'カテゴリ' }),
      '乗用車',
    )
    await user.type(
      screen.getByRole('searchbox', { name: 'キーワード' }),
      'トヨタ',
    )
    const data = new FormData(form as HTMLFormElement)
    expect(Object.fromEntries(data)).toEqual({
      deal: 'lease',
      category: '乗用車',
      q: 'トヨタ',
    })
    await user.click(screen.getByRole('button', { name: '残価設定リース' }))
    expect(new FormData(form as HTMLFormElement).get('deal')).toBe(
      'residualLease',
    )
  })

  it('keeps transport requests and available jobs reachable from the first screen', () => {
    render(<Hero />)
    expect(
      screen.getByRole('link', { name: /運搬を依頼する/ }),
    ).toHaveAttribute('href', '/transport/new')
    expect(
      screen.getByRole('link', { name: /運搬の仕事を探す/ }),
    ).toHaveAttribute('href', '/transport')
  })
})
