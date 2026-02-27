import { useState } from 'react'
import { createPublicClient, formatGwei, http } from 'viem'
import { mainnet } from 'viem/chains'
import './GasPriceUsdInput.css'

export interface GasPriceUsdInputProps {
  gasPriceGwei: string
  onGasPriceChange: (value: string) => void
  nativeTokenUsd: string
  onNativeTokenChange: (value: string) => void
  caption?: string
  className?: string
}

export function GasPriceUsdInput({
  gasPriceGwei,
  onGasPriceChange,
  nativeTokenUsd,
  onNativeTokenChange,
  caption,
  className = '',
}: GasPriceUsdInputProps) {
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [fetchError, setFetchError] = useState<string | null>(null)

  const handleFetch = async () => {
    setFetchStatus('loading')
    setFetchError(null)
    try {
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http(),
      })
      const block = await publicClient.getBlock()
      const baseFeeGwei = block.baseFeePerGas != null ? formatGwei(block.baseFeePerGas) : '0'
      onGasPriceChange(baseFeeGwei)

      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      )
      if (!res.ok) throw new Error('Failed to fetch ETH price')
      const data = (await res.json()) as { ethereum?: { usd?: number } }
      const ethUsd = data.ethereum?.usd
      if (ethUsd != null) {
        onNativeTokenChange(String(ethUsd))
      } else {
        throw new Error('No ETH price in response')
      }

      setFetchStatus('idle')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setFetchError(msg)
      setFetchStatus('error')
    }
  }

  return (
    <div className={`gas-price-usd-input ${className}`.trim()}>
      {caption && (
        <p className="gas-price-usd-caption">{caption}</p>
      )}
      <div className="gas-price-usd-row">
        <label htmlFor="gas-price-gwei">Gas price (GWEI)</label>
        <input
          id="gas-price-gwei"
          type="number"
          min="0"
          step="0.1"
          placeholder="e.g. 25"
          value={gasPriceGwei}
          onChange={(e) => onGasPriceChange(e.target.value)}
          className="gas-price-usd-field"
        />
        <label htmlFor="gas-price-native-usd">Native token ($)</label>
        <input
          id="gas-price-native-usd"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 3500"
          value={nativeTokenUsd}
          onChange={(e) => onNativeTokenChange(e.target.value)}
          className="gas-price-usd-field"
        />
      </div>
      <div className="gas-price-usd-row gas-price-usd-actions">
        <button
          type="button"
          className="gas-price-usd-fetch-btn"
          onClick={handleFetch}
          disabled={fetchStatus === 'loading'}
        >
          {fetchStatus === 'loading' ? 'Fetching…' : 'Fetch from Ethereum'}
        </button>
        {fetchStatus === 'error' && fetchError && (
          <span className="gas-price-usd-error">{fetchError}</span>
        )}
      </div>
    </div>
  )
}

/**
 * Convert gas amount to USD given gas price (GWEI) and native token price (USD).
 * Returns empty string if inputs are invalid.
 */
export function gasToUsd(
  gas: bigint | number,
  gasPriceGwei: string,
  nativeTokenUsd: string
): string {
  const gasPriceNum = parseFloat(gasPriceGwei)
  const nativeUsdNum = parseFloat(nativeTokenUsd)
  if (Number.isNaN(gasPriceNum) || gasPriceNum <= 0 || Number.isNaN(nativeUsdNum) || nativeUsdNum <= 0) {
    return ''
  }
  const g = typeof gas === 'bigint' ? Number(gas) : gas
  const cost = (g * gasPriceNum * 1e9 * nativeUsdNum) / 1e18
  return cost < 0.01 && cost > 0 ? '<$0.01' : `$${cost.toFixed(2)}`
}

/**
 * Check if gas price and native token USD inputs are valid for USD conversion.
 */
export function hasValidUsdInputs(gasPriceGwei: string, nativeTokenUsd: string): boolean {
  const gasPriceNum = parseFloat(gasPriceGwei)
  const nativeUsdNum = parseFloat(nativeTokenUsd)
  return !Number.isNaN(gasPriceNum) && gasPriceNum > 0 && !Number.isNaN(nativeUsdNum) && nativeUsdNum > 0
}
