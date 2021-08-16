import React, { Component } from 'react'
import './App.css'
import Main from './Main'
import getWeb3 from './web3/getWeb3'
import accessPOContract from './web3/accessPOracle'
import { ConnectWallet } from './web3/ConnectWallet'
import connectMetamaskWallet from './web3/connectMetamaskWallet'

class App extends Component {
  constructor(props) {
    console.log('constructor')
    super(props)
    this.state = {
      account: '',
      totalBalance: '0',
      ethBalance: '0',
      tokenBalance: '0',
      loading: true,
      errorFetch: null,
      selectedAddress: undefined,
    }
    this.web3 = null
    this.wethPrice = 1
  }

  async componentDidMount() {
    console.log('componentDidMount')
    try {
      this.web3 = await getWeb3
    } catch( err ) {
      console.warn('Error in web3 initialization.', err)
    }

    if (this.web3) {
      console.log(this.web3)
      let accounts = await this.web3.eth.getAccounts()
      console.log(accounts)

      let ethBal = await this.web3.eth.getBalance(accounts[0])
      console.log(ethBal)
      
      this.setState({
	      loading: false,
        account: accounts[0],
        totalBalance: "0",
        tokenBalance: "0",
        ethBalance: ethBal.toString()
      })

      //access price oracle contract
      const wethPrice = await accessPOContract(this.web3)
      console.log(this.web3.utils.fromWei(wethPrice))

      this.wethPrice = this.web3.utils.fromWei(wethPrice)
    }
  }

  calcTotal = async (etherAmount, etherWeight, daiAmount, daiWeight,
      tokenAmount, tokenWeight) => {
    let totalBal;
    let totalWeight = etherWeight + daiWeight + tokenWeight
    totalBal = (this.wethPrice*etherAmount*etherWeight +
      daiAmount * daiWeight + tokenAmount * tokenWeight) 
    try {
      this.setState({
         totalBalance: totalBal,
      })
    }      
    catch (err) {
      console.error('Error ',err.message)
      this.setState({ loading: false , errorFetch: err.message })
    }
  }

  _connect = async() => {
    const userAddr = await connectMetamaskWallet()
    console.log(userAddr)
    this.setState({selectedAddress: userAddr})
  }

  render(){
    if (!this.state.selectedAddress) {
      return (
      <ConnectWallet 
        connectWallet={() => this._connect()} 
      />
      )
    }
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        totalBalance={this.state.totalBalance}
        calcTotal={this.calcTotal}
      />
    }
    return (
      <div className="App">
        Welcome <b>{this.state.selectedAddress}</b>

        {content}
        
        { this.state.errorFetch && 
          <div style={{marginTop: 10 + 'em'}}> 
            {this.state.errorFetch} 
          </div> }

      </div>
    )
  }
}

export default App