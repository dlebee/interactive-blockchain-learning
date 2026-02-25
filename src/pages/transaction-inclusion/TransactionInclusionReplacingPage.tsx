import { Link } from 'react-router-dom'
import { ReplaceCancelDemo } from './ReplaceCancelDemo'
import { CancelDemo } from './CancelDemo'

export function TransactionInclusionReplacingPage() {
  return (
    <div className="page">
      <h1>Replacing and cancelling</h1>
      <p className="lead">
        Same nonce, new transaction. Overrides the old one. Usually requires a higher fee.
      </p>

      <h2 id="mechanism">
        <a href="#mechanism" className="anchor-link" aria-label="Link to this section">
          How it works
        </a>
      </h2>
      <p>
        Replace and cancel both work by resubmitting with the same nonce. The new tx overrides the old. One nonce, one tx. Replace: same operation, higher fee. Cancel: 0 transfer to yourself, you pay the fee to free the slot.
      </p>
      <p>
        Only works while the tx is in the mempool. Once confirmed, it is final.
      </p>

      <h2 id="why-replace">
        <a href="#why-replace" className="anchor-link" aria-label="Link to this section">
          Why replace?
        </a>
      </h2>
      <p>
        Fees spike when many users submit at once. Your low-fee tx stays deprioritized while blocks keep filling with higher bids. Replace with a higher fee to get included.
      </p>

      <ReplaceCancelDemo />

      <h2 id="cancel">
        <a href="#cancel" className="anchor-link" aria-label="Link to this section">
          Cancel
        </a>
      </h2>
      <p>Same nonce, 0 → self. You pay the fee to free the slot.</p>
      <CancelDemo />

      <p className="page-next-link">
        <Link to="/transaction-inclusion">Back to Transaction Inclusion</Link>
        {' · '}
        <Link to="/transaction-inclusion/nonce">Nonce</Link>
      </p>
    </div>
  )
}
