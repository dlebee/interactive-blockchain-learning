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
import { fetchVotingContract, fetchCircuit, fetchAllVotingSources } from './votingContractSources'
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

function CodeBlock({
  name,
  state,
  language = 'c',
}: {
  name: string
  state: ContractState
  language?: string
}) {
  return (
    <details className="voting-contract-panel">
      <summary>{name}</summary>
      <div className="voting-code-block">
        {state.status === 'loading' && <p className="voting-loading">Loading…</p>}
        {state.status === 'error' && <p className="voting-error" role="alert">{state.message}</p>}
        {state.status === 'ready' && (
          <SyntaxHighlighter
            language={language}
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
  simple: 'rgba(6, 182, 212, 0.9)',
  batch: 'rgba(245, 158, 11, 0.9)',
  bitfield: 'rgba(167, 139, 250, 0.9)',
  mpc: 'rgba(236, 72, 153, 0.9)',
  blsByPubkeys: 'rgba(244, 114, 182, 0.9)',
  blsByPoP: 'rgba(59, 130, 246, 0.9)',
  groth16: 'rgba(34, 197, 94, 0.9)',
  groth16Extrapolated: 'rgba(148, 163, 184, 0.7)',
  grid: 'rgba(148, 163, 184, 0.15)',
  axis: 'rgba(148, 163, 184, 0.85)',
}

const VOTING_SIM_STORAGE_KEY = 'voting-sim-results'

/** Extrapolate totalMs for signer count from benchmark results (linear interpolation/extrapolation). */
function extrapolateProvingMs(
  signers: number,
  results: Array<{ signers: number; totalMs: number }>
): number {
  const sorted = [...results].sort((a, b) => a.signers - b.signers)
  const exact = sorted.find((r) => r.signers === signers)
  if (exact) return exact.totalMs
  if (signers <= sorted[0].signers) {
    const [a, b] = sorted
    const t = (signers - a.signers) / (b.signers - a.signers)
    return a.totalMs + t * (b.totalMs - a.totalMs)
  }
  if (signers >= sorted[sorted.length - 1].signers) {
    const [a, b] = sorted.slice(-2)
    const t = (signers - a.signers) / (b.signers - a.signers)
    return a.totalMs + t * (b.totalMs - a.totalMs)
  }
  const i = sorted.findIndex((r) => r.signers > signers) - 1
  const [a, b] = [sorted[i], sorted[i + 1]]
  const t = (signers - a.signers) / (b.signers - a.signers)
  return a.totalMs + t * (b.totalMs - a.totalMs)
}

function serializeSimResults(data: AllSimResults): string {
  const raw: Record<string, unknown> = {
    simple: data.simple,
    batch: data.batch,
    bitfield: data.bitfield,
    mpc: data.mpc,
    blsByPubkeys: data.blsByPubkeys,
    blsByPoP: data.blsByPoP,
  }
  if (data.groth16 != null) {
    raw.groth16 = {
      gasUsed: data.groth16.gasUsed.toString(),
      ok: data.groth16.ok,
      error: data.groth16.error,
    }
  }
  const stringify = (obj: unknown): unknown => {
    if (obj == null) return obj
    if (typeof obj === 'bigint') return obj.toString()
    if (Array.isArray(obj)) return obj.map(stringify)
    if (typeof obj === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(obj)) out[k] = stringify(v)
      return out
    }
    return obj
  }
  return JSON.stringify(stringify(raw))
}

function parseSimResults(json: string): AllSimResults | null {
  try {
    const raw = JSON.parse(json) as Record<string, unknown>
    const reviver = (obj: unknown): unknown => {
      if (obj == null) return obj
      if (Array.isArray(obj)) return obj.map(reviver)
      if (typeof obj === 'object') {
        const o = obj as Record<string, unknown>
        if ('gasUsed' in o && typeof o.gasUsed === 'string' && !('results' in o)) {
          return { ...o, gasUsed: BigInt(o.gasUsed) }
        }
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(o)) out[k] = reviver(v)
        return out
      }
      return obj
    }
    const parsed = reviver(raw) as Record<string, unknown>
    const toBigint = (x: unknown): bigint => (typeof x === 'string' ? BigInt(x) : (x as bigint))
    const mapResult = (r: Record<string, unknown>) => ({
      signerCount: r.signerCount as number,
      ok: r.ok as boolean,
      gasUsed: r.gasUsed != null ? toBigint(r.gasUsed) : undefined,
      gasTotal: r.gasTotal != null ? toBigint(r.gasTotal) : undefined,
      error: r.error as string | undefined,
    })
    const mapStrategy = (s: Record<string, unknown>) => ({
      strategy: s.strategy,
      results: (s.results as Record<string, unknown>[]).map(mapResult),
    })
    const result: AllSimResults = {
      simple: mapStrategy(parsed.simple as Record<string, unknown>) as AllSimResults['simple'],
      batch: mapStrategy(parsed.batch as Record<string, unknown>) as AllSimResults['batch'],
      bitfield: mapStrategy(parsed.bitfield as Record<string, unknown>) as AllSimResults['bitfield'],
      mpc: mapStrategy(parsed.mpc as Record<string, unknown>) as AllSimResults['mpc'],
      blsByPubkeys: mapStrategy(parsed.blsByPubkeys as Record<string, unknown>) as AllSimResults['blsByPubkeys'],
      blsByPoP: mapStrategy(parsed.blsByPoP as Record<string, unknown>) as AllSimResults['blsByPoP'],
    }
    if (parsed.groth16 != null) {
      const g = parsed.groth16 as Record<string, unknown>
      result.groth16 = {
        gasUsed: toBigint(g.gasUsed),
        ok: g.ok as boolean,
        error: g.error as string | undefined,
      }
    }
    return result
  } catch {
    return null
  }
}

const STRATEGY_LABELS: Record<string, string> = {
  simple: 'Simple (N txs)',
  batch: 'Batch (1 tx)',
  bitfield: 'Bitfield (1 tx)',
  mpc: 'MPC with TSS (1 tx, 1 ecrecover)',
  blsByPubkeys: 'BLS ByPubkeys (G1MSM + pairing)',
  blsByPoP: 'BLS ByPoP (n PoP + G1MSM + pairing)',
  groth16: 'Groth16 (1 tx, constant gas)',
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
  const [mimcState, setMimcState] = useState<ContractState>({ status: 'loading' })
  const [groth16CircuitState, setGroth16CircuitState] = useState<ContractState>({ status: 'loading' })
  const [groth16BenchmarkData, setGroth16BenchmarkData] = useState<{
    results: Array<{ signers: number; totalMs: number; witnessMs?: number; proofMs?: number }>
    gasEstimate?: number
  } | null>(null)
  const [sources, setSources] = useState<Awaited<ReturnType<typeof fetchAllVotingSources>> | null>(null)
  const [gasPriceGwei, setGasPriceGwei] = useState('')
  const [nativeTokenUsd, setNativeTokenUsd] = useState('')

  const [allResults, setAllResults] = useState<AllSimResults | null>(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<{ strategy: string; signerCount: number | null } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hiddenChartSeries, setHiddenChartSeries] = useState<Set<string>>(() => new Set())

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
      fetchVotingContract('MiMC'),
      fetchCircuit('Groth16Voting'),
    ])
      .then(([a, b, c, d, e, f, g, h, circuit]) => {
        setSimpleState({ status: 'ready', source: a })
        setBatchState({ status: 'ready', source: b })
        setBitfieldState({ status: 'ready', source: c })
        setMpcState({ status: 'ready', source: d })
        setBlsByPubkeysState({ status: 'ready', source: e })
        setBlsByPoPState({ status: 'ready', source: f })
        setGroth16State({ status: 'ready', source: g })
        setMimcState({ status: 'ready', source: h })
        setGroth16CircuitState({ status: 'ready', source: circuit })
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
        setMimcState({ status: 'error', message: msg })
        setGroth16CircuitState({ status: 'error', message: msg })
      })
  }, [])

  useEffect(() => {
    fetch('/demos/groth16_benchmark_results.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.results?.length && setGroth16BenchmarkData(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchAllVotingSources()
      .then(setSources)
      .catch(() => setSources(null))
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(VOTING_SIM_STORAGE_KEY)
    if (stored) {
      const parsed = parseSimResults(stored)
      if (parsed) setAllResults(parsed)
    }
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
      try {
        localStorage.setItem(VOTING_SIM_STORAGE_KEY, serializeSimResults(res))
      } catch {
        // ignore storage quota / private mode
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
      setProgress(null)
    }
  }

  const groth16Gas = allResults?.groth16?.ok ? Number(allResults.groth16.gasUsed) : null

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
          groth16: groth16Gas,
        }
      })
    : []

  const chartDataForChart = chartData.map((point) => {
    const p = { ...point }
    hiddenChartSeries.forEach((key) => {
      if (key in p) (p as Record<string, unknown>)[key] = null
    })
    return p
  })

  const hasChartData =
    chartData.some(
      (d) =>
        d.simple != null ||
        d.batch != null ||
        d.bitfield != null ||
        d.mpc != null ||
        d.blsByPubkeys != null ||
        d.blsByPoP != null ||
        groth16Gas != null
    ) || allResults?.groth16 != null

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
      <p>
        <strong>Only the simple model (each participant submits their vote individually) is
        censorship resistant.</strong> No single party can block the outcome, since anyone
        can submit any vote. The other strategies rely on aggregation or a single submitter,
        which a censoring party could block. That said, individual submission is not always
        viable: gas cost scales with signer count, and for large committees the cost or
        coordination may be prohibitive.
      </p>
      <p>
        Censorship does not prevent the majority from being reached: if enough votes get
        through, the threshold is met. It can only delay or block the outcome. In many
        settings, keeping gas costs low is more beneficial than censorship resistance,
        and the cheaper strategies (batch, bitfield, MPC, BLS) are the right choice.
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
              <ResponsiveContainer width="100%" height={440}>
                <LineChart data={chartDataForChart} margin={{ top: 28, right: 28, left: 8, bottom: 28 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis
                    dataKey="signerCount"
                    stroke={CHART_COLORS.axis}
                    tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
                    tickLine={{ stroke: CHART_COLORS.axis }}
                    axisLine={{ stroke: CHART_COLORS.axis }}
                    label={{
                      value: 'Signers',
                      position: 'insideBottom',
                      offset: -14,
                      fill: CHART_COLORS.axis,
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    stroke={CHART_COLORS.axis}
                    tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
                    tickLine={{ stroke: CHART_COLORS.axis }}
                    axisLine={{ stroke: CHART_COLORS.axis }}
                    tickFormatter={(v) =>
                      v >= 1_000_000
                        ? `${(v / 1e6).toFixed(1).replace(/\.0$/, '')}M`
                        : `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.97)',
                      border: '1px solid rgba(148, 163, 184, 0.35)',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                    labelStyle={{ color: '#e2e8f0', fontSize: 13 }}
                    formatter={(value: number | undefined) => [
                      value != null ? value.toLocaleString() : 'n/a',
                      'Gas',
                    ]}
                    labelFormatter={(label) => `Signers: ${label}`}
                  />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ paddingBottom: 10 }}
                    iconSize={12}
                    content={(props) => {
                      const { payload } = props
                      return (
                        <ul className="voting-chart-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem', justifyContent: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
                          {payload?.map((entry) => {
                            const key = String(entry.dataKey ?? entry.value)
                            const isHidden = hiddenChartSeries.has(key)
                            return (
                              <li
                                key={key}
                                role="button"
                                tabIndex={0}
                                className="voting-chart-legend-item"
                                style={{
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  opacity: isHidden ? 0.5 : 1,
                                }}
                                onClick={() => setHiddenChartSeries((prev) => {
                                  const next = new Set(prev)
                                  if (next.has(key)) next.delete(key)
                                  else next.add(key)
                                  return next
                                })}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e.currentTarget as HTMLElement).click() } }}
                              >
                                <span style={{ width: 14, height: 2, backgroundColor: entry.color, flexShrink: 0 }} aria-hidden />
                                <span>{entry.value}</span>
                              </li>
                            )
                          })}
                        </ul>
                      )
                    }}
                  />
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
                  <Line
                    type="monotone"
                    dataKey="groth16"
                    stroke={CHART_COLORS.groth16}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.groth16 }}
                    name={STRATEGY_LABELS.groth16}
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
              {allResults.groth16 != null && (
                <details className="voting-table-details">
                  <summary>{STRATEGY_LABELS.groth16}</summary>
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
                        <tr className={allResults.groth16.ok ? '' : 'voting-row-failed'}>
                          <td>any</td>
                          <td>{allResults.groth16.ok ? 'OK' : 'Failed'}</td>
                          <td>
                            {allResults.groth16.ok
                              ? allResults.groth16.gasUsed.toLocaleString()
                              : allResults.groth16.error}
                          </td>
                          {hasUsdInputs && (
                            <td>
                              {allResults.groth16.ok
                                ? formatGasUsd(allResults.groth16.gasUsed)
                                : ''}
                            </td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </details>
              )}
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
        For very large voter sets (e.g. 300), a Groth16 ZK-SNARK circuit can prove that
        enough participants signed the data. The on-chain verifier does a single pairing
        check (~200,000 gas), independent of voter count. Gas cost of aggregation is much
        lower than BLS for large N.
      </p>
      <p>
        <strong>EDDSA is required.</strong> ECDSA is highly inefficient to aggregate in
        ZK-SNARKs (non-native field arithmetic, many constraints). EdDSA (e.g. Ed25519) is
        SNARK friendly and is used in such circuits.
      </p>
      <p>
        <strong>Circuit structure: single data, threshold check.</strong> The circuit takes
        the agreed data (or its hash) and the threshold as public inputs. Privately, it
        receives a list of (signature, pubkey) pairs. For each pair it verifies the EdDSA
        signature over the data, counts valid votes, and asserts count ≥ threshold. The
        verifier only learns that enough eligible signers endorsed the given data, not
        which signers or how many beyond the threshold. A multi data design (e.g. votes
        for different data in one proof) would require a larger circuit and more complex
        logic; in practice you run one proof per sequence number and agreed data.
      </p>
      <p>
        <strong>Use MiMC for the hash, not Poseidon.</strong> dataHash = MiMC(seqNum,
        keccak256(data) % R) binds the sequence to the proof. The circuit never computes
        keccak256; signers sign over this dataHash. Use <code>verifyAndRecordWithBytes</code>{' '}
        to pass raw data; the contract computes the hash on-chain.
      </p>
      <p>
        <strong>Static signer count: 300.</strong> The template circuit is compiled for a
        fixed number of signers (e.g. 300). The Groth16 pairing check alone costs ~200,000
        gas. The rest of verification adds roughly 50,000 to 90,000 gas: vk_x computation
        (EC mul/add for public inputs, ~13,000), optional MiMC hash when using{' '}
        <code>verifyAndRecordWithBytes</code> (~40,000), and storage writes for agreed state
        (~40,000 cold). Total: ~250,000 to 290,000 gas for a full verify and record.
      </p>
      <p>
        <strong>Fixed signer set: all must sign.</strong> This circuit is built for a fixed
        number of signers; every run requires that many participants to sign. It is a
        template and not a perfect fit for all use cases (e.g. optional participation or
        variable committee size would need a different design).
      </p>
      <p>
        <strong>On-chain cost does not grow with signers.</strong> The verifier always
        does one pairing check (~200k gas) regardless of how many signers the circuit
        proves. Proving time, however, grows with the number of EdDSA verifications in the
        circuit. The chart below shows proving time vs signer count for a 50 signer
        variant (see <code>zk-build/</code>). Values for signer counts not in the benchmark
        set are extrapolated (different color), not measured.
      </p>
      {groth16BenchmarkData && (() => {
        const benchmarkedSet = new Set(groth16BenchmarkData.results.map((r) => r.signers))
        const extrapolatedSignerCounts = [15, 30, 100, 200, 300, 500].filter((n) => !benchmarkedSet.has(n))
        const allSignerCounts = [
          ...groth16BenchmarkData.results.map((r) => r.signers),
          ...extrapolatedSignerCounts,
        ].sort((a, b) => a - b)
        const chartData = allSignerCounts.map((signers) => {
          const isBenchmarked = benchmarkedSet.has(signers)
          const totalMs = isBenchmarked
            ? groth16BenchmarkData.results.find((r) => r.signers === signers)!.totalMs
            : extrapolateProvingMs(signers, groth16BenchmarkData.results)
          const sec = totalMs / 1000
          return {
            signers,
            benchmarkedSec: isBenchmarked ? sec : null,
            extrapolatedSec: isBenchmarked ? null : sec,
          }
        })
        return (
          <div className="voting-chart-wrap" style={{ marginBottom: '1.5rem' }}>
            <h3 className="voting-chart-title">Proving time vs signer count (Groth16)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={chartData}
                margin={{ top: 16, right: 16, left: 0, bottom: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis
                  dataKey="signers"
                  stroke={CHART_COLORS.axis}
                  tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                  label={{ value: 'Signers', position: 'insideBottom', offset: -8, fill: CHART_COLORS.axis }}
                />
                <YAxis
                  stroke={CHART_COLORS.axis}
                  tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                  tickFormatter={(v) => `${v}s`}
                  label={{ value: 'Proving time', angle: -90, position: 'insideLeft', fill: CHART_COLORS.axis }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: 6,
                  }}
                  formatter={(value: number | undefined, name?: string) => [
                    value != null ? `${value.toFixed(1)}s` : 'n/a',
                    name === 'benchmarkedSec' ? 'Proving time (benchmarked)' : 'Proving time (extrapolated)',
                  ]}
                  labelFormatter={(label) => `Signers: ${label}`}
                />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: 6 }}
                  iconSize={10}
                  formatter={(value) => (value === 'benchmarkedSec' ? 'Proving time (benchmarked)' : 'Proving time (extrapolated, not measured)')}
                />
                <Line
                  type="monotone"
                  dataKey="benchmarkedSec"
                  stroke={CHART_COLORS.groth16}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.groth16 }}
                  name="benchmarkedSec"
                  connectNulls
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="extrapolatedSec"
                  stroke={CHART_COLORS.groth16Extrapolated}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ fill: CHART_COLORS.groth16Extrapolated }}
                  name="extrapolatedSec"
                  connectNulls
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="voting-chart-caption" style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
              On-chain verification gas stays constant (~{((groth16BenchmarkData.gasEstimate ?? 200000) / 1000).toFixed(0)}k gas) regardless of signer count.
              Extrapolated points (dashed line) were not benchmarked; they are estimated from the measured curve.
            </p>
          </div>
        )
      })()}
      <ContractBlock name="MiMC" state={mimcState} />
      <ContractBlock name="Groth16VotingVerifier" state={groth16State} />
      <CodeBlock name="Groth16Voting.circom" state={groth16CircuitState} language="c" />

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
