import { useState, useEffect } from 'react'
import './AsymmetricDemo.css'

const ORIGINAL_MESSAGE = 'Send 10 tokens to Bob'
const TAMPERED_MESSAGE = 'Send 10,000 tokens to Eve'

async function generateKeyPair() {
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  )
  return { publicKey, privateKey }
}

async function publicKeyToAddress(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', exported)
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return '0x' + hashHex.slice(0, 16)
}

async function signMessage(
  privateKey: CryptoKey,
  message: string
): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    data
  )
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

interface StepConfig {
  title: string
  text: string
  showAddress?: boolean
  showSigned?: boolean
  showVerified?: boolean
  showTampered?: boolean
  showMismatch?: boolean
}

const STEPS: StepConfig[] = [
  {
    title: 'Your identity',
    text: 'Each account has a public address, derived from a public key. You can share this address. It works like an account number.',
    showAddress: true,
  },
  {
    title: 'A signed message',
    text: 'When you send a transaction, you sign it with your private key. Only someone with that key can create a valid signature. Here is a message that was signed.',
    showAddress: true,
    showSigned: true,
  },
  {
    title: 'Verification passes',
    text: 'Anyone with the message, signature, and address can verify that the signature is valid. They never need the private key.',
    showAddress: true,
    showSigned: true,
    showVerified: true,
  },
  {
    title: 'Tampering breaks it',
    text: 'Someone alters the message. The signature no longer matches. Verification fails. This is why signatures protect against tampering.',
    showAddress: true,
    showSigned: true,
    showTampered: true,
    showMismatch: true,
  },
  {
    title: 'Takeaway',
    text: 'Asymmetric encryption lets you prove ownership without revealing your secret. Secure your private key; it is the only way to sign on behalf of your address.',
    showAddress: true,
  },
]

export function AsymmetricDemo() {
  const [step, setStep] = useState(0)
  const [address, setAddress] = useState<string>('')
  const [signature, setSignature] = useState<string>('')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const showComparison =
    current.showTampered === true && current.showMismatch === true

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const { publicKey, privateKey } = await generateKeyPair()
        if (cancelled) return
        const addr = await publicKeyToAddress(publicKey)
        const sig = await signMessage(privateKey, ORIGINAL_MESSAGE)
        setAddress(addr)
        setSignature(sig)
        setReady(true)
      } catch {
        if (!cancelled) setError('Failed to generate keys')
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return <div className="asymmetric-demo error-state">{error}</div>
  }

  if (!ready) {
    return (
      <div className="asymmetric-demo">
        <div className="asymmetric-demo-loading">Generating keypair…</div>
      </div>
    )
  }

  return (
    <div className="asymmetric-demo">
      <div className="asymmetric-demo-card">
        <h3>{current.title}</h3>
        <p className="asymmetric-demo-text">{current.text}</p>

        <div className="asymmetric-demo-visual">
          {current.showAddress && (
            <div className="signed-piece address-piece">
              <span className="piece-label">Public address</span>
              <code>{address}</code>
            </div>
          )}
          {current.showSigned && !showComparison && (
            <>
              <div className="signed-piece message-piece">
                <span className="piece-label">Message</span>
                <code>{ORIGINAL_MESSAGE}</code>
              </div>
              <div className="signed-piece signature-piece">
                <span className="piece-label">Signature</span>
                <code>{signature.slice(0, 24)}…</code>
              </div>
            </>
          )}
          {showComparison && (
            <div className="comparison-row">
              <div className="comparison-card original">
                <span className="comparison-label">Original (valid)</span>
                <div className="signed-piece message-piece">
                  <span className="piece-label">Message</span>
                  <code>{ORIGINAL_MESSAGE}</code>
                </div>
                <div className="signed-piece signature-piece">
                  <span className="piece-label">Signature</span>
                  <code>{signature.slice(0, 24)}…</code>
                </div>
                <div className="verification-badge valid">
                  <span className="verification-icon">✓</span> Message and signature match
                </div>
              </div>
              <div className="comparison-arrow" aria-hidden>
                ≠
              </div>
              <div className="comparison-card tampered">
                <span className="comparison-label">Tampered (invalid)</span>
                <div className="signed-piece message-piece">
                  <span className="piece-label">Message</span>
                  <code className="tampered">{TAMPERED_MESSAGE}</code>
                </div>
                <div className="signed-piece signature-piece">
                  <span className="piece-label">Same signature</span>
                  <code>{signature.slice(0, 24)}…</code>
                </div>
                <div className="verification-badge invalid">
                  <span className="verification-icon">✗</span> Message and signature do not match
                </div>
              </div>
            </div>
          )}
          {current.showVerified === true && !showComparison && (
            <div className="verification-badge valid">
              <span className="verification-icon">✓</span>
              Signature is valid
            </div>
          )}
        </div>

        {isLast && (
          <div className="algorithms-list">
            <span className="algorithms-list-title">Common schemes in use:</span>
            <ul>
              <li>
                <a
                  href="https://ethereum.org/en/developers/docs/accounts/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>ECDSA</strong>
                </a>
                {' — Ethereum'}
              </li>
              <li>
                <a
                  href="https://wiki.polkadot.network/docs/learn-cryptography"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>SR25519</strong>
                </a>
                {' — Polkadot ecosystem'}
              </li>
              <li>
                <a
                  href="https://en.wikipedia.org/wiki/EdDSA"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>ED25519</strong>
                </a>
                {' — Peer to peer'}
              </li>
            </ul>
          </div>
        )}

        <div className="asymmetric-demo-actions">
          {!isLast ? (
            <button
              type="button"
              className="next-btn"
              onClick={() =>
                setStep((s) => Math.min(s + 1, STEPS.length - 1))
              }
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="next-btn"
              onClick={() => setStep(0)}
            >
              Start over
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
