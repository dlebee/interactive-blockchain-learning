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
import {
  compileSpotFeed,
  runAllSimulations,
  type SimulationResult,
} from './runSpotFeedSimulation'
import { fetchSpotFeedSource } from './spotFeedSource'
import './BasicBatchingPage.css'

type CompileState =
  | { status: 'idle' }
  | { status: 'compiling' }
  | { status: 'ready'; bytecode: string; abi: readonly unknown[] }
  | { status: 'error'; message: string }

type SourceState = { status: 'loading' } | { status: 'ready'; source: string } | { status: 'error'; message: string }

const BASE_COST_GAS = 21_000
const STORAGE_KEY = 'batching-sim-result'
const CHART_COLORS = {
  totalGas: 'rgba(6, 182, 212, 0.85)',
  totalGasWarm: 'rgba(251, 191, 36, 0.85)',
  totalSavings: 'rgba(134, 239, 172, 0.85)',
  grid: 'rgba(148, 163, 184, 0.15)',
  axis: 'rgba(148, 163, 184, 0.8)',
}

function loadStoredResult(): SimulationResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Array<
      | { batchSize: number; ok: true; gasUsed: string; gasUsedWarm?: string }
      | { batchSize: number; ok: false; error: string }
    >
    return parsed.map((r) =>
      r.ok
        ? {
            ...r,
            gasUsed: BigInt(r.gasUsed),
            gasUsedWarm: r.gasUsedWarm != null ? BigInt(r.gasUsedWarm) : undefined,
          }
        : r
    ) as SimulationResult
  } catch {
    return null
  }
}

function saveResult(result: SimulationResult) {
  const serializable = result.map((r) =>
    r.ok
      ? { ...r, gasUsed: String(r.gasUsed), gasUsedWarm: r.gasUsedWarm != null ? String(r.gasUsedWarm) : undefined }
      : r
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
}

export function BasicBatchingPage() {
  const [sourceState, setSourceState] = useState<SourceState>({ status: 'loading' })
  const [compileState, setCompileState] = useState<CompileState>({ status: 'idle' })
  const [simResult, setSimResult] = useState<SimulationResult | null>(() =>
    loadStoredResult()
  )
  const [simError, setSimError] = useState<string | null>(null)
  const [runningSim, setRunningSim] = useState(false)
  const [simProgress, setSimProgress] = useState<{
    completed: number
    total: number
    batchSize: number
  } | null>(null)

  useEffect(() => {
    fetchSpotFeedSource()
      .then((source) => setSourceState({ status: 'ready', source }))
      .catch((e) => setSourceState({ status: 'error', message: e instanceof Error ? e.message : String(e) }))
  }, [])

  const isCompiled = compileState.status === 'ready'
  const bytecode = compileState.status === 'ready' ? compileState.bytecode : ''
  const abi = compileState.status === 'ready' ? compileState.abi : []
  const contractSource = sourceState.status === 'ready' ? sourceState.source : ''

  const handleCompile = async () => {
    if (sourceState.status !== 'ready') return
    setCompileState({ status: 'compiling' })
    try {
      const { bytecode: bc, abi: a } = await compileSpotFeed(sourceState.source)
      setCompileState({ status: 'ready', bytecode: bc, abi: a })
      setSimError(null)
    } catch (e) {
      setCompileState({
        status: 'error',
        message: e instanceof Error ? e.message : String(e),
      })
    }
  }

  const handleSimulate = async () => {
    if (!isCompiled) return
    setSimResult(null)
    setRunningSim(true)
    setSimProgress(null)
    setSimError(null)
    try {
      const results = await runAllSimulations(
        bytecode,
        abi,
        (completed, total, batchSize) =>
          setSimProgress({ completed, total, batchSize })
      )
      setSimResult(results)
      saveResult(results)
    } catch (e) {
      setSimResult(null)
      setSimError(e instanceof Error ? e.message : String(e))
      console.error('Simulation failed', e)
    } finally {
      setRunningSim(false)
      setSimProgress(null)
    }
  }

  const succeededResults = simResult?.filter((r): r is Extract<typeof r, { ok: true }> => r.ok) ?? []
  const hasWarmData = succeededResults.some((r) => r.gasUsedWarm != null)

  return (
    <div className="page">
      <h1 id="basic-batching">
        <a href="#basic-batching" className="anchor-link" aria-label="Link to this section">
          Basic Batching
        </a>
      </h1>
      <p className="lead">
        Batching multiple updates in one transaction saves the <strong>base cost</strong> of the
        transaction. Instead of paying the fixed overhead (e.g. 21,000 gas) once per update, you
        pay it once for the whole batch. This demo compiles a spot feed contract in the browser
        and simulates gas with varied token pairs (including native ETH). One click runs all
        batch sizes and plots the gains.
      </p>

      <div className="gas-code-collapse batching-contract-panel">
        <details>
          <summary>SpotFeed.sol</summary>
          <div className="gas-code-block">
            {sourceState.status === 'loading' && (
              <p className="batching-source-loading">Loading contract…</p>
            )}
            {sourceState.status === 'error' && (
              <p className="batching-compile-error" role="alert">
                {sourceState.message}
              </p>
            )}
            {sourceState.status === 'ready' && (
              <SyntaxHighlighter
                language="solidity"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem 1.25rem',
                  borderRadius: '0 0 8px 8px',
                  fontSize: '0.85rem',
                }}
                codeTagProps={{ style: { fontFamily: 'ui-monospace, monospace' } }}
              >
                {contractSource}
              </SyntaxHighlighter>
            )}
          </div>
        </details>
      </div>

      <div className="batching-compile-section">
        <button
          type="button"
          className="batching-compile-btn"
          onClick={handleCompile}
          disabled={sourceState.status !== 'ready' || compileState.status === 'compiling'}
        >
          {compileState.status === 'compiling' ? 'Compiling…' : 'Compile'}
        </button>
        {compileState.status === 'error' && (
          <p className="batching-compile-error" role="alert">
            {compileState.message}
          </p>
        )}
        {compileState.status === 'ready' && (
          <p className="batching-compile-ok">Compiled. You can run simulations below.</p>
        )}
      </div>

      <h2 id="simulate-gas">
        <a href="#simulate-gas" className="anchor-link" aria-label="Link to this section">
          Simulate gas
        </a>
      </h2>
      <p>
        Simulations use varied token pairs (including native ETH) and different spot prices.
        One button runs all batch sizes and shows gas gains in the chart below.
      </p>
      {!isCompiled && (
        <p className="batching-compile-first">Compile first to enable simulation.</p>
      )}
      <div className="batching-sim-section">
        {simError && (
          <p className="batching-compile-error" role="alert">
            Simulation failed: {simError}
          </p>
        )}
        <div className="batching-sim-row">
          <button
            type="button"
            className="batching-sim-btn batching-sim-btn-primary"
            disabled={!isCompiled || runningSim}
            onClick={handleSimulate}
          >
            {runningSim ? 'Simulating…' : 'Simulate'}
          </button>
          {runningSim && simProgress != null && (
            <div className="batching-progress-wrap">
              <div
                className="batching-progress-bar"
                role="progressbar"
                aria-valuenow={simProgress.completed}
                aria-valuemin={0}
                aria-valuemax={simProgress.total}
                aria-label={`Simulation progress: ${simProgress.completed} of ${simProgress.total} (batch size ${simProgress.batchSize})`}
              >
                <div
                  className="batching-progress-fill"
                  style={{
                    width: `${(100 * simProgress.completed) / simProgress.total}%`,
                  }}
                />
              </div>
              <span className="batching-progress-label">
                {simProgress.completed} / {simProgress.total} (batch {simProgress.batchSize})
              </span>
            </div>
          )}
        </div>
        {simResult && simResult.length > 0 && (
          <>
            <div className="batching-table-wrap">
              <table className="batching-table">
                <thead>
                  <tr>
                    <th>Batch size</th>
                    <th>Status</th>
                    {hasWarmData ? (
                      <>
                        <th>Gas (cold)</th>
                        <th>Gas (warm)</th>
                      </>
                    ) : (
                      <th>Gas / Error</th>
                    )}
                    <th>Savings (21k × (N−1))</th>
                  </tr>
                </thead>
                <tbody>
                  {simResult.map((r) => (
                    <tr key={r.batchSize} className={r.ok ? '' : 'batching-row-failed'}>
                      <td>{r.batchSize}</td>
                      <td>{r.ok ? 'OK' : 'Failed'}</td>
                      {hasWarmData ? (
                        <>
                          <td>{r.ok ? r.gasUsed.toLocaleString() : r.error}</td>
                          <td>
                            {r.ok
                              ? r.gasUsedWarm != null
                                ? r.gasUsedWarm.toLocaleString()
                                : r.gasUsed.toLocaleString()
                              : r.error}
                          </td>
                        </>
                      ) : (
                        <td>
                          {r.ok ? r.gasUsed.toLocaleString() : r.error}
                        </td>
                      )}
                      <td>
                        {((r.batchSize - 1) * BASE_COST_GAS).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {succeededResults.length > 0 && (
              <div className="batching-chart-wrap">
                <h3 className="batching-chart-title">
                  Total gas and savings by batch size
                </h3>
                <ResponsiveContainer width="100%" height={520}>
                  <LineChart
                    data={succeededResults.map((r) => ({
                      batchSize: r.batchSize,
                      totalGas: Number(r.gasUsed),
                      totalGasWarm:
                        r.gasUsedWarm != null ? Number(r.gasUsedWarm) : undefined,
                      totalSavings: (r.batchSize - 1) * BASE_COST_GAS,
                    }))}
                    margin={{ top: 36, right: 24, left: 0, bottom: 28 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_COLORS.grid}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="batchSize"
                      stroke={CHART_COLORS.axis}
                      tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                      tickLine={{ stroke: CHART_COLORS.axis }}
                      axisLine={{ stroke: CHART_COLORS.axis }}
                      label={{
                        value: 'Batch size',
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
                      formatter={(value: number | undefined, name?: string) => [
                        value != null ? value.toLocaleString() : 'n/a',
                        name === 'totalGas'
                          ? 'Total gas (cold)'
                          : name === 'totalGasWarm'
                            ? 'Total gas (warm)'
                            : 'Total savings',
                      ]}
                      labelFormatter={(label) => `Batch size: ${label}`}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 8 }} />
                    <Line
                      type="monotone"
                      dataKey="totalGas"
                      stroke={CHART_COLORS.totalGas}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.totalGas }}
                      name="Total gas (cold, new slots)"
                      isAnimationActive={false}
                    />
                    {hasWarmData && (
                      <Line
                        type="monotone"
                        dataKey="totalGasWarm"
                        stroke={CHART_COLORS.totalGasWarm}
                        strokeWidth={2}
                        dot={{ fill: CHART_COLORS.totalGasWarm }}
                        name="Total gas (warm, slots exist)"
                        isAnimationActive={false}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="totalSavings"
                      stroke={CHART_COLORS.totalSavings}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.totalSavings }}
                      name="Total savings (21k base × (N−1))"
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="batching-chart-caption">
                  Cold = first write to each storage slot. Warm = updating slots that already exist (second run).
                  Total savings = (N − 1) × 21,000 gas vs N separate txs.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <p className="batching-summary">
        Batching allows saving the base cost of the transaction: one tx pays the fixed overhead
        once instead of once per update.
      </p>

      <p className="page-next-link">
        <Link to="/advanced-topics/batching">Batching</Link>
        {' · '}
        <Link to="/advanced-topics">Advanced Topics</Link>
      </p>
    </div>
  )
}
