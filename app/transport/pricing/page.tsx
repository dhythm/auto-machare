import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Truck } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { BackLink } from '@/components/back-link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatYen } from '@/lib/data'
import {
  distanceBands,
  transportBaseRates,
  transportDefaultRate,
} from '@/lib/transport-fee'

export const metadata: Metadata = { title: '運搬料金のめやす | Auto Machare' }

export default function TransportPricingPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <BackLink href="/transport" label="運搬案件にもどる" />
        <header className="mt-8 grid gap-6 rounded-2xl bg-primary p-6 text-primary-foreground sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-primary-foreground/65">
              <Calculator className="size-4" />
              TRANSPORT PRICING
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              運搬料金のめやす
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/75">
              車両の種類と距離で、運搬費用を見通せる。実際の報酬は案件ごとに設定し、運搬者と相談できます。
            </p>
          </div>
          <div className="rounded-xl border border-primary-foreground/20 p-5 text-center">
            <p className="text-xs text-primary-foreground/65">料金の計算方法</p>
            <p className="mt-3 text-lg font-semibold">
              種類別の基準額 <span className="px-2 text-accent">×</span>{' '}
              距離の倍率
            </p>
          </div>
        </header>
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.25fr_1fr]">
          <section>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground">
              01 / EQUIPMENT
            </p>
            <h2 className="mt-2 font-display text-xl font-bold text-foreground">
              種類別の基準額
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              50km 未満の運搬
            </p>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/60 text-left text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-4 font-medium">
                      種類
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-right font-medium"
                    >
                      基準額
                    </th>
                    <th scope="col" className="px-4 py-4 font-medium">
                      想定する積載車
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(transportBaseRates).map(
                    ([category, rate]) => (
                      <tr key={category}>
                        <th
                          scope="row"
                          className="whitespace-nowrap px-4 py-5 text-left font-medium text-foreground"
                        >
                          {category}
                        </th>
                        <td className="whitespace-nowrap px-4 py-5 text-right font-display font-bold text-primary">
                          {formatYen(rate)}
                        </td>
                        <td className="px-4 py-5 text-xs leading-5 text-muted-foreground">
                          {vehicleFor(category)}
                        </td>
                      </tr>
                    ),
                  )}
                  <tr>
                    <th
                      scope="row"
                      className="px-4 py-5 text-left font-medium text-foreground"
                    >
                      その他
                    </th>
                    <td className="px-4 py-5 text-right font-display font-bold text-primary">
                      {formatYen(transportDefaultRate)}
                    </td>
                    <td className="px-4 py-5 text-xs text-muted-foreground">
                      相談
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground">
              02 / DISTANCE
            </p>
            <h2 className="mt-2 font-display text-xl font-bold text-foreground">
              距離による倍率
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {distanceBands.map((guide) => (
                <div
                  key={guide.label}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <p className="text-xs text-muted-foreground">{guide.label}</p>
                  <p className="mt-3 font-display text-3xl font-bold tracking-tight text-primary">
                    ×{guide.rate.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-secondary p-5">
              <p className="text-xs font-medium text-secondary-foreground">
                例：乗用車を 120km 運ぶ場合
              </p>
              <p className="mt-3 text-sm text-secondary-foreground">
                {formatYen(transportBaseRates['乗用車'])} × 1.8
              </p>
              <p className="mt-1 font-display text-3xl font-bold tracking-tight text-primary">
                {formatYen(transportBaseRates['乗用車'] * 1.8)}
              </p>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                高速料金・フェリー代は依頼者負担です。
              </p>
            </div>
          </section>
        </div>
        <section className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-[auto_1fr_auto] sm:items-start">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
            <Truck className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              応募から運搬完了まで
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
              応募後はメッセージで日程や積み込み方法を調整します。運搬後は依頼者がマイページで完了を記録できます。
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <Link
              href="/transport"
              className={cn(buttonVariants(), 'h-11 px-4')}
            >
              募集中の案件を見る
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/transport/register"
              className="text-sm font-medium text-primary"
            >
              運搬者として登録する
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  )
}

function vehicleFor(category: string): string {
  switch (category) {
    case 'トラック':
      return 'セルフローダー'
    case 'SUV':
    case 'バン':
      return '積載車（1台）・2台積みキャリアカー'
    default:
      return '2台積み・5台積みキャリアカー'
  }
}
