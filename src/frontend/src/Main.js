import React, { Component } from 'react'
import CreateForm from './CreateForm'
import ViewForm from './ViewForm'

class Main extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentForm: 'buy'
        }
    }
    render() {
        let content
        if(this.state.currentForm === 'create') {
            content = <CreateForm
              totalBalance={this.props.totalBalance}
              getTotal={this.props.getTotal}
            />
        } else {
            content = <ViewForm
              totalBalance={this.props.totalBalance}
            />
        }
        return (
            <div id="content" className="mt-3">
                <div className="d-flex justify-content-between mb-3">
                    <button id="btn-buy"
                        className="btn btn-light"
                        onClick={(event) => {
                            this.setState({ currentForm: 'create' })
                        }}
                        >
                        Create Index fund
                    </button>
                    <span className="text-muted">&lt; &nbsp; &gt;</span>
                    <button id="btn-sell"
                        className="btn btn-light"
                        onClick={(event) => {
                            this.setState({ currentForm: 'view' })
                        }}
                        >
                        View Index fund
                    </button>                
                </div>
                <div className="card mb-4" >
                    <div className="card-body">
                        {content}
                    </div>
                </div>
            </div>
        )
    }

}

export default Main;