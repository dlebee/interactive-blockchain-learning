import { Link } from 'react-router-dom'
import { AsymmetricDemo } from './AsymmetricDemo'

export function AccountPage() {
  return (
    <div className="page">
      <h1>Accounts</h1>
      <p className="lead">
        Hold on, we are moving too quickly, jumping from blocks to transactions
        to accounts. Blockchains need a way to identify ownership of value.
      </p>
      <p>
        For this, they rely on <strong>cryptography</strong>, specifically{' '}
        <strong>asymmetric cryptography</strong>. Asymmetric cryptography
        allows users to sign information using a secret key known as the{' '}
        <strong>private key</strong>. Additionally, there is something called
        the <strong>public key</strong>.
      </p>
      <p>
        Since a public key is a series of bytes, blockchains often transform it
        into a more readable format, usually called an{' '}
        <strong>address</strong> (or sometimes a public address). This address
        functions similarly to an account number or ID in traditional software or
        banking systems.
      </p>
      <p>
        Asymmetric encryption enables users to sign information, and others can
        verify that this signed information is indeed tied to the public
        address. Crucially, it ensures the signature could only have been
        created by someone who possesses the corresponding private key (the
        secret).
      </p>
      <p>
        This is why, in blockchain, securing your private key is of utmost
        importance. Best practices for safeguarding it will be addressed in
        later topics.
      </p>
      <p>Click Next to walk through a signed message and what happens when it is tampered with.</p>
      <AsymmetricDemo />
      <p className="page-next-link">
        <Link to="/wallets">Wallets</Link>
        {' · '}
        <Link to="/operators-users">Operators & Users</Link>
      </p>
    </div>
  )
}
