import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const channels = [
  {
    label: 'FOR OWNERS',
    title: 'あなたのクルマに、次の出会いを。',
    description: '販売・リースの条件を決めて、車両を掲載。',
    href: '/listings/new',
    action: '車両を出品する',
  },
  {
    label: 'FOR TRANSPORT PARTNERS',
    title: '一台を届ける。その先をつなぐ。',
    description: '積載車と対応エリアを登録して、陸送の仕事を。',
    href: '/transport/register',
    action: '運搬者として登録する',
  },
]

export function RoleChannels() {
  return (
    <section
      aria-label="出品・陸送パートナー登録"
      className="mx-auto grid max-w-[1280px] gap-5 px-5 pb-20 pt-4 sm:px-8 md:grid-cols-2"
    >
      {channels.map((channel) => (
        <Link
          key={channel.href}
          href={channel.href}
          className="group border border-border bg-card p-7 transition-colors hover:border-foreground/50 sm:p-9"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow">{channel.label}</p>
            <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
          <h2 className="mt-6 text-lg font-bold tracking-tight sm:text-xl">
            {channel.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {channel.description}
          </p>
          <span className="mt-8 inline-block border-b border-foreground pb-1 text-sm font-bold">
            {channel.action}
          </span>
        </Link>
      ))}
    </section>
  )
}
