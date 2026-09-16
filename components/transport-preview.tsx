import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/badge'
import { formatYen } from '@/lib/data'
import { getTransportJobs } from '@/lib/server/transport'

export async function TransportPreview() {
  const jobs = (await getTransportJobs()).slice(0, 3)

  return (
    <section className="mx-auto max-w-[1280px] px-5 pb-12 sm:px-8 sm:pb-16">
      <div className="grid overflow-hidden border border-border lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col bg-[#182022] p-7 text-[#f5f5f1] sm:p-10">
          <p className="eyebrow text-[#d9f36c]">FROM SELLER TO YOUR GARAGE</p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
            出会いは全国。
            <br />
            受け取りは、あなたの街で。
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
            遠方の一台も、陸送で手元へ。
            <br />
            引取先と納車先から、運搬パートナーを募集できます。
          </p>
          <Link
            href="/transport/new"
            className="mt-8 inline-flex w-fit items-center gap-6 bg-[#d9f36c] px-5 py-3.5 text-sm font-bold text-[#182022] transition-colors hover:bg-[#e6ff89]"
          >
            陸送を依頼する
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="bg-card p-6 sm:p-9">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-5">
            <div>
              <p className="eyebrow">TRANSPORT BOARD</p>
              <h3 className="mt-2 text-lg font-bold">陸送の案件</h3>
            </div>
            <Link
              href="/transport"
              className="inline-flex items-center gap-2 text-xs font-bold underline-offset-4 hover:underline"
            >
              すべて見る <ArrowRight className="size-4" />
            </Link>
          </div>
          {jobs.length === 0 ? (
            <p className="py-10 text-sm text-muted-foreground">
              現在、掲載中の陸送案件はありません。
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/transport/${job.id}`}
                    className="group block py-5 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold">{job.vehicleName}</p>
                      <Badge
                        variant={job.status === '募集中' ? 'default' : 'muted'}
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span>{job.from}</span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <span>{job.to}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        {job.distanceKm} km / {job.vehicleSize} /{' '}
                        {job.vehicleCount}台
                      </p>
                      <p className="font-display text-lg font-bold tracking-tight">
                        <span className="mr-2 text-[10px] font-normal text-muted-foreground">
                          報酬
                        </span>
                        {formatYen(job.reward)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
