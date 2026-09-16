import 'server-only'

import { formatYen, type Listing, type ListingModeConfig } from '@/lib/data'

export function buildModes(listing: Listing): ListingModeConfig[] {
  const modes: ListingModeConfig[] = []
  if (listing.leasePerMonth) {
    modes.push({
      id: 'lease',
      title: 'リースする',
      price: `${formatYen(listing.leasePerMonth)}/月`,
      desc: '12〜60ヶ月から期間を選べます。車検や整備込みの条件も相談できます。',
      cta: 'リースを申し込む',
    })
  }
  if (
    listing.residualLease &&
    listing.leasePerMonth &&
    listing.residualLeaseCreditRate
  ) {
    const cap = listing.residualLeaseCreditCap
    modes.push({
      id: 'residualLease',
      title: '残価設定リース',
      price: '満了時に買取',
      desc: '月額で乗り、満了時に残価で買い取るか返却するかを選べます。',
      cta: '残価設定リースを申し込む',
      note: `リース料の${listing.residualLeaseCreditRate}%${cap ? `（上限 ${formatYen(cap)}）` : ''}を買取価格に充当します。`,
    })
  }
  if (listing.salePrice) {
    modes.push({
      id: 'buy',
      title: '購入する',
      price: formatYen(listing.salePrice),
      desc: '写真・状態・走行距離を確認し、出品者と購入条件を相談できます。',
      cta: '購入手続きへ進む',
    })
  }
  return modes
}
