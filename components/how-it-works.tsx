import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

const ownershipOptions = [
  {
    number: '01',
    label: 'BUY',
    title: '自分の一台に。',
    type: '購入',
    description: '価格と車両の状態を比較して、長く付き合える一台を選ぶ。',
    href: '/listings?deal=sale',
    action: '購入できる車両',
  },
  {
    number: '02',
    label: 'LEASE',
    title: '必要な期間、乗る。',
    type: '通常リース',
    description: '月額と契約期間から、今の暮らしに合う乗り方を選ぶ。',
    href: '/listings?deal=lease',
    action: 'リースできる車両',
  },
  {
    number: '03',
    label: 'LEASE TO OWN',
    title: '乗ってから、決める。',
    type: '残価設定リース',
    description:
      '月額で乗り、買取か返却を選ぶ。リース料の充当条件は車両ごとに確認。',
    href: '/listings?deal=residualLease',
    action: '残価設定リースできる車両',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how"
      className="mx-auto max-w-[1280px] scroll-mt-32 px-5 py-12 sm:px-8 sm:py-20"
    >
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">YOUR CAR, YOUR WAY</p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            クルマの持ち方も、選ぼう。
          </h2>
        </div>
        <Link
          href="/guide"
          className="inline-flex w-fit items-center gap-3 text-sm font-medium underline-offset-4 hover:underline"
        >
          ご利用ガイド <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="mt-8 grid border-y border-border md:grid-cols-3">
        {ownershipOptions.map((option) => (
          <div
            key={option.number}
            className="flex flex-col border-b border-border py-8 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-4xl font-medium tracking-tighter text-foreground/25">
                {option.number}
              </span>
              <span className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground">
                {option.label}
              </span>
            </div>
            <p className="mt-7 text-xs font-bold text-muted-foreground">
              {option.type}
            </p>
            <h3 className="mt-2 text-xl font-bold tracking-tight">
              {option.title}
            </h3>
            <p className="mb-7 mt-3 text-sm leading-7 text-muted-foreground">
              {option.description}
            </p>
            <Link
              href={option.href}
              className="group mt-auto inline-flex w-fit items-center gap-3 text-sm font-bold underline-offset-4 hover:underline"
            >
              {option.action}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
