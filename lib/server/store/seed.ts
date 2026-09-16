import { listings, transportJobs } from '../data'
import { demoActivity, type DemoActivity } from '../demo-activity'

export type SeedOptions = {
  /** Load the sample activity (orders, leases, threads, …) on top of the listings. */
  demoActivity?: boolean
}

const empty: Omit<DemoActivity, 'listings' | 'transportJobs'> = {
  submissions: [],
  messages: [],
  leases: [],
  orders: [],
  reviews: [],
  carrierProfiles: [],
  notifications: [],
  threadReads: [],
  accountStatuses: [],
  dealEvents: [],
}

/** Every table's initial rows, newest first where the table lists that way. */
export function seedRows(options: SeedOptions): DemoActivity {
  if (!options.demoActivity) return { ...empty, listings, transportJobs }
  return {
    ...demoActivity,
    listings: [...demoActivity.listings, ...listings],
    transportJobs: [...demoActivity.transportJobs, ...transportJobs],
  }
}
