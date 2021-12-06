const CoveyLedger = artifacts.require('CoveyLedger');

module.exports = function (deployer) {
    deployer.deploy(CoveyLedger);
};
