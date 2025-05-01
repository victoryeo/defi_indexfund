import { FC, useState } from 'react'
import Web3 from 'web3'

interface CreateFormProps {
  web3: Web3
  account: string
  totalBalance?: string
  calcTotal?: (
    etherAmount: number,
    etherWeight: number,
    daiAmount: number,
    daiWeight: number,
    tokenAmount: number,
    tokenWeight: number
  ) => Promise<void>
}

const CreateForm: FC<CreateFormProps> = ({ web3, account, totalBalance, calcTotal }) => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    initialSupply: '',
    etherAmount: '0',
    etherWeight: '0',
    daiAmount: '0',
    daiWeight: '0',
    tokenAmount: '0',
    tokenWeight: '0'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Add your contract interaction logic here
    console.log('Form submitted:', formData)
    if (calcTotal) {
      await calcTotal(
        parseFloat(formData.etherAmount),
        parseFloat(formData.etherWeight),
        parseFloat(formData.daiAmount),
        parseFloat(formData.daiWeight),
        parseFloat(formData.tokenAmount),
        parseFloat(formData.tokenWeight)
      )
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Create New Index Fund</h5>
        {totalBalance && (
          <p className="card-text mb-3">
            <small className="text-muted">Total Balance: {totalBalance}</small>
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Fund Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="symbol" className="form-label">
              Fund Symbol
            </label>
            <input
              type="text"
              className="form-control"
              id="symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="initialSupply" className="form-label">
              Initial Supply
            </label>
            <input
              type="number"
              className="form-control"
              id="initialSupply"
              name="initialSupply"
              value={formData.initialSupply}
              onChange={handleChange}
              required
            />
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="etherAmount" className="form-label">
                  Ether Amount
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="etherAmount"
                  name="etherAmount"
                  value={formData.etherAmount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="etherWeight" className="form-label">
                  Ether Weight
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="etherWeight"
                  name="etherWeight"
                  value={formData.etherWeight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="daiAmount" className="form-label">
                  DAI Amount
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="daiAmount"
                  name="daiAmount"
                  value={formData.daiAmount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="daiWeight" className="form-label">
                  DAI Weight
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="daiWeight"
                  name="daiWeight"
                  value={formData.daiWeight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="tokenAmount" className="form-label">
                  Token Amount
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="tokenAmount"
                  name="tokenAmount"
                  value={formData.tokenAmount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="tokenWeight" className="form-label">
                  Token Weight
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="tokenWeight"
                  name="tokenWeight"
                  value={formData.tokenWeight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Create Fund
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateForm 