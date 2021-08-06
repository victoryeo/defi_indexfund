const TMath = artifacts.require('TMath');
const BToken = artifacts.require('BToken');
const BFactory = artifacts.require('BFactory');
const BConst = artifacts.require('BConst');

module.exports = async function (deployer, network, accounts) {
    if (network === 'development' || network === 'coverage') {
        deployer.deploy(TMath);
    }
    deployer.deploy(BConst);
    deployer.deploy(BFactory);
};

