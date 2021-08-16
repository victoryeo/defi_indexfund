/* Contract address */
const address = "0x67B5656d60a809915323Bf2C40A8bEF15A152e3e"

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

   return contInst
};

export default accessPOContract
