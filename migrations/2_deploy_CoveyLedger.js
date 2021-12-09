const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const CoveyLedger = artifacts.require('CoveyLedger');

module.exports = async function (deployer) {
    const instance = await deployProxy(CoveyLedger, { deployer });
    console.log('Deployed', instance.address);
};
