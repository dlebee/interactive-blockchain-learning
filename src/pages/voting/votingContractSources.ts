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

export async function fetchCircuit(name: string): Promise<string> {
  const res = await fetch(`${DEMO_BASE}/${name}.circom`)
  if (!res.ok) throw new Error(`Failed to load ${name}.circom`)
  return res.text()
}

/** Fetch contract, return null on 404. */
async function fetchContractOptional(name: string): Promise<string | null> {
  const res = await fetch(`${DEMO_BASE}/${name}.sol`)
  if (!res.ok) return null
  return res.text()
}

export async function fetchAllVotingSources(): Promise<{
  SimpleThresholdVoting: string
  BatchThresholdVoting: string
  BitfieldThresholdVoting: string
  MPCThresholdVoting: string
  BLSThresholdVotingByPubkeys: string
  BLSThresholdVotingByPoP: string
  Groth16VotingVerifier: string
  Groth16VotingVerifier5: string | null
  MiMC: string
}> {
  const results = await Promise.all([
    ...SIMULATION_CONTRACTS.map((name) => fetchVotingContract(name)),
    fetchVotingContract('Groth16VotingVerifier'),
    fetchContractOptional('Groth16VotingVerifier5'),
    fetchVotingContract('MiMC'),
  ])
  return {
    SimpleThresholdVoting: results[0]!,
    BatchThresholdVoting: results[1]!,
    BitfieldThresholdVoting: results[2]!,
    MPCThresholdVoting: results[3]!,
    BLSThresholdVotingByPubkeys: results[4]!,
    BLSThresholdVotingByPoP: results[5]!,
    Groth16VotingVerifier: results[6]!,
    Groth16VotingVerifier5: results[7] ?? null,
    MiMC: results[8]!,
  }
}
