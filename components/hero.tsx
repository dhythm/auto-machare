'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Search, Truck } from 'lucide-react'
import { categories, type DealFilter } from '@/lib/data'
import { cn } from '@/lib/utils'

const options = [
  { id: 'sale', label: '買う', number: '01' },
  { id: 'lease', label: 'リースする', number: '02' },
  { id: 'residualLease', label: '残価設定リース', number: '03' },
] as const

const bodyTypes = [
  { name: '軽自動車', image: 'kei-car', caption: '毎日を、軽やかに。' },
  { name: '乗用車', image: 'sedan', caption: '日常に、心地よさを。' },
  { name: 'SUV', image: 'suv', caption: '行きたい、その先へ。' },
  { name: 'トラック', image: 'truck', caption: '仕事の、頼れる相棒。' },
  { name: 'バン', image: 'van', caption: '使い方は、自由自在。' },
] as const

export function Hero() {
  const [deal, setDeal] = useState<DealFilter>('sale')
  return (
    <section className="pb-6">
      <div className="relative isolate overflow-hidden bg-primary text-white">
        <Image
          src="/brand-hero.webp?v=auto-2026"
          alt="海辺のモダンな建築を背景にしたシルバーのSUV"
          fill
          preload
          sizes="100vw"
          className="object-cover object-[68%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,22,23,0.9),rgba(14,22,23,0.45)_48%,rgba(14,22,23,0.04))]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(14,22,23,0.65),transparent_45%)]" />
        <div className="relative mx-auto max-w-[1360px] px-5 pb-32 pt-12 sm:px-8 sm:pb-36 sm:pt-16 lg:px-10 lg:pb-32 lg:pt-14">
          <p className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.24em] text-accent sm:text-xs">
            <span className="h-px w-8 bg-accent" />A NEW WAY TO YOUR NEXT CAR
          </p>
          <h1 className="hero-enter mt-7 font-display text-[clamp(2.7rem,4.8vw,4.25rem)] font-bold leading-[1.35] tracking-[-0.045em]">
            次の一台で、
            <br />
            日常が動き出す。
          </h1>
          <p className="hero-enter mt-6 text-sm leading-[2] text-white/80 sm:text-base">
            買う。借りる。乗ってから決める。
            <br />
            あなたに合う車と、あなたらしい持ち方を。
          </p>
          <Link
            href="/guide"
            className="mt-7 inline-flex min-h-11 items-center gap-5 border-b border-white/40 text-xs font-medium transition-colors hover:text-accent"
          >
            Auto Machare について <ArrowUpRight className="size-4" />
          </Link>
          <p className="absolute bottom-28 right-10 hidden text-right font-mono text-[10px] leading-6 tracking-[0.2em] text-white/65 lg:block">
            BUY / LEASE / TRANSPORT
            <br />
            YOUR NEXT CHAPTER STARTS HERE.
          </p>
        </div>
      </div>

      <div className="relative mx-auto -mt-20 max-w-[1280px] px-5 sm:px-8">
        <div className="rounded-lg border border-border bg-card p-5 shadow-[0_16px_48px_-28px_rgba(24,32,34,0.35)] sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-border">
            <div
              className="flex gap-5 sm:gap-9"
              role="group"
              aria-label="取引方法"
            >
              {options.map(({ id, label, number }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setDeal(id)}
                  aria-pressed={deal === id}
                  className={cn(
                    'relative min-h-12 pb-4 text-xs font-bold transition-colors after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[3px] sm:text-sm',
                    deal === id
                      ? 'text-primary after:bg-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="mr-2 hidden font-mono text-[10px] opacity-50 sm:inline"
                  >
                    {number}
                  </span>
                  {label}
                </button>
              ))}
            </div>
            <span className="hidden pb-4 font-mono text-[10px] tracking-wider text-muted-foreground md:block">
              FIND YOUR NEXT CAR
            </span>
          </div>
          <form
            action="/listings"
            method="get"
            role="search"
            aria-label="車両を探す"
            className="mt-5 grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]"
          >
            <input type="hidden" name="deal" value={deal} />
            <label className="flex flex-col gap-2 rounded-sm border border-border px-4 py-3 focus-within:border-primary">
              <span className="text-[10px] font-bold text-muted-foreground">
                カテゴリ
              </span>
              <select
                name="category"
                className="w-full bg-transparent text-sm font-medium outline-none"
                defaultValue="すべて"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'すべて' ? 'すべての車両' : category}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 rounded-sm border border-border px-4 py-3 focus-within:border-primary">
              <span className="text-[10px] font-bold text-muted-foreground">
                キーワード
              </span>
              <input
                type="search"
                name="q"
                placeholder="メーカー・車種名・地域"
                maxLength={100}
                className="min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </label>
            <button
              type="submit"
              className="flex min-h-14 items-center justify-center gap-3 rounded-sm bg-accent px-8 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/75"
            >
              <Search className="size-4" />
              車両を探す
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-b border-border py-5 text-[11px] sm:text-xs">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Truck className="size-4" />
            車の陸送も、ここから。
          </span>
          <Link
            href="/transport/new"
            className="inline-flex min-h-8 items-center gap-2 font-bold hover:underline"
          >
            運搬を依頼する
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/transport"
            className="inline-flex min-h-8 items-center gap-2 font-bold hover:underline"
          >
            運搬の仕事を探す
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-9 flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-bold">ボディタイプから探す</h2>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
            BODY TYPE
          </span>
        </div>
        <nav
          aria-label="ボディタイプから探す"
          className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {bodyTypes.map(({ name, image, caption }) => (
            <Link
              key={name}
              href={`/listings?${new URLSearchParams({ category: name, deal })}`}
              aria-label={`${name}から探す`}
              className="group overflow-hidden rounded-sm border border-border bg-card transition-colors hover:border-primary"
            >
              <div className="relative aspect-[2/1] overflow-hidden bg-[#eceee9]">
                <Image
                  src={`/vehicles/${image}.png?v=auto-2026`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-4 pb-4 pt-3">
                <div className="flex items-center justify-between text-sm font-bold">
                  {name}
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {caption}
                </p>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
