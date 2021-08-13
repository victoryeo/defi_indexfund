import React, { Component } from 'react'
import tokenLogo from './images/token-logo.png'
import ethLogo from './images/eth-logo.png'
import daiLogo from './images/dai-logo.png'

class CreateForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      etherAmount: '0',
      etherWeight: '0',
      daiAmount: '0',
      daiWeight: '0',
      tokenAmount: '0',
      tokenWeight: '0'
    }
  }

  render() {
    return (
      <form className="mb-3" onSubmit={(event) => {
          event.preventDefault()
          let etherAmount = this.inputEthAmount.value.toString()
          console.log(etherAmount)
          let etherWeight = this.inputEthWeight.value.toString()
          console.log(etherWeight)
          let daiAmount = this.inputDaiAmount.value.toString()
          let daiWeight = this.inputDaiWeight.value.toString()
          let tokenAmount = this.inputTokenAmount.value.toString()
          let tokenWeight = this.inputTokenWeight.value.toString()
          this.props.calcTotal(etherAmount, etherWeight,
            daiAmount, daiWeight, tokenAmount, tokenWeight)
        }}>

        <div>
          <label className="float-left"><b>Input 1&nbsp;</b></label>
          <span className="float-right text-muted">
            Ether
          </span>
        </div>
        <div className="input-group mb-4">
          Amount
          <input
            type="text"
            onChange={(event) => {
              const etherAmount = this.inputEthAmount.value.toString()
              this.setState({
                etherAmount: etherAmount 
              })
            }}
            ref={(input) => { this.inputEthAmount = input }}
            className="form-control form-control-lg"
            placeholder="0"
            required />
          &nbsp;
          Weight
          <input
            type="text"
            onChange={(event) => {
              const etherWeight = this.inputEthWeight.value.toString()
              this.setState({
                etherWeight: etherWeight
              })
            }}
            ref={(input) => { this.inputEthWeight = input }}
            className="form-control form-control-lg"
            placeholder="0"
            required />  
          <div className="input-group-append">
            <div className="input-group-text">
              <img src={ethLogo} height='32' alt=""/>
              &nbsp;&nbsp;&nbsp; ETH
            </div>
          </div>
        </div>
        <span className="text-muted">&nbsp;</span>
        <div>
          <label className="float-left"><b>Input 2&nbsp;</b></label>
          <span className="float-right text-muted">
            DAI
          </span>
        </div>
        <div className="input-group mb-2">
          Amount
          <input
            type="text"
            onChange={(event) => {
              const daiAmount = this.inputDaiAmount.value.toString()
              this.setState({
                daiAmount: daiAmount
              })
            }}
            ref={(input) => { this.inputDaiAmount = input }}
            className="form-control form-control-lg"
            placeholder="0"
            required />
          &nbsp;
          Weight
          <input
            type="text"
            onChange={(event) => {
              const daiWeight = this.inputDaiWeight.value.toString()
              this.setState({
                daiWeight: daiWeight
              })
            }}
            ref={(input) => { this.inputDaiWeight = input }}
            className="form-control form-control-lg"
            placeholder="0"
            required /> 
          <div className="input-group-append">
            <div className="input-group-text">
              <img src={daiLogo} height='32' alt=""/>
              &nbsp; DAI
            </div>
          </div>
        </div>
        <span className="text-muted">&nbsp;</span>
        <div>
          <label className="float-left"><b>Input 3&nbsp;</b></label>
          <span className="float-right text-muted">
            Token
          </span>
        </div>
        <div className="input-group mb-2">
          Amount
          <input
            type="text"
            onChange={(event) => {
              const tokenAmount = this.inputTokenAmount.value.toString()
              this.setState({
                tokenAmount: tokenAmount
              })
            }}
            ref={(input) => { this.inputTokenAmount = input }}
            className="form-control form-control-lg"
            placeholder="0"
            required />
          &nbsp;
          Weight
          <input
            type="text"
            onChange={(event) => {
              const tokenWeight = this.inputTokenWeight.value.toString()
              this.setState({
                tokenWeight: tokenWeight
              })
            }}
            ref={(input) => { this.inputTokenWeight = input }}
            className="form-control form-control-lg"
            placeholder="0"
            required /> 
          <div className="input-group-append">
            <div className="input-group-text">
              <img src={tokenLogo} height='32' alt=""/>
              &nbsp; Token
            </div>
          </div>
        </div>
        <span className="text-muted">&nbsp;</span>
        <div className="mb-5">
          <span className="float-left text-muted">Fund Component</span>
        </div>
        <button type="submit" id="btn-buy" className="btn btn-primary btn-block btn-lg">Confirm!</button>
      </form>
    );
  }
}

export default CreateForm;