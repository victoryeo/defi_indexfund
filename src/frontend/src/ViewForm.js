import React, { Component } from 'react'
import tokenLogo from './images/token-logo.png'
import ethLogo from './images/eth-logo.png'

class ViewForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      output: '0'
    }
  }

  render() {
    return (
      <form className="mb-3" onSubmit={(event) => {
          event.preventDefault()
        }}>
        <div>
          <label className="float-left"><b>Fund</b></label>
          <span className="float-right text-muted">
            Balance: {window.web3.utils.fromWei(this.props.totalBalance, 'Ether')}
          </span>
        </div>  
      </form>
    );
  }
}

export default ViewForm;