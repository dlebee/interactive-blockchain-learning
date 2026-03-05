const DEMO_BASE = '/demos'

const SIMULATION_CONTRACTS = [
  'SimpleThresholdVoting',
  'BatchThresholdVoting',
  'BitfieldThresholdVoting',
  'MPCThresholdVoting',
  'BLSThresholdVotingByPubkeys',
  'BLSThresholdVotingByPoP',
] as const

export async function fetchVotingContract(name: string): Promise<string> {
  const res = await fetch(`${DEMO_BASE}/${name}.sol`)
  if (!res.ok) throw new Error(`Failed to load ${name}.sol`)
  return res.text()
}

export async function fetchAllVotingSources(): Promise<{
  SimpleThresholdVoting: string
  BatchThresholdVoting: string
  BitfieldThresholdVoting: string
  MPCThresholdVoting: string
  BLSThresholdVotingByPubkeys: string
  BLSThresholdVotingByPoP: string
}> {
  const [a, b, c, d, e, f] = await Promise.all(
    SIMULATION_CONTRACTS.map((name) => fetchVotingContract(name))
  )
  return {
    SimpleThresholdVoting: a,
    BatchThresholdVoting: b,
    BitfieldThresholdVoting: c,
    MPCThresholdVoting: d,
    BLSThresholdVotingByPubkeys: e,
    BLSThresholdVotingByPoP: f,
  }
}
