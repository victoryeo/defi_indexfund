import { FC, useState } from 'react'
import Web3 from 'web3'

interface ViewFormProps {
  web3: Web3
  account: string
  totalBalance?: string
}

const ViewForm: FC<ViewFormProps> = ({ web3, account, totalBalance }) => {
  const [fundAddress, setFundAddress] = useState('')
  const [fundInfo, setFundInfo] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Add your contract interaction logic here to fetch fund information
    console.log('Viewing fund at address:', fundAddress)
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">View Index Fund</h5>
        {totalBalance && (
          <p className="card-text mb-3">
            <small className="text-muted">Total Balance: {totalBalance}</small>
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="fundAddress" className="form-label">
              Fund Address
            </label>
            <input
              type="text"
              className="form-control"
              id="fundAddress"
              value={fundAddress}
              onChange={(e) => setFundAddress(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            View Fund
          </button>
        </form>

        {fundInfo && (
          <div className="mt-4">
            <h6>Fund Information</h6>
            <pre>{JSON.stringify(fundInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewForm 