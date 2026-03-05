import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { GasPriceUsdInput, gasToUsd, hasValidUsdInputs } from '../../components/GasPriceUsdInput'
import {
  runAllVotingSimulations,
  SIGNER_COUNTS,
  type AllSimResults,
} from './runVotingSimulation'
import { fetchVotingContract, fetchAllVotingSources } from './votingContractSources'
import './VotingPage.css'

type ContractState = { status: 'loading' } | { status: 'ready'; source: string } | { status: 'error'; message: string }

function ContractBlock({ name, state }: { name: string; state: ContractState }) {
  return (
    <details className="voting-contract-panel">
      <summary>{name}.sol</summary>
      <div className="voting-code-block">
        {state.status === 'loading' && <p className="voting-loading">Loading…</p>}
        {state.status === 'error' && <p className="voting-error" role="alert">{state.message}</p>}
        {state.status === 'ready' && (
          <SyntaxHighlighter
            language="solidity"
            style={oneDark}
            customStyle={{ margin: 0, padding: '1rem 1.25rem', borderRadius: '0 0 8px 8px', fontSize: '0.85rem' }}
            codeTagProps={{ style: { fontFamily: 'ui-monospace, monospace' } }}
          >
            {state.source}
          </SyntaxHighlighter>
        )}
      </div>
    </details>
  )
}

const CHART_COLORS = {
  simple: 'rgba(6, 182, 212, 0.85)',
  batch: 'rgba(251, 191, 36, 0.85)',
  bitfield: 'rgba(134, 239, 172, 0.85)',
  mpc: 'rgba(236, 72, 153, 0.85)',
  blsByPubkeys: 'rgba(139, 92, 246, 0.85)',
  blsByPoP: 'rgba(99, 102, 241, 0.85)',
  grid: 'rgba(148, 163, 184, 0.15)',
  axis: 'rgba(148, 163, 184, 0.8)',
}

const STRATEGY_LABELS: Record<string, string> = {
  simple: 'Simple (N txs)',
  batch: 'Batch (1 tx)',
  bitfield: 'Bitfield (1 tx)',
  mpc: 'MPC with TSS (1 tx, 1 ecrecover)',
  blsByPubkeys: 'BLS ByPubkeys (G1MSM + pairing)',
  blsByPoP: 'BLS ByPoP (n PoP + G1MSM + pairing)',
}

function gasForResult(r: { gasUsed?: bigint; gasTotal?: bigint }): number | null {
  const g = r.gasTotal ?? r.gasUsed
  return g != null ? Number(g) : null
}

export function VotingPage() {
  const [simpleState, setSimpleState] = useState<ContractState>({ status: 'loading' })
  const [batchState, setBatchState] = useState<ContractState>({ status: 'loading' })
  const [bitfieldState, setBitfieldState] = useState<ContractState>({ status: 'loading' })
  const [mpcState, setMpcState] = useState<ContractState>({ status: 'loading' })
  const [blsByPubkeysState, setBlsByPubkeysState] = useState<ContractState>({ status: 'loading' })
  const [blsByPoPState, setBlsByPoPState] = useState<ContractState>({ status: 'loading' })
  const [groth16State, setGroth16State] = useState<ContractState>({ status: 'loading' })
  const [sources, setSources] = useState<Awaited<ReturnType<typeof fetchAllVotingSources>> | null>(null)
  const [gasPriceGwei, setGasPriceGwei] = useState('')
  const [nativeTokenUsd, setNativeTokenUsd] = useState('')

  const [allResults, setAllResults] = useState<AllSimResults | null>(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<{ strategy: string; signerCount: number | null } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasUsdInputs = hasValidUsdInputs(gasPriceGwei, nativeTokenUsd)
  const formatGasUsd = (gas: bigint | number) => gasToUsd(gas, gasPriceGwei, nativeTokenUsd)

  useEffect(() => {
    Promise.all([
      fetchVotingContract('SimpleThresholdVoting'),
      fetchVotingContract('BatchThresholdVoting'),
      fetchVotingContract('BitfieldThresholdVoting'),
      fetchVotingContract('MPCThresholdVoting'),
      fetchVotingContract('BLSThresholdVotingByPubkeys'),
      fetchVotingContract('BLSThresholdVotingByPoP'),
      fetchVotingContract('Groth16VotingVerifier'),
    ])
      .then(([a, b, c, d, e, f, g]) => {
        setSimpleState({ status: 'ready', source: a })
        setBatchState({ status: 'ready', source: b })
        setBitfieldState({ status: 'ready', source: c })
        setMpcState({ status: 'ready', source: d })
        setBlsByPubkeysState({ status: 'ready', source: e })
        setBlsByPoPState({ status: 'ready', source: f })
        setGroth16State({ status: 'ready', source: g })
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : String(e)
        setSimpleState({ status: 'error', message: msg })
        setBatchState({ status: 'error', message: msg })
        setBitfieldState({ status: 'error', message: msg })
        setMpcState({ status: 'error', message: msg })
        setBlsByPubkeysState({ status: 'error', message: msg })
        setBlsByPoPState({ status: 'error', message: msg })
        setGroth16State({ status: 'error', message: msg })
      })
  }, [])

  useEffect(() => {
    fetchAllVotingSources()
      .then(setSources)
      .catch(() => setSources(null))
  }, [])

  const handleSimulate = async () => {
    if (!sources) return
    setAllResults(null)
    setError(null)
    setRunning(true)
    try {
      const res = await runAllVotingSimulations(sources, (strategy, signerCount) => {
        setProgress({ strategy, signerCount })
      })
      setAllResults(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
      setProgress(null)
    }
  }

  const chartData = allResults
    ? SIGNER_COUNTS.map((n) => {
        const s = allResults.simple.results.find((r) => r.signerCount === n)
        const b = allResults.batch.results.find((r) => r.signerCount === n)
        const bf = allResults.bitfield.results.find((r) => r.signerCount === n)
        const m = allResults.mpc.results.find((r) => r.signerCount === n)
        const blPk = allResults.blsByPubkeys.results.find((r) => r.signerCount === n)
        const blPop = allResults.blsByPoP.results.find((r) => r.signerCount === n)
        return {
          signerCount: n,
          simple: s?.ok ? gasForResult(s) : null,
          batch: b?.ok ? gasForResult(b) : null,
          bitfield: bf?.ok ? gasForResult(bf) : null,
          mpc: m?.ok ? gasForResult(m) : null,
          blsByPubkeys: blPk?.ok ? gasForResult(blPk) : null,
          blsByPoP: blPop?.ok ? gasForResult(blPop) : null,
        }
      })
    : []

  const hasChartData = chartData.some(
    (d) =>
      d.simple != null ||
      d.batch != null ||
      d.bitfield != null ||
      d.mpc != null ||
      d.blsByPubkeys != null ||
      d.blsByPoP != null
  )

  return (
    <div className="page">
      <h1 id="voting">
        <a href="#voting" className="anchor-link" aria-label="Link to this section">
          Multi participant voting
        </a>
      </h1>
      <p className="lead">
        Multiple participants can vote on data and submit the result to the blockchain.
        Different strategies trade off censorship resistance, gas cost, and complexity.
      </p>

      <h2 id="simulate-gas">
        <a href="#simulate-gas" className="anchor-link" aria-label="Link to this section">
          Simulate gas costs
        </a>
      </h2>
      <p>
        Run all strategies for 5, 10, 15, 30, 100, 200, 300, and 500 signers. Bitfield
        is limited to 256 signers.
      </p>
      <div className="voting-sim-section">
        <button
          type="button"
          className="voting-sim-btn"
          disabled={!sources || running}
          onClick={handleSimulate}
        >
          {running
            ? `Simulating… ${progress ? `${progress.strategy} ${progress.signerCount ?? ''}` : ''}`.trim()
            : 'Simulate all'}
        </button>
        {error && (
          <p className="voting-error" role="alert">
            Simulation failed: {error}
          </p>
        )}
        {allResults && hasChartData && (
          <>
            <div className="voting-chart-wrap">
              <h3 className="voting-chart-title">Gas vs signer count</h3>
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={chartData} margin={{ top: 24, right: 24, left: 0, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis
                    dataKey="signerCount"
                    stroke={CHART_COLORS.axis}
                    tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                    tickLine={{ stroke: CHART_COLORS.axis }}
                    axisLine={{ stroke: CHART_COLORS.axis }}
                    label={{
                      value: 'Signers',
                      position: 'insideBottom',
                      offset: -12,
                      fill: CHART_COLORS.axis,
                    }}
                  />
                  <YAxis
                    stroke={CHART_COLORS.axis}
                    tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                    tickLine={{ stroke: CHART_COLORS.axis }}
                    axisLine={{ stroke: CHART_COLORS.axis }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      borderRadius: 6,
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number | undefined) => [
                      value != null ? value.toLocaleString() : 'n/a',
                      'Gas',
                    ]}
                    labelFormatter={(label) => `Signers: ${label}`}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 8 }} />
                  <Line
                    type="monotone"
                    dataKey="simple"
                    stroke={CHART_COLORS.simple}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.simple }}
                    name={STRATEGY_LABELS.simple}
                    connectNulls
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="batch"
                    stroke={CHART_COLORS.batch}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.batch }}
                    name={STRATEGY_LABELS.batch}
                    connectNulls
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="bitfield"
                    stroke={CHART_COLORS.bitfield}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.bitfield }}
                    name={STRATEGY_LABELS.bitfield}
                    connectNulls
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="mpc"
                    stroke={CHART_COLORS.mpc}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.mpc }}
                    name={STRATEGY_LABELS.mpc}
                    connectNulls
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="blsByPubkeys"
                    stroke={CHART_COLORS.blsByPubkeys}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.blsByPubkeys }}
                    name={STRATEGY_LABELS.blsByPubkeys}
                    connectNulls
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="blsByPoP"
                    stroke={CHART_COLORS.blsByPoP}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.blsByPoP }}
                    name={STRATEGY_LABELS.blsByPoP}
                    connectNulls
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="voting-tables-collapsed">
              {(['simple', 'batch', 'bitfield', 'mpc', 'blsByPubkeys', 'blsByPoP'] as const).map((key) => {
                const result = allResults[key]
                return (
                  <details key={key} className="voting-table-details">
                    <summary>{STRATEGY_LABELS[key]}</summary>
                    <div className="voting-table-wrap">
                      <table className="voting-table">
                        <thead>
                          <tr>
                            <th>Signers</th>
                            <th>Status</th>
                            <th>Gas</th>
                            {hasUsdInputs && <th>USD</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {result.results.map((r) => (
                            <tr key={r.signerCount} className={r.ok ? '' : 'voting-row-failed'}>
                              <td>{r.signerCount}</td>
                              <td>{r.ok ? 'OK' : 'Failed'}</td>
                              <td>
                                {r.ok
                                  ? r.gasTotal != null
                                    ? `${r.gasTotal.toLocaleString()} total`
                                    : r.gasUsed!.toLocaleString()
                                  : r.error}
                              </td>
                              {hasUsdInputs && (
                                <td>
                                  {r.ok && (r.gasTotal ?? r.gasUsed) != null
                                    ? formatGasUsd(r.gasTotal ?? r.gasUsed!)
                                    : ''}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )
              })}
            </div>
          </>
        )}
      </div>

      <h2 id="simple-model">
        <a href="#simple-model" className="anchor-link" aria-label="Link to this section">
          Simple model: per vote submission
        </a>
      </h2>
      <p>
        The simplest strategy: each participant has an off chain identifier (e.g. a sequential
        number). For each sequence number they attach a signature over the data. Format:{' '}
        <code>(seqNum, data, signature)</code>.
      </p>
      <p>
        The chain expects a threshold to be met. Once enough valid signatures for the same
        (seqNum, data) are submitted, that sequence number is considered agreed and the
        data is accepted.
      </p>
      <p>
        <strong>Benefit: censorship resistance.</strong> No single participant is responsible
        to aggregate the votes and send them to the blockchain. Anyone can submit any vote.
        A censoring aggregator cannot block the outcome.
      </p>
      <ContractBlock name="SimpleThresholdVoting" state={simpleState} />

      <h2 id="batch-model">
        <a href="#batch-model" className="anchor-link" aria-label="Link to this section">
          Batch model: off chain aggregation
        </a>
      </h2>
      <p>
        Participants connect in a P2P network. For each sequence number they agree on data
        off chain. Anyone can submit the aggregation (we avoid the question of who submits).
      </p>
      <p>
        In an environment where censorship of disagreement is acceptable, this is cheaper.
        One transaction carries all signatures instead of N transactions. Each individual
        vote would cost 21,000 gas base (see the <Link to="/advanced-topics/batching/basic">batching</Link> section).
        Batching saves that overhead.
      </p>
      <ContractBlock name="BatchThresholdVoting" state={batchState} />

      <h2 id="bitfield-ecdsa">
        <a href="#bitfield-ecdsa" className="anchor-link" aria-label="Link to this section">
          Bitfield + ECDSA aggregation
        </a>
      </h2>
      <p>
        An optimization: use a bitfield to indicate which voters participated, plus ECDSA
        signatures. Benefits: (1) Less worried about double voting, since the bitfield
        enforces uniqueness per voter. (2) More gas efficient: compact representation
        and batch ecrecover.
      </p>
      <p>
        Bitfield is limited to 256 signers (single uint256). For 300 and 500 signers the
        simulation is skipped.
      </p>
      <ContractBlock name="BitfieldThresholdVoting" state={bitfieldState} />

      <h2 id="mpc">
        <a href="#mpc" className="anchor-link" aria-label="Link to this section">
          MPC with TSS
        </a>
      </h2>
      <p>
        N participants run a threshold signature protocol off-chain (e.g. threshold ECDSA).
        The result is one signature from a derived address. One EOA submits it in one
        transaction. Gas is constant regardless of signer count: one ecrecover.
      </p>
      <ContractBlock name="MPCThresholdVoting" state={mpcState} />

      <h2 id="bls">
        <a href="#bls" className="anchor-link" aria-label="Link to this section">
          BLS aggregation
        </a>
      </h2>
      <p>
        When BLS precompiles (EIP-2537) are present, BLS signatures can be aggregated
        into one. Verification cost is roughly constant regardless of signer count. BLS
        becomes practical once you reach a certain number of voters (typically 50 to 100+),
        where the cost of one BLS verify is less than N ecrecover calls.
      </p>
      <p>
        Benchmark: ECDSA with 50 signers costs ~50 × 3,000 gas ≈ 150,000 gas for ecrecover.
        BLS aggregate verify is on the order of 100,000 to 200,000 gas depending on the
        precompile. The crossover is around 50 to 100 signers.
      </p>
      <p>
        To prevent rogue key attacks, you must ensure the aggregate public key matches
        the eligible signers. Two approaches:
      </p>
      <p>
        <strong>By pubkeys:</strong> The contract stores a fixed set of eligible G1 pubkeys at
        construction. On vote submission it computes G1MSM of the selected pubkeys and checks
        that the aggregate key in the pairing input matches. Only votes from that set are valid.
      </p>
      <p>
        <strong>By Proof of Possession (PoP):</strong> Pubkeys are not pre registered. Instead,
        each signer must prove they possess the private key by submitting a PoP pairing (e.g.
        sign hash(pubkey) and verify on chain). Only after PoP verification can a pubkey be used
        in votes. This avoids rogue keys without a fixed pubkey set.
      </p>
      <ContractBlock name="BLSThresholdVotingByPubkeys" state={blsByPubkeysState} />
      <ContractBlock name="BLSThresholdVotingByPoP" state={blsByPoPState} />

      <h2 id="groth16">
        <a href="#groth16" className="anchor-link" aria-label="Link to this section">
          Groth16 circuit
        </a>
      </h2>
      <p>
        For very large voter sets (e.g. 500), a Groth16 ZK-SNARK circuit can prove that
        enough participants signed the data. The on-chain verifier does a single pairing
        check (~200,000 gas), independent of voter count. Gas cost of aggregation is much
        lower than BLS for large N.
      </p>
      <p>
        <strong>EDDSA is required.</strong> ECDSA is highly inefficient to aggregate in
        ZK-SNARKs (non-native field arithmetic, many constraints). EdDSA (e.g. Ed25519) is
        SNARK friendly and is used in such circuits.
      </p>
      <ContractBlock name="Groth16VotingVerifier" state={groth16State} />

      <GasPriceUsdInput
        gasPriceGwei={gasPriceGwei}
        onGasPriceChange={setGasPriceGwei}
        nativeTokenUsd={nativeTokenUsd}
        onNativeTokenChange={setNativeTokenUsd}
        caption="Enter gas price and native token value to see USD costs in the tables above."
        className="voting-usd-inputs"
      />

      <p className="page-next-link">
        <Link to="/oracles">Oracles</Link>
        {' · '}
        <Link to="/blockspace">Blockspace</Link>
      </p>
    </div>
  )
}
