const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const CoveyLedger = artifacts.require('CoveyLedger');

module.exports = async function (deployer) {
    const existing = await CoveyLedger.deployed();
    await upgradeProxy(existing.address, CoveyLedger, {
        deployer,
    });
};
