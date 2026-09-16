import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/back-link'
import { LoginPrompt } from '@/components/auth/login-prompt'
import { ListingForm, type ListingEdit } from '@/components/forms/listing-form'
import { PageIntro, PageShell } from '@/components/page-shell'
import type { Listing } from '@/lib/data'
import { canManage } from '@/lib/server/auth/access'
import { getCurrentUser } from '@/lib/server/auth/session'
import { getListing } from '@/lib/server/listings'

export const metadata: Metadata = { title: '出品を編集する | Auto Machare' }

export const dynamic = 'force-dynamic'

function toEdit(listing: Listing): ListingEdit {
  const text = (value: number | undefined) =>
    value === undefined ? '' : String(value)
  return {
    listingId: listing.id,
    values: {
      name: listing.name,
      category: listing.category,
      maker: listing.maker,
      model: listing.model,
      year: String(listing.year),
      mileageKm: String(listing.mileageKm),
      inspectionExpiresOn: listing.inspectionExpiresOn ?? '',
      condition: listing.condition,
      prefecture: listing.prefecture,
      city: listing.city,
      deals: listing.deals,
      salePrice: text(listing.salePrice),
      leasePerMonth: text(listing.leasePerMonth),
      residualLease: listing.residualLease ?? false,
      residualLeaseCreditRate: text(listing.residualLeaseCreditRate),
      residualLeaseCreditCap: text(listing.residualLeaseCreditCap),
      summary: listing.summary,
      sellerName: listing.seller.name,
      sellerKind: listing.seller.kind,
      contactEmail: '',
    },
    images: listing.images ?? [],
    thumbnail: listing.image.startsWith('data:') ? listing.image : undefined,
  }
}

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  const listing = await getListing(id)
  if (!listing) notFound()
  if (user && !canManage(user, listing)) notFound()

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <BackLink href={`/listings/${id}`} label="車両の詳細にもどる" />
        <div className="mt-6">
          <PageIntro title="出品を編集する" />
        </div>
        <div className="mt-8">
          {user ? (
            <ListingForm
              contact={{ name: user.name, email: user.email }}
              edit={{
                ...toEdit(listing),
                values: { ...toEdit(listing).values, contactEmail: user.email },
              }}
            />
          ) : (
            <LoginPrompt
              action="出品を編集する"
              callbackUrl={`/listings/${id}/edit`}
            />
          )}
        </div>
      </div>
    </PageShell>
  )
}
