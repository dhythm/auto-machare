import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Truck } from 'lucide-react'
import { BackLink } from '@/components/back-link'
import { LoginPrompt } from '@/components/auth/login-prompt'
import {
  TransportJobForm,
  type TransportJobInitial,
} from '@/components/forms/transport-job-form'
import { PageIntro, PageShell } from '@/components/page-shell'
import { getCurrentUser } from '@/lib/server/auth/session'
import { getListing } from '@/lib/server/listings'

export const metadata: Metadata = { title: '運搬を依頼する | Auto Machare' }

export const dynamic = 'force-dynamic'

async function initialFromListing(
  listingId: string | undefined,
): Promise<TransportJobInitial | undefined> {
  if (!listingId) return undefined
  const listing = await getListing(listingId)
  if (!listing) return undefined
  return {
    vehicleName: listing.name,
    category: listing.category,
    fromPrefecture: listing.prefecture,
    fromCity: listing.city,
  }
}

export default async function NewTransportJobPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>
}) {
  const user = await getCurrentUser()
  const { listingId } = await searchParams
  const initial = await initialFromListing(listingId)
  const callbackUrl = listingId
    ? `/transport/new?listingId=${encodeURIComponent(listingId)}`
    : '/transport/new'
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <BackLink href="/transport" label="運搬案件にもどる" />
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          <div className="lg:sticky lg:top-36 xl:top-24">
            <span className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Truck className="size-5" />
            </span>
            <PageIntro
              title="運搬を依頼する"
              description="大切な車両を、必要な場所へ。希望の区間に合う運搬者を見つけましょう。"
            />
            <Link
              href="/transport/pricing"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              料金のめやす
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-8">
            {user ? (
              <TransportJobForm
                contact={{ name: user.name, email: user.email }}
                initial={initial}
              />
            ) : (
              <LoginPrompt action="運搬を依頼する" callbackUrl={callbackUrl} />
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
