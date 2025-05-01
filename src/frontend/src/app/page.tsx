'use client'

import { useEffect, useState, useCallback } from 'react'
import Web3 from 'web3'
import Main from '../components/Main'
import accessPOContract from '../web3/accessPOracle'

interface AppState {
  account: string
  totalBalance: string
  ethBalance: string
  tokenBalance: string
  loading: boolean
  errorFetch: string | null
  selectedAddress: string | undefined
}

export default function Home() {
  const [web3, setWeb3] = useState<Web3 | null>(null)
  const [state, setState] = useState<AppState>({
    account: '',
    totalBalance: '0',
    ethBalance: '0',
    tokenBalance: '0',
    loading: true,
    errorFetch: null,
    selectedAddress: undefined
  })
  const [wethPrice, setWethPrice] = useState<string>('1')

  const initWeb3 = useCallback(async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const web3Instance = new Web3(window.ethereum)
        setWeb3(web3Instance)
        
        // Get accounts
        const accounts = await web3Instance.eth.getAccounts()
        const ethBal = await web3Instance.eth.getBalance(accounts[0])

        setState(prev => ({
          ...prev,
          loading: false,
          account: accounts[0],
          totalBalance: "0",
          tokenBalance: "0",
          ethBalance: ethBal.toString(),
          selectedAddress: accounts[0]
        }))

        // Handle account changes
        window.ethereum.on('accountsChanged', function (accounts: string[]) {
          setState(prev => ({
            ...prev,
            account: accounts[0],
            selectedAddress: accounts[0]
          }))
        })

        // Access price oracle contract
        try {
          // implement your accessPOContract functionality here
          const wethPrice = await accessPOContract(web3Instance)
          setWethPrice(web3Instance.utils.fromWei(wethPrice, 'ether'))
        } catch (error) {
          console.error('Error accessing price oracle:', error)
        }

      } catch (error) {
        console.error('User denied account access')
        setState(prev => ({ ...prev, loading: false, errorFetch: 'User denied account access' }))
      }
    } else {
      console.log('Please install MetaMask!')
      setState(prev => ({ ...prev, loading: false, errorFetch: 'Please install MetaMask!' }))
    }
  }, [])

  useEffect(() => {
    initWeb3()
  }, [initWeb3])

  const calcTotal = useCallback(async (
    etherAmount: number,
    etherWeight: number,
    daiAmount: number,
    daiWeight: number,
    tokenAmount: number,
    tokenWeight: number
  ) => {
    try {
      const totalWeight = etherWeight + daiWeight + tokenWeight
      const totalBal = (
        parseFloat(wethPrice) * etherAmount * etherWeight +
        daiAmount * daiWeight +
        tokenAmount * tokenWeight
      )
      
      setState(prev => ({
        ...prev,
        totalBalance: totalBal.toString()
      }))
    } catch (err: any) {
      console.error('Error:', err.message)
      setState(prev => ({
        ...prev,
        loading: false,
        errorFetch: err.message
      }))
    }
  }, [wethPrice])

  if (!state.selectedAddress) {
    return (
      <div className="text-center py-5">
        <button 
          className="btn btn-primary"
          onClick={initWeb3}
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  if (state.loading) {
    return <p id="loader" className="text-center">Loading...</p>
  }

  return (
    <div className="App container py-5">
      <div className="mb-4">
        Welcome <b>{state.selectedAddress}</b>
      </div>

      <Main
        web3={web3!}
        account={state.account}
        totalBalance={state.totalBalance}
        calcTotal={calcTotal}
      />
      
      {state.errorFetch && (
        <div className="alert alert-danger mt-4" role="alert">
          {state.errorFetch}
        </div>
      )}
    </div>
  )
} 