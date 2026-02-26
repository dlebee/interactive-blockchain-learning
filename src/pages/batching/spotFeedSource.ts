/**
 * Load SpotFeed.sol from static content (public/demos/SpotFeed.sol).
 * Single source of truth: edit the file in public/demos/.
 */
const SPOT_FEED_URL = '/demos/SpotFeed.sol'

export async function fetchSpotFeedSource(): Promise<string> {
  const res = await fetch(SPOT_FEED_URL)
  if (!res.ok) throw new Error(`Failed to load SpotFeed.sol: ${res.status}`)
  return res.text()
}
