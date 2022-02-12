/* Contract address */
const address = "0xA26F05aE0E0a4d3dE028785eAb1b9E491950b5e8"

/* Contract abi code */
const abi = [
   {
     "inputs": [],
     "payable": false,
     "stateMutability": "nonpayable",
     "type": "constructor"
   },
   {
     "anonymous": false,
     "inputs": [
       {
         "indexed": false,
         "internalType": "uint256",
         "name": "pWeth",
         "type": "uint256"
       },
       {
         "indexed": false,
         "internalType": "uint256",
         "name": "pWethArrayIndex",
         "type": "uint256"
       }
     ],
     "name": "LOG_WETH_PRICE",
     "type": "event"
   },
   {
     "constant": false,
     "inputs": [
       {
         "internalType": "uint256",
         "name": "arg1",
         "type": "uint256"
       }
     ],
     "name": "inputWethPrice",
     "outputs": [],
     "payable": false,
     "stateMutability": "nonpayable",
     "type": "function"
   },
   {
     "constant": false,
     "inputs": [],
     "name": "calcWethPrice",
     "outputs": [],
     "payable": false,
     "stateMutability": "nonpayable",
     "type": "function"
   },
   {
     "constant": true,
     "inputs": [],
     "name": "getWethPrice",
     "outputs": [
       {
         "internalType": "uint256",
         "name": "",
         "type": "uint256"
       }
     ],
     "payable": false,
     "stateMutability": "view",
     "type": "function"
   }
]

const accessPOContract = async (web3) => {
  let contInst = await new web3.eth.Contract(
    abi, address
  )
  console.log(contInst)
  let accounts = await web3.eth.getAccounts()
  //set weth price
  await contInst.methods.inputWethPrice(web3.utils.toWei('5')).send({from: accounts[0]})
  await contInst.methods.inputWethPrice(web3.utils.toWei('5')).send({from: accounts[0]})
  await contInst.methods.calcWethPrice().send({from: accounts[0]})
  const wethPrice = await contInst.methods.getWethPrice().call()

  return wethPrice
};

export default accessPOContract
