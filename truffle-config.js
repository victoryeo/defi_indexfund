const HDWalletProvider = require('@truffle/hdwallet-provider');

const fs = require('fs');
const mnemonic = JSON.parse(fs.readFileSync(".secret.json").toString().trim());
console.log(mnemonic)
console.log(mnemonic["mnemonic"])

module.exports = {
  // Uncommenting the defaults below 
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*",
      gas: 100000000,
    },
    rinkeby: {
      provider: () => new HDWalletProvider(
        mnemonic["mnemonic"], `wss://eth-rinkeby.alchemyapi.io/v2/LD7o_ybolRcgiL5t7k0b0tjpe7dIpk7l`
      ),
      network_id: 4,       
      gas: 5500000,        
      //confirmations: 2,
      networkCheckTimeout: 1000000,    
      timeoutBlocks: 200, 
      skipDryRun: true     
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 9555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
  },
  plugins: ["solidity-coverage"],
  contracts_directory: './src/contracts/',
  contracts_build_directory: './build/contracts/',
  // Configure your compilers
  compilers: {
      solc: {
          version: '0.8.0',
          settings: { // See the solidity docs for advice about optimization and evmVersion
              optimizer: {
                  enabled: true,
                  runs: 100,
              },
              evmVersion: 'byzantium',
          },
      },
  },  
};
