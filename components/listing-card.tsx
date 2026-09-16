import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, ArrowUpRight, Repeat2 } from 'lucide-react'
import { type Listing, formatYen } from '@/lib/data'

export function ListingCard({ listing }: { listing: Listing }) {
  const canBuy = listing.deals.includes('sale')
  const canLease = listing.deals.includes('lease')
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card transition-colors duration-200 hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <div className="relative aspect-[1.5] overflow-hidden bg-muted">
        <Image
          src={
            listing.image.startsWith('/vehicles/')
              ? `${listing.image}?v=auto-2026`
              : listing.image || '/placeholder.svg'
          }
          alt={
            listing.image.startsWith('/vehicles/')
              ? `${listing.category}の参考イメージ`
              : listing.name
          }
          fill
          sizes="(min-width: 1280px) 390px, (min-width: 1024px) 31vw, (min-width: 640px) 45vw, 95vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 text-[10px] font-bold">
          {canBuy && (
            <span className="rounded-sm bg-white/95 px-2.5 py-1 text-[#182022]">
              購入
            </span>
          )}
          {canLease && (
            <span className="rounded-sm bg-[#d9f36c] px-2.5 py-1 text-[#182022]">
              リース
            </span>
          )}
        </div>
        {listing.image.startsWith('/vehicles/') && (
          <span className="absolute bottom-3 left-3 rounded-sm bg-white/95 px-2 py-1 text-[10px] text-muted-foreground">
            参考イメージ
          </span>
        )}
        <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-sm bg-[#182022] text-white transition-colors group-hover:bg-[#d9f36c] group-hover:text-[#182022]">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground">
          {listing.maker} <span className="mx-1.5 text-border">/</span>{' '}
          {listing.category}
        </p>
        <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-bold leading-6 text-foreground">
          {listing.name}
        </h3>
        <div className="mt-4 space-y-1.5">
          {canBuy && listing.salePrice !== undefined && (
            <p className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">
                車両価格
              </span>
              <span className="font-display text-[26px] font-bold leading-tight tracking-tight text-foreground">
                {formatYen(listing.salePrice)}
              </span>
            </p>
          )}
          {canLease && listing.leasePerMonth !== undefined && (
            <p className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">
                月額リース
              </span>
              <span className="font-display text-lg font-semibold text-foreground">
                {formatYen(listing.leasePerMonth)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  / 月
                </span>
              </span>
            </p>
          )}
        </div>
        <dl className="mt-4 grid grid-cols-[0.8fr_1fr_1.25fr] gap-2 border-y border-border py-3">
          <div>
            <dt className="text-[10px] text-muted-foreground">年式</dt>
            <dd className="mt-1 text-xs font-semibold tabular-nums">
              {listing.year}年
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground">走行距離</dt>
            <dd className="mt-1 text-xs font-semibold tabular-nums">
              {listing.mileageKm.toLocaleString('ja-JP')}km
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground">車検</dt>
            <dd className="mt-1 text-xs font-semibold tabular-nums">
              {listing.inspectionExpiresOn || 'なし'}
            </dd>
          </div>
        </dl>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="size-3.5" />
          {listing.prefecture} {listing.city}
          <span className="ml-auto">{listing.condition}</span>
        </div>
        {listing.residualLease && (
          <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-foreground">
            <Repeat2 className="size-3" />
            残価設定リース対応
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[10px] text-muted-foreground">
          <span className="truncate">{listing.seller.name}</span>
          <span className="flex shrink-0 items-center gap-1">
            {listing.seller.reviews > 0 ? (
              <>
                <Star className="size-3 fill-foreground text-foreground" />
                <span className="font-semibold text-foreground">
                  {listing.seller.rating}
                </span>
                ({listing.seller.reviews})
              </>
            ) : (
              '評価なし'
            )}
          </span>
        </div>
      </div>
    </Link>
  )
}
