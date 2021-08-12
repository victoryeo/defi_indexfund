const POracle = artifacts.require('POracle');
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract('POracle', async () => {
    let poracle;
    const { toWei } = web3.utils;

    before(async()=> {
        poracle = await POracle.new();
    })

    describe('Price Oracle', () => {
        it('Oracle address has a value', async () => {
            //console.log(poracle)
            truffleAssert.passes(poracle)
        });

        it('set Weth price', async () => {
            for (i = 0; i < 2; i++) {
                await poracle.inputWethPrice(toWei('5'))
            }
            await poracle.calcWethPrice()
            poracle.getPastEvents('LOG_PRICE', {fromBlock: 0, toBlock: 'latest'}, {})
                .then(function(events){
                console.log(events) 
            })
            let price = await poracle.getWethPrice()
            assert.equal(price.toString(), toWei('5'))
        });    
    })
})