import { FC, useState } from 'react'
import Web3 from 'web3'
import CreateForm from './CreateForm'
import ViewForm from './ViewForm'

interface MainProps {
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

const Main: FC<MainProps> = ({ web3, account, totalBalance, calcTotal }) => {
  const [currentForm, setCurrentForm] = useState<'create' | 'view'>('create')

  const content = currentForm === 'create' ? (
    <CreateForm 
      web3={web3}
      account={account}
      totalBalance={totalBalance}
      calcTotal={calcTotal}
    />
  ) : (
    <ViewForm 
      web3={web3}
      account={account}
      totalBalance={totalBalance}
    />
  )

  return (
    <div id="content" className="mt-3">
      <div className="d-flex justify-content-between mb-3">
        <button
          id="btn-buy"
          className="btn btn-light"
          onClick={() => setCurrentForm('create')}
        >
          Create Index fund
        </button>
        <span className="text-muted">&lt; &nbsp; &gt;</span>
        <button
          id="btn-sell"
          className="btn btn-light"
          onClick={() => setCurrentForm('view')}
        >
          View Index fund
        </button>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          {content}
        </div>
      </div>
    </div>
  )
}

export default Main 